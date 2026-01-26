/**
 * Auth Session Utilities for Next.js Middleware
 *
 * Uses Better Auth's session-based authentication.
 * Session is managed via cookie by Better Auth.
 */

import type { NextRequest } from 'next/server';
import { env } from '@/env';

// =============================================================================
// Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionResult {
  user: User | null;
  session: Session | null;
}

// =============================================================================
// Session Management
// =============================================================================

/**
 * Get authenticated session from request cookies
 *
 * Calls Better Auth API to validate the session cookie.
 */
export async function getSession(req: NextRequest): Promise<SessionResult> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
    });

    if (!res.ok) {
      return { user: null, session: null };
    }

    const data = await res.json();

    if (!data?.user || !data?.session) {
      return { user: null, session: null };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        emailVerified: data.user.emailVerified,
      },
      session: {
        id: data.session.id,
        userId: data.session.userId,
        expiresAt: new Date(data.session.expiresAt),
      },
    };
  } catch {
    return { user: null, session: null };
  }
}
