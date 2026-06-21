'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chapterApi, sessionsApi, mapSession } from '@/lib/api';
import { Clock, Building2, ShieldCheck, Eye, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CountUp, AnimatedProgress } from '@/components/motion';

interface OrgGroup {
  org: string;
  hours: number;
  sessions: number;
  institutional: boolean;
}

export default function MyChapterHoursPage() {
  const [chapter, setChapter] = useState<any>(null);
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      chapterApi.myChapter().then((r) => r.data).catch(() => null),
      sessionsApi.list({ limit: 500 }).then((r) => r.data ?? []).catch(() => []),
    ])
      .then(([ch, rawSessions]) => {
        setChapter(ch);
        const verified = (rawSessions as any[]).map(mapSession).filter((s) => s.status === 'verified');
        const byOrg = new Map<string, OrgGroup>();
        let total = 0;
        for (const s of verified) {
          total += s.hours;
          const key = s.org || 'Other';
          const g = byOrg.get(key) ?? { org: key, hours: 0, sessions: 0, institutional: false };
          g.hours += s.hours;
          g.sessions += 1;
          if (s.tier === 'institution') g.institutional = true;
          byOrg.set(key, g);
        }
        setVerifiedTotal(Math.round(total * 10) / 10);
        setGroups([...byOrg.values()].sort((a, b) => b.hours - a.hours));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <Clock className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">You&apos;re not in a chapter</h1>
        <Link href="/dashboard" className="mt-6 inline-block text-sm text-merit-blue-600 hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  const goal = chapter.goal || 0;
  const official = chapter.verifiedHours ?? verifiedTotal;
  const pct = goal > 0 ? Math.min(100, Math.round((official / goal) * 100)) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-2">
      <div>
        <Link href="/my-chapter" className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {chapter.chapterName}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Hours your school can see</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only <strong>verified</strong> service counts toward your requirement and is visible to {chapter.chapterName}.
        </p>
      </div>

      {/* Headline progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Verified hours toward requirement</p>
        <p className="text-4xl font-semibold tabular-nums text-foreground">
          <CountUp value={official} decimals={official % 1 === 0 ? 0 : 1} />
          <span className="text-xl text-muted-foreground"> / {goal || '—'}</span>
        </p>
        <div className="mt-3"><AnimatedProgress value={pct} className="h-3" aria-label="Progress toward requirement" /></div>
      </div>

      {/* By organization */}
      <div>
        <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">By organization</h2>
        {groups.length === 0 ? (
          <div className="rounded-xl border border-border">
            <EmptyState
              icon={Building2}
              title="No verified hours yet"
              description="Once a supervisor or organization verifies your hours, they'll appear here and count toward your requirement."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <ul className="divide-y divide-border">
              {groups.map((g) => (
                <li key={g.org} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-merit-blue-50">
                      <Building2 className="h-4 w-4 text-merit-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{g.org}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.sessions} session{g.sessions === 1 ? '' : 's'}
                        {g.institutional && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-green-600 dark:text-green-400">
                            <ShieldCheck className="h-3 w-3" /> org-verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 tabular-nums text-sm font-semibold text-foreground">{g.hours % 1 === 0 ? g.hours : g.hours.toFixed(1)}h</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Visibility note */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-2.5">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {chapter.chapterName} can see these verified hours and the sessions behind them — not your pending or
            self-tracked hours. <Link href="/hours" className="text-merit-blue-600 hover:underline">View all your sessions</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
