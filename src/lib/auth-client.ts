import { emailOTPClient, oneTapClient, usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from '@/env';

export type SocialProviders = 'google';

export const { signIn, signOut, signUp, useSession, oneTap, $Infer, emailOtp, updateUser } = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  plugins: [
    oneTapClient({
      clientId: env.NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID,
      // Optional client configuration:
      autoSelect: false,
      cancelOnTapOutside: true,
      context: 'signin',
      additionalOptions: {
        // Any extra options for the Google initialize method
      },
      // Configure prompt behavior and exponential backoff:
      promptOptions: {
        baseDelay: 1000, // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
    }),
    emailOTPClient(),
    usernameClient(),
  ],
});

export type Session = typeof $Infer.Session.user;
