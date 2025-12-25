'use client';

import { Dot } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { emailOtp, useSession } from '@/lib/auth-client';
import useSignInDialog from '@/store/auth/use-signin-dialog';
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Label } from '../ui/label';

export default function VerifySignupDigitCodeForm() {
  const t = useTranslations('components.sign-in-dialog');
  const { refetch: refetchSession } = useSession();
  const email = useSignInDialog((state) => state.email);
  const resetAllAndClose = useSignInDialog((state) => state.resetAllAndClose);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get('code') as string;

    const { error } = await emailOtp.verifyEmail({
      email,
      otp: code,
    });

    if (error) {
      toast.error('Verify error:', {
        description: error.statusText,
      });
      return;
    }

    toast.success('Verify success');
    refetchSession();
    resetAllAndClose();
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
