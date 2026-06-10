'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMeritStore } from '@/lib/store';
import { calculateStreak, formatStreak } from '@/lib/utils';

export function StreakDisplay() {
  const sessions = useMeritStore((s) => s.sessions);
  const reduce = useReducedMotion();

  const streak = useMemo(() => {
    const sessionDates = sessions.map(s => s.date);
    return calculateStreak(sessionDates);
  }, [sessions]);

  if (streak === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border px-5 py-4 mb-6 flex items-center gap-3">
        <span className="text-xl" aria-hidden>🔥</span>
        <p className="text-[13px] text-muted-foreground">
          Log hours this week to start a streak.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-warning/30 bg-gradient-to-br from-warning/15 via-card to-merit-blue-50/60 px-5 py-4 mb-6">
      <div className="flex items-center gap-3.5">
        <motion.span
          className="text-3xl"
          aria-hidden
          initial={reduce ? false : { scale: 0.5, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.1 }}
        >
          🔥
        </motion.span>
        <div>
          <p className="text-[22px] font-semibold leading-tight text-foreground">
            {formatStreak(streak)}
          </p>
          <p className="text-[12px] text-muted-foreground">Current streak — keep it alive</p>
        </div>
      </div>
    </div>
  );
}
