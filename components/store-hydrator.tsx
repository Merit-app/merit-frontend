'use client';

import { useEffect } from 'react';
import { useMeritStore } from '@/lib/store';

/**
 * Rehydrates the Zustand store from localStorage on the client.
 * Must be rendered inside the root layout to run on every page.
 * Without this, the store stays in its default (empty) SSR state.
 */
export function StoreHydrator() {
  useEffect(() => {
    useMeritStore.persist.rehydrate();
  }, []);

  return null;
}
