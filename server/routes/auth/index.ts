import { setCookie } from 'hono/cookie';
import { auth } from '~/auth';
import {
  ACCESS_TOKEN_COOKIE,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  issueTokenPair,
  REFRESH_TOKEN_COOKIE,
} from '~/auth/token-service';
import { createAppRouter } from '~/lib/factory';
import tokenRouter from './token.controller';

const authRouter = createAppRouter();

// Token management endpoints (AT+RT)
authRouter.route('/token', tokenRouter);

// Auth endpoints that should issue tokens on success
const TOKEN_ISSUING_PATHS = ['/sign-in', '/sign-up', '/callback', '/verify-email', '/one-tap'];

/**
 * Check if the path should issue tokens on successful auth
 */
function shouldIssueTokens(path: string): boolean {
  return TOKEN_ISSUING_PATHS.some((p) => path.includes(p));
}

/**
 * Wrapper for Better Auth handler that adds AT+RT tokens to successful auth responses
 */
authRouter.on(['POST', 'GET'], '/**', async (c) => {
  const response = await auth.handler(c.req.raw);
  const path = new URL(c.req.url).pathname;

  // Only process successful responses for token-issuing endpoints
  if (response.status === 200 && shouldIssueTokens(path)) {
    try {
      const body = await response.clone().json();

      // Check if response contains session info (successful auth)
      if (body?.session?.id && body?.user) {
        const tokens = await issueTokenPair(
          {
            id: body.user.id,
            email: body.user.email,
            name: body.user.name,
            emailVerified: body.user.emailVerified,
          },
          body.session.id,
        );

        // Set token cookies
        const atOptions = getAccessTokenCookieOptions();
        const rtOptions = getRefreshTokenCookieOptions();

        setCookie(c, ACCESS_TOKEN_COOKIE, tokens.accessToken, atOptions);
        setCookie(c, REFRESH_TOKEN_COOKIE, tokens.refreshToken, rtOptions);

        // Add tokens to response body for clients that need them
        const newBody = {
          ...body,
          tokens: {
            accessToken: tokens.accessToken,
            accessTokenExpiresAt: tokens.accessTokenExpiresAt.toISOString(),
          },
        };

        // Create new response with original headers + our cookies
        const headers = new Headers(response.headers);

        // Get Set-Cookie headers from our Hono context and add them
        const cookieHeader = c.res.headers.get('Set-Cookie');
        if (cookieHeader) {
          headers.append('Set-Cookie', cookieHeader);
        }

        return new Response(JSON.stringify(newBody), {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }
    } catch {
      // If JSON parsing fails, return original response
    }
  }

  return response;
});

export default authRouter;
