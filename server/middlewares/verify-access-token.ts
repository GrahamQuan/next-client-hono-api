import { getCookie, setCookie } from 'hono/cookie';
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

type AppContext = Parameters<Parameters<typeof createAppMiddleware>[0]>[0];

/**
 * Check if request is from web client (uses cookies)
 */
function isWebClient(c: AppContext): boolean {
  const authHeader = c.req.header('Authorization');
  return !authHeader?.startsWith('Bearer ');
}

/**
 * Extract access token from request
 * Priority: Authorization header > Cookie
 */
function extractAccessToken(c: AppContext): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fall back to cookie (web clients)
  const cookieToken = getCookie(c, ACCESS_TOKEN_COOKIE);
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Try to auto-refresh tokens for web clients
 * Returns the new access token if successful
 */
async function tryAutoRefresh(c: AppContext): Promise<string | null> {
  if (!isWebClient(c)) return null;

  const refreshToken = getCookie(c, REFRESH_TOKEN_COOKIE);
  if (!refreshToken) return null;

  const refreshResult = await autoRefreshTokens(refreshToken);

  if (refreshResult.success && refreshResult.tokens) {
    // Set new AT cookie
    setCookie(c, ACCESS_TOKEN_COOKIE, refreshResult.tokens.accessToken, getAccessTokenCookieOptions());

    // If RT was rotated (>80% used), set new RT cookie
    if (refreshResult.rotated) {
      setCookie(c, REFRESH_TOKEN_COOKIE, refreshResult.tokens.refreshToken, getRefreshTokenCookieOptions());
    }

    return refreshResult.tokens.accessToken;
  }

  return null;
}

/**
 * Middleware to verify JWT access token with auto-refresh
 * Sets user info in context if valid
 * Returns 401 if token is missing, expired, or invalid
 *
 * For web clients: auto-refreshes expired AT using RT
 * For app/API clients: returns 401 on expired (they handle refresh)
 */
export const verifyAccessTokenMiddleware = createAppMiddleware(async (c, next) => {
  let token = extractAccessToken(c);

  if (!token) {
    // Try auto-refresh for web clients
    token = await tryAutoRefresh(c);
  }

  if (!token) {
    return c.json({ error: 'Unauthorized', message: 'Access token is required' }, HTTP_STATUS_CODE.UNAUTHORIZED);
  }

  let result = await verifyAccessToken(token);

  // If expired, try auto-refresh for web clients
  if (!result.isValid && result.error === 'expired') {
    const newToken = await tryAutoRefresh(c);
    if (newToken) {
      result = await verifyAccessToken(newToken);
    }
  }

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

  // Set user info from token payload in context
  c.set('tokenPayload', result.payload);

  await next();
});

/**
 * Optional middleware that extracts token if present but doesn't require it
 * Useful for routes that work for both authenticated and anonymous users
 *
 * For web clients: auto-refreshes expired AT using RT
 */
export const optionalAccessToken = createAppMiddleware(async (c, next) => {
  let token = extractAccessToken(c);

  // Try auto-refresh if no token or token is expired
  if (!token) {
    token = await tryAutoRefresh(c);
  }

  if (token) {
    let result = await verifyAccessToken(token);

    // If expired, try auto-refresh
    if (!result.isValid && result.error === 'expired') {
      const newToken = await tryAutoRefresh(c);
      if (newToken) {
        result = await verifyAccessToken(newToken);
      }
    }

    if (result.isValid) {
      c.set('tokenPayload', result.payload);
    }
  }

  await next();
});
