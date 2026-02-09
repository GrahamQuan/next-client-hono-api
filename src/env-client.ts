import { z } from 'zod';

const EnvClientSchema = z.object({
  NEXT_PUBLIC_WEBSITE_URL: z.url(),
  NEXT_PUBLIC_WEBSITE_NAME: z.string(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string(),
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID: z.string(),
});

function getEnvClient() {
  const parsed = EnvClientSchema.safeParse({
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    NEXT_PUBLIC_WEBSITE_NAME: process.env.NEXT_PUBLIC_WEBSITE_NAME,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID,
  });

  if (!parsed.success) {
    console.error('Invalid client environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid client environment variables');
  }

  return parsed.data;
}

export type EnvClient = z.infer<typeof EnvClientSchema>;
export const envClient = getEnvClient();
