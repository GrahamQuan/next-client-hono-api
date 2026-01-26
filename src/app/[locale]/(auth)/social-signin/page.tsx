'use client';

import { use, useEffect, useEffectEvent } from 'react';
import Loader from '@/components/common/loader';
import { SocialProviders, signIn } from '@/lib/auth-client';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{
    provider: SocialProviders;
    status?: 'login' | 'signup' | 'success' | 'error';
    theme?: 'light' | 'dark';
  }>;
}) {
  const { provider, status, theme = 'dark' } = use(searchParams);

  const handleSignIn = useEffectEvent(async () => {
    try {
      // this will redirect to google login page after fetching successfully
      const result = await signIn.social({
        provider,
        callbackURL: `${window.location.origin}/social-signin?provider=${provider}&status=success`,
        errorCallbackURL: `${window.location.origin}/social-signin?provider=${provider}&status=error`,
      });

      // If there's an error in the result, log it
      if (result?.error) {
        console.error('Social sign-in error:', result);
        if (window.opener) {
          window.opener.postMessage({ type: 'SIGNIN_ERROR', open: false }, window.location.origin);
        }
      }
    } catch (error) {
      console.error('Social sign-in failed:', error);
      if (window.opener) {
        window.opener.postMessage({ type: 'SIGNIN_ERROR', open: false }, window.location.origin);
      }
    }
  });

  useEffect(() => {
    switch (status) {
      case 'login':
      case 'signup':
        handleSignIn();
        break;
      case 'success':
        // Send a message to the parent window to close the sign-in dialog
        if (window.opener) {
          window.opener.postMessage({ type: 'SIGNIN_SUCCESS', open: false }, window.location.origin);
        }
        window.close();
        break;
      case 'error':
        // Send a message to the parent window to close the sign-in dialog
        if (window.opener) {
          window.opener.postMessage({ type: 'SIGNIN_ERROR', open: false }, window.location.origin);
        }
        window.close();
        break;
      default:
        break;
    }
  }, [status]);

  return (
    <div
      data-theme={theme}
      className='absolute inset-0 w-dvw h-dvh bg-white dark:bg-black data-[theme=light]:bg-white data-[theme=dark]:bg-black'
    >
      <div className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex h-full items-center justify-center'>
        <Loader />
      </div>
    </div>
  );
}
