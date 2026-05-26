'use client';

import { useCallback } from 'react';
import { useMeritStore } from '@/lib/store';
import { onboardingApi } from '@/lib/api';

export function useOnboarding() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);

  const showOnboarding = !!(user?.id && !user.onboardingCompleted);

  const complete = useCallback(async () => {
    try {
      await onboardingApi.complete();
      updateUser({ onboardingCompleted: true });
    } catch {
      // Non-fatal — dismiss modal anyway so it doesn't block the user
      updateUser({ onboardingCompleted: true });
    }
  }, [updateUser]);

  const skip = useCallback(async () => {
    try {
      await onboardingApi.skip();
      updateUser({ onboardingCompleted: true });
    } catch {
      updateUser({ onboardingCompleted: true });
    }
  }, [updateUser]);

  return { showOnboarding, complete, skip, user };
}
