import { serverFetch } from '../server-fetch';

export async function getAllPosts() {
  const res = await serverFetch('/api/posts');

  return res.json();
}
