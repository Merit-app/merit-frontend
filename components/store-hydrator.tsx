'use client';

import { useEffect } from 'react';
import { useMeritStore } from '@/lib/store';
import { useHydrationStore } from '@/lib/store';

/**
 * Rehydrates the Zustand persist store from localStorage on the client,
 * then signals the hydration store so the app layout knows it's safe to
 * check auth state without false redirects.
 */
export function StoreHydrator() {
  const setHydrated = useHydrationStore((s) => s.setHydrated);

  useEffect(() => {
    useMeritStore.persist.rehydrate();
    // Rehydrate is synchronous for localStorage — flag immediately
    setHydrated();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
