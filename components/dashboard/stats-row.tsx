'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMeritStore } from '@/lib/store';
import { parseISO, isWithinInterval, startOfWeek, endOfWeek, subWeeks, format, subDays } from 'date-fns';

// SSR-safe dynamic import for the sparkline
const SparklineChart = dynamic(() => import('./sparkline-chart'), {
  ssr: false,
  loading: () => <div className="h-10 w-full" />,
});

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  subPositive?: boolean;
  sparkData: { v: number }[];
}

function StatCard({ label, value, sub, subPositive, sparkData }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-5 flex flex-col gap-3">
      <p className="text-micro text-ink-500">{label}</p>
      <div>
        <p className="text-[28px] font-medium text-ink-900 leading-none tabular-nums">{value}</p>
        <p className={`text-[12px] mt-1 font-medium ${subPositive === true ? 'text-success' : subPositive === false ? 'text-danger' : 'text-ink-500'}`}>
          {sub}
        </p>
      </div>
      <div className="h-8">
        <SparklineChart data={sparkData} positive={subPositive !== false} />
      </div>
    </div>
  );
}

export function StatsRow() {
  const sessions = useMeritStore((s) => s.sessions);

  const stats = useMemo(() => {
    const verified = sessions.filter((s) => s.status === 'verified');
    const now = new Date();

    // This week vs last week hours
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
    const weekDelta = weekHours - prevWeekHours;

    // Verified rate
    const verifiedRate = sessions.length === 0 ? 0 : Math.round((verified.length / sessions.length) * 100);

    // Active orgs this year
    const thisYear = now.getFullYear();
    const activeOrgs = new Set(
      sessions
        .filter((s) => parseISO(s.date).getFullYear() === thisYear)
        .map((s) => s.orgSlug)
    ).size;

    // Sparkline data — last 8 weeks of daily hours for each stat
    function weeklySparkData() {
      return Array.from({ length: 8 }, (_, i) => {
        const wkStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
        const wkEnd = endOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
        const v = verified
          .filter((s) => isWithinInterval(parseISO(s.date), { start: wkStart, end: wkEnd }))
          .reduce((sum, s) => sum + s.hours, 0);
        return { v };
      });
    }

    function verifiedRateSparkData() {
      return Array.from({ length: 8 }, (_, i) => {
        const cutoff = subWeeks(now, 7 - i);
        const before = sessions.filter((s) => parseISO(s.date) <= cutoff);
        const v = before.length === 0 ? 0 : Math.round((before.filter((s) => s.status === 'verified').length / before.length) * 100);
        return { v };
      });
    }

    function orgSparkData() {
      return Array.from({ length: 8 }, (_, i) => {
        const wkStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
        const wkEnd = endOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
        const v = new Set(
          sessions
            .filter((s) => isWithinInterval(parseISO(s.date), { start: wkStart, end: wkEnd }))
            .map((s) => s.orgSlug)
        ).size;
        return { v };
      });
    }

    return { weekHours, weekDelta, verifiedRate, activeOrgs, weeklySparkData, verifiedRateSparkData, orgSparkData };
  }, [sessions]);

  const weekHoursStr = stats.weekHours % 1 === 0 ? stats.weekHours.toString() : stats.weekHours.toFixed(1);
  const deltaStr = stats.weekDelta === 0
    ? 'same as last week'
    : `${stats.weekDelta > 0 ? '+' : ''}${stats.weekDelta % 1 === 0 ? stats.weekDelta : stats.weekDelta.toFixed(1)} hrs vs last week`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="This week"
        value={`${weekHoursStr} hrs`}
        sub={deltaStr}
        subPositive={stats.weekDelta > 0 ? true : stats.weekDelta < 0 ? false : undefined}
        sparkData={stats.weeklySparkData()}
      />
      <StatCard
        label="Verified rate"
        value={`${stats.verifiedRate}%`}
        sub="of submissions"
        sparkData={stats.verifiedRateSparkData()}
      />
      <StatCard
        label="Active orgs"
        value={String(stats.activeOrgs)}
        sub="this year"
        sparkData={stats.orgSparkData()}
      />
    </div>
  );
}
