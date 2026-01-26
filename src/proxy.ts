/**
 * Next.js Middleware Proxy
 *
 * Handles:
 * - Internationalization (next-intl)
 * - Route protection with Better Auth session
 */

import { NextRequest, NextResponse } from 'next/server';
import createNextIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { getSession } from '@/lib/auth-session';

// =============================================================================
// Configuration
// =============================================================================

/** Routes that require authentication */
const PROTECTED_ROUTES = ['/protected', '/dashboard', '/settings'];

/** Routes to redirect to after failed auth */
const LOGIN_ROUTE = '/';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Check if pathname requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

// =============================================================================
// Middleware
// =============================================================================

async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const intlResponse = createNextIntlMiddleware(routing)(req);

  // Skip auth check for non-protected routes
  if (!isProtectedRoute(pathname)) {
    return intlResponse;
  }

  // Check authentication via Better Auth session
  const { user } = await getSession(req);

  if (!user) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, req.url));
  }

  return intlResponse;
}

export default proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
