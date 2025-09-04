import { env } from '@/env';
import { createAuthClient } from 'better-auth/react';

export type SocialProviders = 'google';

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

export type Session = typeof authClient.$Infer.Session.user;
