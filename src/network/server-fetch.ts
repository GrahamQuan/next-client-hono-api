import { env } from '@/env';

export async function serverFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, options);

  return response;
}
