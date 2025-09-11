'use client';

import { Loader2 } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useState } from 'react';

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type='submit'
      onClick={handleSignOut}
      disabled={isLoading}
      className='rounded-sm bg-sky-500 px-2 py-1 text-white hover:enabled:cursor-pointer disabled:cursor-not-allowed'
    >
      {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Signout'}
    </button>
  );
}
