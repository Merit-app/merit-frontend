'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chapterApi } from '@/lib/api';
import { GraduationCap, CheckCircle2, AlertTriangle, CalendarDays, Clock } from 'lucide-react';

export default function MyChapterPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chapterApi.myChapter().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  if (!data) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <GraduationCap className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">You&apos;re not in a chapter</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          When your school or honor-society coordinator adds you, your requirement and progress will
          show up here.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block text-sm text-merit-blue-600 hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  const pct = data.goal > 0 ? Math.min(100, Math.round((data.verifiedHours / data.goal) * 100)) : 0;
  const statusMap: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    met: { label: 'Requirement met', cls: 'text-green-600 dark:text-green-400', icon: <CheckCircle2 className="h-4 w-4" /> },
    on_track: { label: 'On track', cls: 'text-merit-blue-600 dark:text-merit-blue-400', icon: <Clock className="h-4 w-4" /> },
    at_risk: { label: 'At risk — pick up the pace', cls: 'text-amber-600 dark:text-amber-400', icon: <AlertTriangle className="h-4 w-4" /> },
    overdue: { label: 'Overdue', cls: 'text-red-600 dark:text-red-400', icon: <AlertTriangle className="h-4 w-4" /> },
    no_goal: { label: 'No goal set yet', cls: 'text-muted-foreground', icon: <Clock className="h-4 w-4" /> },
  };
  const st = statusMap[data.status] ?? statusMap.no_goal;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-merit-blue-50">
          <GraduationCap className="h-5 w-5 text-merit-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{data.chapterName}</h1>
          <p className={`flex items-center gap-1.5 text-sm font-medium ${st.cls}`}>{st.icon}{st.label}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Verified hours toward requirement</p>
            <p className="text-4xl font-semibold tabular-nums text-foreground">
              {data.verifiedHours}<span className="text-xl text-muted-foreground"> / {data.goal || '—'}</span>
            </p>
          </div>
          {data.remaining > 0 && data.goal > 0 && (
            <p className="text-sm text-muted-foreground">{data.remaining} to go</p>
          )}
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-merit-blue-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Deadline */}
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
            ? `Your deadline (${new Date(data.deadline).toLocaleDateString()}) has passed.`
            : `${data.daysToDeadline} days until your deadline (${new Date(data.deadline).toLocaleDateString()}).`}
        </div>
      )}

      <Link href="/log" className="block rounded-xl bg-merit-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-merit-blue-700">
        Log hours
      </Link>
    </div>
  );
}
