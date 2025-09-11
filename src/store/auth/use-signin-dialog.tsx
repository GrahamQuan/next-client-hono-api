import { create } from 'zustand';

type SignInDialogState = {
  open: boolean;
  step:
    | 'login'
    | 'signup-with-email'
    | 'verify-digit-code'
    | 'setup-user-info'
    | 'forgot-password';
  email: string;
  setOpen: (open: boolean) => void;
  setStep: (step: SignInDialogState['step']) => void;
  setEmail: (email: string) => void;
};

const useSignInDialog = create<SignInDialogState>((set) => ({
  open: false,
  step: 'login',
  email: '',
  setOpen: (open) => set({ open }),
  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  resetAll: () => set({ open: false, step: 'login', email: '' }),
}));

export default useSignInDialog;
