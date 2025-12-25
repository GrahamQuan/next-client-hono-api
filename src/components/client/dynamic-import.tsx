'use client';

import dynamic from 'next/dynamic';
import { useHydrated } from '@/hooks/use-hydrated';

const OneTap = dynamic(() => import('@/components/auth/one-tap'), {
  ssr: !!false,
});

export default function DynamicImport() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <OneTap />;
}
