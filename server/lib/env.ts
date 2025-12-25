import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { ZodError, z } from 'zod';

expand(
  config({
    // path: process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    path: '.env',
  }),
);

const EnvSchema = z.object({
  // app
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().default(8787),
  API_URL: z.string(),
  WEBSITE_URL: z.string(),
  // database
  DATABASE_URL: z.string(),
  // cache
  CACHE_URL: z.string(),
  // auth
  AUTH_TOTP_SECRET: z.string(),
  AUTH_BETTER_AUTH_SECRET: z.string(),
  AUTH_GOOGLE_CLIENT_ID: z.string(),
  AUTH_GOOGLE_CLIENT_SECRET: z.string(),
  AUTH_TURNSTILE_SECRET_KEY: z.string(),
  // email
  EMAIL_RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
  EMAIL_WEBSITE_NAME: z.string(),
  EMAIL_WEBSITE_URL: z.string(),
  // bucket
  BUCKET_NAME: z.string(),
  BUCKET_REGION: z.string(),
  BUCKET_ENDPOINT: z.string(),
  BUCKET_ACCESS_KEY_ID: z.string(),
  BUCKET_SECRET_ACCESS_KEY: z.string(),
  BUCKET_PUBLIC_URL: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = 'Missing required values in .env:\n';
    for (const issue of error.issues) {
      message = `${String(issue.path[0])}: ${issue.message}\n`;
    }
    const e = new Error(message);
    e.stack = '';
    throw e;
  }
  console.error(error);
}

export type ENV = z.infer<typeof EnvSchema>;
export default EnvSchema.parse(process.env);
