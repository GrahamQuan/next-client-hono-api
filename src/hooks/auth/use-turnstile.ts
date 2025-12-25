import { useCallback, useEffect, useRef, useState } from 'react';
import { env } from '@/env';
import type {
  TurnstileRenderOptions,
  // TurnstileResponse,
} from '@/types/turnstile';

export function useTurnstile({
  siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string,
  action,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  appearance = 'always',
  refreshExpired = 'auto',
  autoRefreshMinutes = 4, // Default auto refresh time is 4 minutes
}: {
  siteKey?: string;
  action?: string;
  onVerify?: (token: string) => void;
  onError?: (error: string | Event) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  appearance?: 'always' | 'execute' | 'interaction-only';
  refreshExpired?: 'auto' | 'manual' | 'never';
  autoRefreshMinutes?: number; // New parameter: auto refresh time (minutes)
}) {
  const [token, setToken] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenTimestampRef = useRef<number>(0); // Track token generation time
  const usedTokenRef = useRef<string | null>(null); // Track used token

  // load Turnstile script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.querySelector('script#cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;

      script.onload = () => setIsLoaded(true);
      script.onerror = (err) => {
        setError('Failed to load Turnstile script');
        onError?.(err);
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }

    setIsLoaded(true);
  }, [onError]);

  // handle verification callback
  const handleVerify = useCallback(
    (responseToken: string) => {
      setToken(responseToken);
      tokenTimestampRef.current = Date.now(); // Record token acquisition time
      usedTokenRef.current = null; // Reset used token flag
      setIsVerifying(false);
      setError(null);
      onVerify?.(responseToken);
    },
    [onVerify],
  );

  // handle expired callback
  const handleExpire = useCallback(() => {
    setToken('');
    usedTokenRef.current = null; // Clear used token flag
    setError('Verification expired');
    onExpire?.();
  }, [onExpire]);

  // handle error callback
  const handleError = useCallback(
    (err: string | Event) => {
      setToken('');
      usedTokenRef.current = null; // Clear used token flag
      setError('Verification failed');
      setIsVerifying(false);
      onError?.(err);
    },
    [onError],
  );

  // render Turnstile
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile) return;

    // clear any existing instances
    if (widgetId) {
      window.turnstile.remove(widgetId);
    }

    // configure options
    const options: TurnstileRenderOptions = {
      sitekey: siteKey,
      theme,
      size,
      appearance,
      'refresh-expired': refreshExpired,
      callback: handleVerify,
      'expired-callback': handleExpire,
      'error-callback': handleError,
    };

    // if action is provided, add it to the options
    if (action) {
      options.action = action;
    }

    // render widget
    const id = window.turnstile.render(containerRef.current, options);
    setWidgetId(id);

    return () => {
      if (id) {
        window.turnstile.remove(id);
      }
    };
  }, [isLoaded, siteKey, theme, size, appearance, refreshExpired, action, handleVerify, handleExpire, handleError]);

  // auto token refresh logic
  useEffect(() => {
    if (!token) return;

    // set refresh time (convert to milliseconds)
    const refreshTimeout = setTimeout(
      () => {
        if (widgetId && window.turnstile) {
          window.turnstile.reset(widgetId);
          setToken('');
          setError('Verification token has been refreshed due to approaching expiration');
        }
      },
      autoRefreshMinutes * 60 * 1000,
    );

    return () => clearTimeout(refreshTimeout);
  }, [token, widgetId, autoRefreshMinutes]);

  // reset method
  const reset = useCallback(() => {
    if (widgetId && window.turnstile) {
      setToken('');
      usedTokenRef.current = null; // Clear used token flag
      window.turnstile.reset(widgetId);
    }
  }, [widgetId]);

  // manual execute method
  const execute = useCallback(() => {
    if (widgetId && window.turnstile && appearance !== 'always') {
      setIsVerifying(true);
      window.turnstile.execute(widgetId);
    }
  }, [widgetId, appearance]);

  // enhanced check method: check if the token is valid
  const isTokenValid = useCallback(() => {
    // check if there is a token
    if (!token) {
      setError('No verification token available');
      return false;
    }

    // check if the token has been used
    if (usedTokenRef.current === token) {
      setError('Token has been used - please verify again');
      reset();
      return false;
    }

    // check if the token is approaching expiration
    const tokenAge = Date.now() - tokenTimestampRef.current;
    const nearingExpiration = tokenAge > autoRefreshMinutes * 60 * 1000;

    if (nearingExpiration) {
      setError('Verification token is about to expire - please verify again');
      reset();
      return false;
    }

    return true;
  }, [token, reset, autoRefreshMinutes]);

  // mark the token as used
  const markTokenAsUsed = useCallback(() => {
    usedTokenRef.current = token;
  }, [token]);

  // handle API response timeout-or-duplicate error
  const handleApiResponse = useCallback(
    (response: { error?: string; requiresRefresh?: boolean; details?: string[] }) => {
      // check for Turnstile related errors
      if (
        response.error?.includes('CAPTCHA') ||
        response.requiresRefresh ||
        (response.details && Array.isArray(response.details) && response.details.includes('timeout-or-duplicate'))
      ) {
        // reset token and component
        reset();

        // return friendly error message
        return 'Verification expired or already used. Please verify again and retry.';
      }

      // if there are no Turnstile related errors, return the original error
      return response.error || 'An error occurred';
    },
    [reset],
  );

  return {
    containerRef,
    token,
    reset,
    execute,
    isLoaded,
    error,
    isVerifying,
    // export new utility methods
    isTokenValid,
    markTokenAsUsed,
    handleApiResponse,
    tokenTimestamp: tokenTimestampRef.current,
  };
}
