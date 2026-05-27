'use client';

import { useMemo } from 'react';
import { useMeritStore } from '@/lib/store';
import { calculateStreak, formatStreak } from '@/lib/utils';

export function StreakDisplay() {
  const sessions = useMeritStore((s) => s.sessions);

  const streak = useMemo(() => {
    const sessionDates = sessions.map(s => s.date);
    return calculateStreak(sessionDates);
  }, [sessions]);

  if (streak === 0) {
    return (
      <div className="bg-white rounded-xl border border-ink-200 p-5 mb-6">
        <p className="text-[13px] text-ink-600">
          Log hours this week to start a streak 🔥
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-warning/20 to-merit-blue-50 rounded-xl border border-warning/30 p-5 mb-6">
      <p className="text-[28px] font-bold text-ink-900 mb-1">
        🔥 {formatStreak(streak)}
      </p>
      <p className="text-[13px] text-ink-600">Current streak</p>
    </div>
  );
}
