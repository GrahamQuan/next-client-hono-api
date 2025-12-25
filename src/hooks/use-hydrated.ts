import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {
    // do nothing
  };
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
