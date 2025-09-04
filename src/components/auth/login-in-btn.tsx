'use client';

import type { SocialProviders } from '@/lib/auth-client';
import useSignInDialog from '@/store/auth/use-signin-dialog';

export default function SignInBtn({ provider }: { provider: SocialProviders }) {
  const setOpen = useSignInDialog((state) => state.setOpen);

  return (
    <button
      type='button'
      className='rounded-sm bg-sky-500 px-2 py-1 text-white hover:cursor-pointer'
      onClick={() => setOpen(true)}
    >
      Log in
    </button>
  );
}
