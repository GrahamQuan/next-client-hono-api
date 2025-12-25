import env from '~/lib/env';
import { tryCatch } from '~/lib/promise-utils';

export const verifyTurnstileToken = async ({
  token,
  request,
}: {
  token: string;
  request: Request;
}): Promise<boolean> => {
  const [err, res] = await tryCatch(
    fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.AUTH_TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get('cf-connecting-ip') || '',
      }).toString(),
    }),
  );

  if (err) {
    return false;
  }

  const verificationResult = (await res.json()) as { success: boolean };

  if (!verificationResult.success) {
    return false;
  }

  return verificationResult.success;
};
