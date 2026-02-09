import { getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/network/posts';

export default async function Home() {
  const t = await getTranslations('home');
  const posts = await getAllPosts();

  return (
    <div className='flex h-screen flex-col items-center justify-center overflow-y-auto'>
      <div>{t('title')}</div>
      <div>nextjs + hono</div>
      <div>Data from DB:</div>
      {JSON.stringify(posts || '')}
    </div>
  );
}
