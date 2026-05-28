'use client';

import { useMeritStore } from '@/lib/store';

type Plan = 'free' | 'pro' | 'premium' | 'institutional';

const PLAN_HIERARCHY: Record<Plan, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  institutional: 3,
};

export function usePlan() {
  const user = useMeritStore((s) => s.user);
  const plan = (user?.plan ?? 'free') as Plan;

  return {
    plan,
    isPro: PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY.pro,
    isPremium: PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY.premium,
    isFree: plan === 'free',
    isInstitutional: plan === 'institutional',
    meetsMinimum: (required: Plan) =>
      (PLAN_HIERARCHY[plan] ?? 0) >= (PLAN_HIERARCHY[required] ?? 0),
  };
}
