'use client';

import { useMemo } from 'react';
import { useMeritStore, useHydrationStore } from '@/lib/store';

export function SelfTrackedStat() {
  const hydrated = useHydrationStore((s) => s.hydrated);
  const sessions = useMeritStore((s) => s.sessions);

  const selfReportedHours = useMemo(() => {
    return sessions
      .filter((s) => s.selfReported)
      .reduce((sum, s) => sum + s.hours, 0);
  }, [sessions]);

  if (!hydrated || selfReportedHours === 0) return null;

  const display = selfReportedHours % 1 === 0
    ? selfReportedHours.toString()
    : selfReportedHours.toFixed(1);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-amber-700">Self-tracked hours</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">{display}h</p>
          <p className="text-xs text-amber-600 mt-1">Not included in verified total or leaderboard</p>
        </div>
      </div>
    </div>
  );
}
