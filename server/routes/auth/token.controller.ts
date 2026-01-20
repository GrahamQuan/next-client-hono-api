import { zValidator } from '@hono/zod-validator';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import {
  ACCESS_TOKEN_COOKIE,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  invalidateSessionTokens,
  REFRESH_TOKEN_COOKIE,
  refreshTokens,
} from '~/auth/token-service';
import { HTTP_STATUS_CODE } from '~/constants/http-status-code';
import { createAppRouter } from '~/lib/factory';

const tokenRouter = createAppRouter();

// Schema for refresh request body (optional - can also use cookie)
const refreshBodySchema = z.object({
  refreshToken: z.string().optional(),
});

/**
 * POST /api/auth/token/refresh
 *
 * Refresh the access token using a valid refresh token.
 * Refresh token can be provided via:
 * 1. HttpOnly cookie (default for web clients)
 * 2. Request body (for mobile/API clients)
 *
 * By default, implements token rotation for security.
 */
tokenRouter.post('/refresh', zValidator('json', refreshBodySchema), async (c) => {
  // Get refresh token from cookie or body
  const body = c.req.valid('json');
  const refreshToken = body.refreshToken ?? getCookie(c, REFRESH_TOKEN_COOKIE);

  if (!refreshToken) {
    return c.json(
      {
        error: 'Bad Request',
        message: 'Refresh token is required',
        code: 'missing_refresh_token',
      },
      HTTP_STATUS_CODE.BAD_REQUEST,
    );
  }

  // Attempt to refresh tokens (with rotation by default)
  const tokens = await refreshTokens(refreshToken, true);

  if (!tokens) {
    // Clear invalid cookies
    deleteCookie(c, ACCESS_TOKEN_COOKIE);
    deleteCookie(c, REFRESH_TOKEN_COOKIE);

    return c.json(
      {
        error: 'Unauthorized',
        message: 'Refresh token is invalid or expired',
        code: 'invalid_refresh_token',
      },
      HTTP_STATUS_CODE.UNAUTHORIZED,
    );
  }

  // Set new tokens in cookies
  setCookie(c, ACCESS_TOKEN_COOKIE, tokens.accessToken, getAccessTokenCookieOptions());
  setCookie(c, REFRESH_TOKEN_COOKIE, tokens.refreshToken, getRefreshTokenCookieOptions());

  return c.json({
    message: 'Tokens refreshed successfully',
    data: {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt.toISOString(),
      // Only return refresh token if requested via body (mobile clients)
      ...(body.refreshToken && {
        refreshToken: tokens.refreshToken,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
      }),
    },
  });
});

/**
 * POST /api/auth/token/revoke
 *
 * Revoke the current refresh token (logout from current device).
 * This invalidates the session's refresh token.
 */
tokenRouter.post('/revoke', async (c) => {
  const refreshToken = getCookie(c, REFRESH_TOKEN_COOKIE);

  if (refreshToken) {
    // Find and invalidate the session
    const { hashRefreshToken } = await import('~/auth/jwt');
    const { db } = await import('~/db');
    const { session } = await import('~/db/schema');
    const { eq } = await import('drizzle-orm');

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const sessions = await db.select().from(session).where(eq(session.refreshTokenHash, refreshTokenHash)).limit(1);

    if (sessions[0]) {
      await invalidateSessionTokens(sessions[0].id);
    }
  }

  // Clear cookies regardless
  deleteCookie(c, ACCESS_TOKEN_COOKIE);
  deleteCookie(c, REFRESH_TOKEN_COOKIE);

  return c.json({
    message: 'Token revoked successfully',
  });
});

export default tokenRouter;
