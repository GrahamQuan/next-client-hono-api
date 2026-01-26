'use client';

import { useEffect } from 'react';
import { oneTap } from '@/lib/auth-client';

export default function ClientComponent() {
  const googleOneTap = async () => {
    await oneTap();
  };

  useEffect(() => {
    googleOneTap();
  }, []);

  return null;
}
