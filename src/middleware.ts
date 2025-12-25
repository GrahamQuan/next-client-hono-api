// import { auth as middleware } from '@/auth';

import { betterFetch } from '@better-fetch/fetch';
import { NextRequest, NextResponse } from 'next/server';
import createNextIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { env } from './env';
import { Session } from './lib/auth-client';

async function getAuthSessionCookie(req: NextRequest) {
  const { data: session } = await betterFetch<Session>(`${env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
    baseURL: req.nextUrl.origin,
    headers: {
      cookie: req.headers.get('cookie') || '', // Forward the cookies from the request
    },
  });

  return session;
}

async function middleware(req: NextRequest) {
  const response = createNextIntlMiddleware(routing)(req);

  if (req.nextUrl.pathname.startsWith('/protected')) {
    const sessionCookie = await getAuthSessionCookie(req);

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return response;
}

export default middleware;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
