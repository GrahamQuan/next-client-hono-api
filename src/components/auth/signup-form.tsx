'use client';

import { openSocialPopup } from '@/app/[locale]/(auth)/social-signin/open-social-popup';
import { useTurnstile } from '@/hooks/auth/use-turnstile';
import useSignInDialog from '@/store/auth/use-signin-dialog';
import { Label } from '@radix-ui/react-label';
import { useTranslations } from 'next-intl';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { authClient } from '@/lib/auth-client';

export default function SignupForm() {
  const t = useTranslations('components.sign-in-dialog');
  const setStep = useSignInDialog((state) => state.setStep);
  const setEmail = useSignInDialog((state) => state.setEmail);

  const {
    containerRef,
    token: turnstileToken,
    error: turnstileError,
    isLoaded: isTurnstileLoaded,
    reset: resetTurnstile,
  } = useTurnstile({
    action: 'signup',
  });

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      fetchOptions: {
        headers: {
          'x-captcha-response': turnstileToken,
        },
      },
    });

    if (error) {
      resetTurnstile();
      toast.error('Try again please');
      return;
    }

    setEmail(email);
    setStep('verify');
  };

  const handleGoogleSignIn = () => {
    openSocialPopup({
      url: '/social-signin?provider=google&status=signup',
      title: 'Sign up with Google',
    });
  };

  return (
    <div>
      <form onSubmit={handleEmailSignIn} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>{t('name')}</Label>
          <Input
            id='name'
            type='text'
            name='name'
            placeholder='Enter your name'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>{t('email')}</Label>
          <Input
            id='email'
            type='email'
            name='email'
            placeholder='Enter your email'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>{t('password')}</Label>
          <Input
            id='password'
            type='password'
            name='password'
            placeholder='Enter your password'
            required
          />
        </div>
        <div>
          {turnstileError && (
            <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
              {turnstileError}
            </div>
          )}
          <div ref={containerRef} />
        </div>
        <Button
          type='submit'
          disabled={!turnstileToken && isTurnstileLoaded}
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
          <span className='bg-background px-2 text-muted-foreground'>
            {t('social-sign-in')}
          </span>
        </div>
      </div>
      <Button
        variant='outline'
        type='button'
        className='w-full hover:cursor-pointer'
        onClick={handleGoogleSignIn}
      >
        <FcGoogle className='mr-2 h-4 w-4' />
        {t('continue-with-google')}
      </Button>
    </div>
  );
}
