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
      {/* <div className='flex flex-col gap-3'>
        {posts?.length > 0 &&
          posts.map((post: any) => (
            <div key={post.id} className='rounded bg-teal-600 px-3 py-2'>
              <div>{post.title}</div>
            </div>
          ))}
      </div> */}
    </div>
  );
}
