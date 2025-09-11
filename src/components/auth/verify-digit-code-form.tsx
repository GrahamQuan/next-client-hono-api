'use client';

import { useTranslations } from 'next-intl';
import { Dot } from 'lucide-react';

import useSignInDialog from '@/store/auth/use-signin-dialog';

import { Label } from '../ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Button } from '../ui/button';

import { signIn } from '@/lib/auth-client';
export default function VerifyDigitCodeForm() {
  const t = useTranslations('components.sign-in-dialog');
  const setStep = useSignInDialog((state) => state.setStep);
  const email = useSignInDialog((state) => state.email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get('code') as string;

    const { error } = await signIn.emailOtp({
      email,
      otp: code,
    });

    if (error) {
      console.error('Verify error:', error);
      return;
    }

    setStep('setup-user-info');
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      <div>
        <Label>{t('verify-form.title')}</Label>
      </div>
      <div>
        <InputOTP maxLength={6} name='code'>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <Dot className='size-5' />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button type='submit' className='w-full hover:cursor-pointer'>
        {t('verify-form.submit')}
      </Button>
    </form>
  );
}
