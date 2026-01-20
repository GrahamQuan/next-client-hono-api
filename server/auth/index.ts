import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP, oneTap } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { db } from '~/db';
import * as schema from '~/db/schema';
import { sendVerificationEmail } from '~/email';
import { hashPassword, verifyPassword } from '~/generator/password';
import env from '~/lib/env';
import { issueTokenPair } from './token-service';
import { verifyTurnstileToken } from './verify-turnstile-token';

export const auth = betterAuth({
  baseURL: env.API_URL, // important
  secret: env.AUTH_BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEBSITE_URL, 'http://localhost:3000', 'http://localhost:3001'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
  // Session configuration for AT+RT
  session: {
    expiresIn: env.AUTH_REFRESH_TOKEN_EXPIRES_IN, // Session expires with RT (7 days)
    updateAge: 60 * 60 * 24, // Update session age every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: env.AUTH_ACCESS_TOKEN_EXPIRES_IN, // Cache matches AT expiry
    },
  },
  // Database hooks for AT+RT integration
  databaseHooks: {
    session: {
      create: {
        // After session is created, issue AT+RT tokens
        after: async (session) => {
          // Get the user for token payload
          const userRecords = await db.select().from(schema.user).where(eq(schema.user.id, session.userId)).limit(1);

          const userRecord = userRecords[0];
          if (!userRecord) {
            console.error('User not found for session:', session.id);
            return;
          }

          // Issue token pair and store RT hash in session
          await issueTokenPair(
            {
              id: userRecord.id,
              email: userRecord.email,
              name: userRecord.name,
              emailVerified: userRecord.emailVerified,
            },
            session.id,
          );
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    password: {
      hash: async (password) => {
        const hashedPassword = await hashPassword(password);
        return hashedPassword;
      },
      verify: async ({ hash, password }) => {
        const isValid = await verifyPassword(hash, password);
        return isValid;
      },
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
      redirectURI: `${env.API_URL}/api/auth/callback/google`,
    },
  },
  plugins: [
    oneTap(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }, request) {
        // Verify turnstile token
        const turnstileToken = request?.headers.get('x-turnstile-token');
        if (!turnstileToken || !request) {
          console.log('No turnstile token');
          return;
        }

        if (type === 'sign-in') {
          // Send the OTP for sign in
        } else if (type === 'email-verification') {
          // Send the OTP for email verification
          const isTurnstileTokenValid = await verifyTurnstileToken({
            token: turnstileToken,
            request,
          });

          if (!isTurnstileTokenValid) {
            console.log('Invalid turnstile token');
            return;
          }

          await sendVerificationEmail({ email, otp });
        } else {
          // Send the OTP for password reset
          console.log('Sending OTP for password reset', email, otp);
        }
      },
    }),
  ],
});

export type Auth = typeof auth;
