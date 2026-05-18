'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMeritStore } from '@/lib/store';
import { formatLongDate } from '@/lib/utils';

export function GoalProgressCard() {
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);

  const totalHours = sessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);

  const goal = user.nhsGoalHours;
  const pct = Math.min((totalHours / goal) * 100, 100);
  const remaining = Math.max(goal - totalHours, 0);

  // Animate progress bar from 0 → pct on mount
  const [displayPct, setDisplayPct] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 400;

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(eased * pct);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [pct]);

  const displayHours = totalHours % 1 === 0 ? totalHours.toString() : totalHours.toFixed(1);

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-ink-900">NHS service requirement</h3>
        <span className="text-[12px] font-medium text-ink-500 bg-ink-100 px-2.5 py-1 rounded-full">
          {goal} hrs
        </span>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-[32px] font-medium text-ink-900 leading-none tabular-nums">
          {displayHours}
        </span>
        <span className="text-[16px] text-ink-500">/ {goal} hrs</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-merit-blue-600 rounded-full transition-none"
          style={{ width: `${displayPct}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-small text-ink-500">
          Started {formatLongDate(user.nhsGoalStartDate)}
        </span>
        <Link
          href="/hours"
          className="text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
        >
          View all sessions →
        </Link>
      </div>
    </div>
  );
}
