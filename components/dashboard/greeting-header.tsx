'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useMeritStore } from '@/lib/store';
import { getDynamicGreeting, formatHours } from '@/lib/utils';
import { parseISO, isWithinInterval, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

export function GreetingHeader() {
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);

  const { totalVerified, weekHours, prevWeekHours, lastSessionDate, subtext } = useMemo(() => {
    const verified = sessions.filter((s) => s.status === 'verified');
    const totalVerified = verified.reduce((sum, s) => sum + s.hours, 0);

    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const weekHours = verified
      .filter((s) => isWithinInterval(parseISO(s.date), { start: thisWeekStart, end: thisWeekEnd }))
      .reduce((sum, s) => sum + s.hours, 0);

    const prevWeekHours = verified
      .filter((s) => isWithinInterval(parseISO(s.date), { start: lastWeekStart, end: lastWeekEnd }))
      .reduce((sum, s) => sum + s.hours, 0);

    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
    const lastSessionDate = sorted[0]?.date ?? null;

    const subtext = getDynamicGreeting(
      totalVerified,
      user.nhsGoalHours,
      lastSessionDate,
      weekHours,
      prevWeekHours,
      user.goalProgram ?? null,
    );

    return { totalVerified, weekHours, prevWeekHours, lastSessionDate, subtext };
  }, [sessions, user.nhsGoalHours, user.goalProgram]);

  return (
    <div className="mb-8">
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight md:text-[36px] text-ink-900">
        Hey {user.firstName} —
      </h1>
      {subtext === null ? (
        <p className="mt-1.5 text-[16px] text-ink-500 leading-snug">
          <Link
            href="/settings/profile"
            className="text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
          >
            Set up your hours goal →
          </Link>
        </p>
      ) : (
        <p className="mt-1.5 text-[16px] text-ink-500 leading-snug">{subtext}</p>
      )}
    </div>
  );
}
