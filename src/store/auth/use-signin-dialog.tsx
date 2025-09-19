import { create } from 'zustand';

type State = {
  open: boolean;
  step:
    | 'login'
    | 'signup-with-email'
    | 'verify-signup-digit-code'
    | 'forgot-password';
  email: string;
};

type Actions = {
  setOpen: (open: boolean) => void;
  setStep: (step: State['step']) => void;
  setEmail: (email: string) => void;
  resetAllAndClose: () => void;
};

const useSignInDialog = create<State & Actions>((set) => ({
  open: false,
  step: 'login',
  email: '',
  setOpen: (open) => set({ open }),
  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  resetAllAndClose: () => set({ open: false, step: 'login', email: '' }),
}));

export default useSignInDialog;
