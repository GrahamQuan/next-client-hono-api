// import { Link } from '@/i18n/navigation';

// import { useRouter } from 'next/router';
import Link from 'next/link';
import { locale } from 'next/root-params';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('about');
  // const router = useRouter();

  const localeValue = await locale();

  // const handleNav = () => {
  //   router.push('/en'); // not support typedRoutes
  // };

  return (
    <div>
      <div>
        {t('title')} --- {localeValue}
      </div>
      <Link href='/en'>home</Link>
      {/* <button onClick={handleNav}>home</button> */}
      {/* <Link href='/'>home</Link> */}
    </div>
  );
}
