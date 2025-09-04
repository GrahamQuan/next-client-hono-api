'use client';

import useSignInDialog from '@/store/auth/use-signin-dialog';
import { useTranslations } from 'next-intl';
import { Label } from '../ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Button } from '../ui/button';
import { tryCatch } from '@/lib/promise-utils';
import { Dot } from 'lucide-react';
import { env } from '@/env';

export default function VerifyForm() {
  const t = useTranslations('components.sign-in-dialog');
  const setStep = useSignInDialog((state) => state.setStep);
  const setOpen = useSignInDialog((state) => state.setOpen);
  const email = useSignInDialog((state) => state.email);
  const setEmail = useSignInDialog((state) => state.setEmail);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get('code') as string;
    const [err, res] = await tryCatch(
      fetch(`${env.NEXT_PUBLIC_API_URL}/api/verify`, {
        method: 'POST',
        body: JSON.stringify({ code, email }),
      })
    );

    if (err) {
      console.error('Verify error:', err);
      return;
    }

    const data = await res.json();
    console.log('Verify:', data);
    setOpen(false);
    setStep('login');
    setEmail('');
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
      <Button type='submit' className='w-full'>
        {t('verify-form.submit')}
      </Button>
    </form>
  );
}
