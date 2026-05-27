'use client';

import { useCallback } from 'react';
import { useMeritStore } from '@/lib/store';
import { onboardingApi } from '@/lib/api';

const LS_KEY = 'merit_onboarding_done';

function lsGet() {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(LS_KEY) === '1'; } catch { return false; }
}

function lsSet() {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, '1'); } catch { /* ignore */ }
}

export function useOnboarding() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);

  // Show only when:
  //   1. user is authenticated (has id)
  //   2. DB flag says not completed
  //   3. localStorage fast-path doesn't say done (prevents flash on re-login)
  const showOnboarding = !!(user?.id && !user.onboardingCompleted && !lsGet());

  const complete = useCallback(async () => {
    lsSet();
    updateUser({ onboardingCompleted: true });
    try {
      await onboardingApi.complete();
    } catch {
      // Non-fatal — localStorage + store are already updated
    }
  }, [updateUser]);

  const skip = useCallback(async () => {
    lsSet();
    updateUser({ onboardingCompleted: true });
    try {
      await onboardingApi.skip();
    } catch {
      // Non-fatal
    }
  }, [updateUser]);

  return { showOnboarding, complete, skip, user };
}
