import { envClient } from '@/env-client';

export async function serverFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${envClient.NEXT_PUBLIC_API_URL}${url}`, options);

  return response;
}
