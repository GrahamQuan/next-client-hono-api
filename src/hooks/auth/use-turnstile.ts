import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { useCallback, useRef, useState } from 'react';

interface UseTurnstileOptions {
  autoRefreshMinutes?: number;
}

export function useTurnstile({ autoRefreshMinutes = 4 }: UseTurnstileOptions = {}) {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const tokenTimestampRef = useRef<number>(0);
  const usedTokenRef = useRef<string | null>(null);

  const onSuccess = useCallback((responseToken: string) => {
    setToken(responseToken);
    tokenTimestampRef.current = Date.now();
    usedTokenRef.current = null;
    setIsVerifying(false);
    setError(null);
  }, []);

  const onError = useCallback(() => {
    setToken('');
    usedTokenRef.current = null;
    setError('Verification failed');
    setIsVerifying(false);
  }, []);

  const onExpire = useCallback(() => {
    setToken('');
    usedTokenRef.current = null;
    setError('Verification expired');
  }, []);

  const reset = useCallback(() => {
    setToken('');
    setError(null);
    usedTokenRef.current = null;
    turnstileRef.current?.reset();
  }, []);

  const execute = useCallback(() => {
    setIsVerifying(true);
    turnstileRef.current?.execute();
  }, []);

  const isTokenValid = useCallback(() => {
    if (!token) {
      setError('No verification token available');
      return false;
    }

    if (usedTokenRef.current === token) {
      setError('Token has been used - please verify again');
      reset();
      return false;
    }

    const tokenAge = Date.now() - tokenTimestampRef.current;
    const nearingExpiration = tokenAge > autoRefreshMinutes * 60 * 1000;

    if (nearingExpiration) {
      setError('Verification token is about to expire - please verify again');
      reset();
      return false;
    }

    return true;
  }, [token, reset, autoRefreshMinutes]);

  const markTokenAsUsed = useCallback(() => {
    usedTokenRef.current = token;
  }, [token]);

  const handleApiResponse = useCallback(
    (response: { error?: string; requiresRefresh?: boolean; details?: string[] }) => {
      if (
        response.error?.includes('CAPTCHA') ||
        response.requiresRefresh ||
        (response.details && Array.isArray(response.details) && response.details.includes('timeout-or-duplicate'))
      ) {
        reset();
        return 'Verification expired or already used. Please verify again and retry.';
      }
      return response.error || 'An error occurred';
    },
    [reset],
  );

  return {
    turnstileRef,
    token,
    error,
    isVerifying,
    reset,
    execute,
    onSuccess,
    onError,
    onExpire,
    isTokenValid,
    markTokenAsUsed,
    handleApiResponse,
    tokenTimestamp: tokenTimestampRef.current,
  };
}
