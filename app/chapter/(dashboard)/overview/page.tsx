'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chapterApi, type ChapterOverview } from '@/lib/api';
import { Users, CheckCircle2, AlertTriangle, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CountUp, AnimatedProgress } from '@/components/motion';

export default function OverviewPage() {
  const [data, setData] = useState<ChapterOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chapterApi.getOverview().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      </div>
    );
  }
  if (!data) return <div className="text-muted-foreground">Could not load overview.</div>;

  const pct = data.totalStudents > 0 ? Math.round((data.metCount / data.totalStudents) * 100) : 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{data.chapterName}</h1>
        <p className="text-sm text-muted-foreground">
          {data.requiredHours > 0
            ? `${data.requiredHours} verified hours required${data.deadline ? ` · due ${new Date(data.deadline).toLocaleDateString()}` : ''}`
            : 'No requirement set yet — configure it in Settings.'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<Users className="h-4 w-4" />} label="Students" value={data.totalStudents} />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Met requirement" value={data.metCount} tone="success" />
        <Stat icon={<AlertTriangle className="h-4 w-4" />} label="At risk" value={data.atRiskCount} tone="warning" />
        <Stat icon={<Clock className="h-4 w-4" />} label="Avg hours" value={data.avgHours} />
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Cohort progress</h2>
          <span className="text-sm text-muted-foreground">{pct}% met</span>
        </div>
        <AnimatedProgress value={pct} aria-label="Cohort progress" />
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {data.metCount} met</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-merit-blue-500" /> {data.incompleteCount} in progress</span>
          <span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {data.atRiskCount} at risk</span>
        </div>
      </div>

      {/* Deadline banner */}
      {data.deadline && data.daysToDeadline != null && (
        <div className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
          data.daysToDeadline < 0
            ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300'
            : data.daysToDeadline <= 60
              ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200'
              : 'border-border bg-card text-muted-foreground'
        }`}>
          <CalendarDays className="h-4 w-4 shrink-0" />
          {data.daysToDeadline < 0
            ? `Requirement deadline passed ${Math.abs(data.daysToDeadline)} days ago.`
            : `${data.daysToDeadline} days until the requirement deadline.`}
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/chapter/roster" className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:border-merit-blue-300 hover:shadow-[var(--shadow-elevated)] transition-all">
          <div>
            <h3 className="font-medium text-foreground">View students</h3>
            <p className="text-sm text-muted-foreground">Search, filter, and manage progress.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-merit-blue-600 transition-colors" />
        </Link>
        <Link href="/chapter/settings" className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:border-merit-blue-300 hover:shadow-[var(--shadow-elevated)] transition-all">
          <div>
            <h3 className="font-medium text-foreground">Requirement & goals</h3>
            <p className="text-sm text-muted-foreground">Set hours, deadline, and cohort goals.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-merit-blue-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone?: 'success' | 'warning' }) {
  const toneCls = tone === 'success' ? 'text-green-600 dark:text-green-400'
    : tone === 'warning' ? 'text-amber-600 dark:text-amber-400'
    : 'text-foreground';
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneCls}`}>
        <CountUp value={value} duration={0.7} decimals={value % 1 === 0 ? 0 : 1} />
      </div>
    </div>
  );
}
