'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { Label } from '@radix-ui/react-label';
import { useTranslations } from 'next-intl';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';
import { openSocialPopup } from '@/app/[locale]/(auth)/social-signin/open-social-popup';
import { envClient } from '@/env-client';
import { useTurnstile } from '@/hooks/auth/use-turnstile';
import { signUp } from '@/lib/auth-client';
import useSignInDialog from '@/store/auth/use-signin-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function SignupWithEmailForm() {
  const t = useTranslations('components.sign-in-dialog');
  const setStep = useSignInDialog((state) => state.setStep);
  const setEmail = useSignInDialog((state) => state.setEmail);

  const {
    turnstileRef,
    token: turnstileToken,
    error: turnstileError,
    reset: resetTurnstile,
    onSuccess,
    onError,
    onExpire,
  } = useTurnstile();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast.error('Password and confirm password do not match');
      return;
    }

    if (!turnstileToken) {
      toast.error('Please verify you are human');
      return;
    }

    const { error } = await signUp.email({
      email,
      name,
      password,
      username: name,
      fetchOptions: {
        headers: {
          'x-turnstile-token': turnstileToken,
        },
      },
    });

    // biome-ignore lint/suspicious/noDebugger: <explanation>
    debugger;

    if (error) {
      toast.error('Try again please', {
        description: error.statusText,
      });
      resetTurnstile();
      return;
    }

    setEmail(email);
    setStep('verify-signup-digit-code');
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
          <Input id='name' type='text' name='name' placeholder='Enter your name' required />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>{t('email')}</Label>
          <Input id='email' type='email' name='email' placeholder='Enter your email' required />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>{t('password')}</Label>
          <Input id='password' type='password' name='password' placeholder='Enter your password' required />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='confirmPassword'>{t('confirm_password')}</Label>
          <Input
            id='confirmPassword'
            type='password'
            name='confirmPassword'
            placeholder='Enter your confirm password'
            required
          />
        </div>
        <div>
          <Label htmlFor='turnstile'>{t('let-us-know-you-are-human')}</Label>
          {turnstileError && (
            <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>{turnstileError}</div>
          )}
          <Turnstile
            ref={turnstileRef}
            siteKey={envClient.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
            options={{
              action: 'signup',
              theme: 'auto',
              size: 'flexible',
            }}
            onSuccess={onSuccess}
            onError={onError}
            onExpire={onExpire}
          />
        </div>
        <Button
          type='submit'
          disabled={!turnstileToken}
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
