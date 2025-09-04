'use client';

import Loader from '@/components/common/loader';
import { env } from '@/env';
import { authClient, SocialProviders } from '@/lib/auth-client';
import { use, useEffect } from 'react';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{
    provider: SocialProviders;
    status?: 'login' | 'signup' | 'success' | 'error';
  }>;
}) {
  const { provider, status } = use(searchParams);

  const handleSignIn = async () => {
    // this will redirect to google login page after fetching successfully
    await authClient.signIn.social({
      provider,
      callbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/social-signin?provider=${provider}&status=success`,
      errorCallbackURL: `${env.NEXT_PUBLIC_WEBSITE_URL}/social-signin?provider=${provider}&status=error`,
    });
  };

  useEffect(() => {
    switch (status) {
      case 'login':
      case 'signup':
        handleSignIn();
        break;
      case 'success':
        // Send a message to the parent window to close the sign-in dialog
        if (window.opener) {
          window.opener.postMessage(
            { type: 'SIGNIN_SUCCESS', open: false },
            window.location.origin
          );
        }
        window.close();
        break;
      case 'error':
        // Send a message to the parent window to close the sign-in dialog
        if (window.opener) {
          window.opener.postMessage(
            { type: 'SIGNIN_ERROR', open: true },
            window.location.origin
          );
        }
        window.close();
        break;
      default:
        break;
    }
  }, [status]);

  return (
    <div className='absolute inset-0 w-dvw h-dvh bg-white'>
      <div className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex h-full items-center justify-center'>
        <Loader />
      </div>
    </div>
  );
}
