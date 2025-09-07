'use client';

import { useHydrated } from '@/hooks/use-hydrated';
import dynamic from 'next/dynamic';

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
