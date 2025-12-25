'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSession } from '@/lib/auth-client';
import useSignInDialog from '@/store/auth/use-signin-dialog';
import LogInForm from './log-in-form';
import SignupWithEmailForm from './signup-with-email-form';
import VerifySignupDigitCodeForm from './verify-signup-digit-code-form';

export default function LogInDialog() {
  const t = useTranslations('components.sign-in-dialog');
  const { refetch: refetchSession } = useSession();

  const open = useSignInDialog((state) => state.open);
  const setOpen = useSignInDialog((state) => state.setOpen);
  const step = useSignInDialog((state) => state.step);
  const setStep = useSignInDialog((state) => state.setStep);

  // Handle messages from the social sign-in page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      // Close the sign-in dialog
      if (event.data.type === 'SIGNIN_SUCCESS') {
        toast.success('Signed in successfully');
        refetchSession();
        setOpen(event.data.open);
      }

      if (event.data.type === 'SIGNIN_ERROR') {
        toast.error('Error signing in, Please try again', event.data.message);
        setOpen(event.data.open);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setStep('login');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className='sm:max-w-[425px]'
        aria-describedby='sign-in-dialog-title'
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <span className='text-muted-foreground'>
              {step === 'login' && t('login')}
              {step === 'signup-with-email' && t('register')}
              {step === 'verify-signup-digit-code' && t('verify-form.title')}
            </span>
            {step === 'login' && (
              <Button variant='link' onClick={() => setStep('signup-with-email')} className='px-0 hover:cursor-pointer'>
                {`(${t('sign-up')})`}
              </Button>
            )}
            {step === 'signup-with-email' && (
              <Button variant='link' onClick={() => setStep('login')} className='px-0 hover:cursor-pointer'>
                {`(${t('back-to-sign-in')})`}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        {step === 'login' && <LogInForm />}
        {step === 'signup-with-email' && <SignupWithEmailForm />}
        {step === 'verify-signup-digit-code' && <VerifySignupDigitCodeForm />}
      </DialogContent>
    </Dialog>
  );
}
