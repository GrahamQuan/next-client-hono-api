'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { useEffect } from 'react';

export default function OneTap() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, refetch: refetchSession } = authClient.useSession();

  useEffect(() => {
    const handleOneTap = async () => {
      if (session) return;

      try {
        await authClient.oneTap({
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
