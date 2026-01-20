import { getCookie, setCookie } from 'hono/cookie';
import { auth } from '~/auth';
import { verifyAccessToken } from '~/auth/jwt';
import {
  ACCESS_TOKEN_COOKIE,
  autoRefreshTokens,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from '~/auth/token-service';
import { HTTP_STATUS_CODE } from '~/constants/http-status-code';
import { createAppMiddleware } from '~/lib/factory';
import { tryCatch } from '~/lib/promise-utils';
import { AppContext } from '~/types/app-context';

/**
 * Check if request is from web client (uses cookies)
 */
function isWebClient(c: AppContext): boolean {
  const authHeader = c.req.header('Authorization');
  return !authHeader?.startsWith('Bearer ');
}

/**
 * Extract access token from request
 *
 * Supports 3 client types:
 * 1. Web clients -> HttpOnly cookie (AT + RT both in cookies, automatic)
 * 2. Mobile apps -> Authorization: Bearer <AT>
 * 3. Third-party APIs -> Authorization: Bearer <AT>
 *
 * Priority: Authorization header > Cookie
 */
function extractAccessToken(c: AppContext): string | null {
  // Try Authorization header first (App / 3rd party API)
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fall back to HttpOnly cookie (Web clients)
  const cookieToken = getCookie(c, ACCESS_TOKEN_COOKIE);
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Unified authentication middleware with auto-refresh
 *
 * Supports 3 authentication methods:
 * 1. Web -> HttpOnly cookies for AT + RT (automatic, most secure)
 * 2. App -> Bearer token in Authorization header
 * 3. 3rd Party API -> Bearer token in Authorization header
 *
 * Token refresh strategy:
 * 1. AT valid → proceed (fast, stateless)
 * 2. AT expired + RT valid → auto-refresh AT, set new cookie (web only)
 * 3. AT expired + RT >80% used → rotate RT too
 * 4. AT + RT both expired → 401 (force re-login)
 */
export const authenticate = createAppMiddleware(async (c, next) => {
  const accessToken = extractAccessToken(c);

  // Strategy 1: Try JWT access token (stateless, no DB lookup)
  if (accessToken) {
    const result = await verifyAccessToken(accessToken);

    if (result.isValid) {
      // AT is valid → proceed
      c.set('tokenPayload', result.payload);

      // Also try to get full session for compatibility
      const [, sessionObject] = await tryCatch(
        auth.api.getSession({
          headers: c.req.raw.headers,
        }),
      );

      if (sessionObject) {
        c.set('session', sessionObject);
      }

      await next();
      return;
    }

    // AT is expired → try auto-refresh for web clients
    if (result.error === 'expired' && isWebClient(c)) {
      const refreshToken = getCookie(c, REFRESH_TOKEN_COOKIE);
      const refreshResult = await autoRefreshTokens(refreshToken);

      if (refreshResult.success && refreshResult.tokens) {
        // Set new AT cookie
        setCookie(c, ACCESS_TOKEN_COOKIE, refreshResult.tokens.accessToken, getAccessTokenCookieOptions());

        // If RT was rotated (>80% used), set new RT cookie
        if (refreshResult.rotated) {
          setCookie(c, REFRESH_TOKEN_COOKIE, refreshResult.tokens.refreshToken, getRefreshTokenCookieOptions());
        }

        // Verify the new token and set payload
        const newResult = await verifyAccessToken(refreshResult.tokens.accessToken);
        if (newResult.isValid) {
          c.set('tokenPayload', newResult.payload);

          // Try to get session for compatibility
          const [, sessionObject] = await tryCatch(
            auth.api.getSession({
              headers: c.req.raw.headers,
            }),
          );

          if (sessionObject) {
            c.set('session', sessionObject);
          }

          await next();
          return;
        }
      }

      // RT is also expired/invalid → 401
      if (refreshResult.error === 'expired') {
        return c.json(
          {
            error: 'Unauthorized',
            message: 'Session has expired. Please sign in again.',
            code: 'session_expired',
          },
          HTTP_STATUS_CODE.UNAUTHORIZED,
        );
      }
    }

    // For App/API clients, return 401 on expired AT (they handle refresh themselves)
    if (result.error === 'expired') {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Access token has expired',
          code: 'token_expired',
        },
        HTTP_STATUS_CODE.UNAUTHORIZED,
      );
    }

    // Token is invalid/malformed
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Access token is invalid',
        code: 'invalid_token',
      },
      HTTP_STATUS_CODE.UNAUTHORIZED,
    );
  }

  // No AT found → try web client auto-refresh from RT only
  if (isWebClient(c)) {
    const refreshToken = getCookie(c, REFRESH_TOKEN_COOKIE);
    if (refreshToken) {
      const refreshResult = await autoRefreshTokens(refreshToken);

      if (refreshResult.success && refreshResult.tokens) {
        // Set new AT cookie
        setCookie(c, ACCESS_TOKEN_COOKIE, refreshResult.tokens.accessToken, getAccessTokenCookieOptions());

        // If RT was rotated, set new RT cookie
        if (refreshResult.rotated) {
          setCookie(c, REFRESH_TOKEN_COOKIE, refreshResult.tokens.refreshToken, getRefreshTokenCookieOptions());
        }

        // Verify and set payload
        const newResult = await verifyAccessToken(refreshResult.tokens.accessToken);
        if (newResult.isValid) {
          c.set('tokenPayload', newResult.payload);

          const [, sessionObject] = await tryCatch(
            auth.api.getSession({
              headers: c.req.raw.headers,
            }),
          );

          if (sessionObject) {
            c.set('session', sessionObject);
          }

          await next();
          return;
        }
      }
    }
  }

  // Strategy 2: Fall back to Better Auth session
  const [err, sessionObject] = await tryCatch(
    auth.api.getSession({
      headers: c.req.raw.headers,
    }),
  );

  if (err) {
    return c.json({ error: 'Internal server error' }, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
  }

  if (!sessionObject) {
    return c.json({ error: 'Unauthorized' }, HTTP_STATUS_CODE.UNAUTHORIZED);
  }

  c.set('session', sessionObject);

  await next();
});

/**
 * Require JWT access token only (no session fallback)
 * Use this for API-only endpoints that must use Bearer tokens
 */
export const requireAccessToken = createAppMiddleware(async (c, next) => {
  const accessToken = extractAccessToken(c);

  if (!accessToken) {
    return c.json({ error: 'Unauthorized', message: 'Access token is required' }, HTTP_STATUS_CODE.UNAUTHORIZED);
  }

  const result = await verifyAccessToken(accessToken);

  if (!result.isValid) {
    const errorMessages: Record<typeof result.error, string> = {
      expired: 'Access token has expired',
      invalid: 'Access token is invalid',
      malformed: 'Access token is malformed',
    };

    return c.json(
      {
        error: 'Unauthorized',
        message: errorMessages[result.error],
        code: result.error,
      },
      HTTP_STATUS_CODE.UNAUTHORIZED,
    );
  }

  c.set('tokenPayload', result.payload);
  await next();
});
