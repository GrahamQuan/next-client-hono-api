'use client';

import { Label } from '@radix-ui/react-label';
import { useTranslations } from 'next-intl';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';
import { openSocialPopup } from '@/app/[locale]/(auth)/social-signin/open-social-popup';
import { signIn, useSession } from '@/lib/auth-client';
import useSignInDialog from '@/store/auth/use-signin-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function LogInForm() {
  const t = useTranslations('components.sign-in-dialog');
  const { refetch: refetchSession } = useSession();

  const resetAllAndClose = useSignInDialog((state) => state.resetAllAndClose);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn.email({
      email,
      password,
      rememberMe: true,
      // callbackURL: '/'
    });

    if (error) {
      toast.error('Try again please');
      return;
    }

    toast.success('Logged in');

    refetchSession();
    resetAllAndClose();
  };

  const handleGoogleSignIn = () => {
    openSocialPopup({
      url: '/social-signin?provider=google&status=login',
      title: 'Sign in with Google',
    });
  };

  return (
    <div>
      <form onSubmit={handleEmailSignIn} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>{t('email')}</Label>
          <Input id='email' type='email' name='email' placeholder='Enter your email' required />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>{t('password')}</Label>
          <Input id='password' type='password' name='password' placeholder='Enter your password' required />
        </div>
        <Button
          type='submit'
          className='w-full hover:enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
        >
          {t('sign-in-with-email')}
        </Button>
      </form>
      <div className='relative my-4'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>{t('social-sign-in')}</span>
        </div>
      </div>
      <Button variant='outline' type='button' className='w-full hover:cursor-pointer' onClick={handleGoogleSignIn}>
        <FcGoogle className='mr-2 h-4 w-4' />
        {t('continue-with-google')}
      </Button>
    </div>
  );
}
