'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { oneTap, useSession } from '@/lib/auth-client';

export default function OneTap() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, refetch: refetchSession } = useSession();

  useEffect(() => {
    const handleOneTap = async () => {
      if (session) return;

      try {
        await oneTap({
          fetchOptions: {
            onSuccess: () => {
              refetchSession();
              router.push(pathname);
            },
            onError: () => {
              router.push(pathname);
            },
          },
        });
      } catch (error) {
        console.error(error);
      }
    };

    handleOneTap();
  }, [session]);

  return null;
}
