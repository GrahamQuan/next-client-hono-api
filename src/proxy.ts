import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import createNextIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { auth } from '~/auth';

const PROTECTED_ROUTES = ['/protected', '/dashboard', '/settings'];

const LOGIN_ROUTE = '/';

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const intlResponse = createNextIntlMiddleware(routing)(req);

  // Skip auth check for non-protected routes
  if (!isProtectedRoute(pathname)) {
    return intlResponse;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, req.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml).*)'],
};
