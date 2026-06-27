'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chapterApi, sessionsApi, mapSession } from '@/lib/api';
import { Clock, Building2, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CountUp, AnimatedProgress } from '@/components/motion';

interface OrgGroup {
  org: string;
  orgId: string;
  hours: number;
  sessions: number;
  institutional: boolean;
  shared: boolean;
  sessionIds: string[];
}

export default function MyChapterHoursPage() {
  const [chapter, setChapter] = useState<any>(null);
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrg, setBusyOrg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      chapterApi.myChapter().then((r) => r.data).catch(() => null),
      sessionsApi.list({ limit: 500 }).then((r) => r.data ?? []).catch(() => []),
    ])
      .then(([ch, rawSessions]) => {
        setChapter(ch);
        const verified = (rawSessions as any[]).map(mapSession).filter((s) => s.status === 'verified');
        const byOrg = new Map<string, OrgGroup>();
        for (const s of verified) {
          const key = s.orgSlug || s.org || 'other';
          const g =
            byOrg.get(key) ??
            { org: s.org || 'Other', orgId: s.orgSlug, hours: 0, sessions: 0, institutional: false, shared: true, sessionIds: [] };
          g.hours += s.hours;
          g.sessions += 1;
          g.sessionIds.push(s.id);
          if (s.tier === 'institution') g.institutional = true;
          if (s.sharedWithChapter === false) g.shared = false;
          byOrg.set(key, g);
        }
        setGroups([...byOrg.values()].sort((a, b) => b.hours - a.hours));
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleOrg(g: OrgGroup) {
    const next = !g.shared;
    setBusyOrg(g.orgId || g.org);
    setGroups((prev) => prev.map((x) => (x === g ? { ...x, shared: next } : x)));
    try {
      await sessionsApi.setShared(
        g.orgId ? { orgId: g.orgId, shared: next } : { sessionIds: g.sessionIds, shared: next },
      );
    } catch {
      // revert on failure
      setGroups((prev) => prev.map((x) => (x.org === g.org && x.orgId === g.orgId ? { ...x, shared: g.shared } : x)));
    } finally {
      setBusyOrg(null);
    }
  }

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
  const sharedHours = Math.round(groups.filter((g) => g.shared).reduce((s, g) => s + g.hours, 0) * 10) / 10;
  const hiddenHours = Math.round(groups.filter((g) => !g.shared).reduce((s, g) => s + g.hours, 0) * 10) / 10;
  const pct = goal > 0 ? Math.min(100, Math.round((sharedHours / goal) * 100)) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-2">
      <div>
        <Link href="/my-chapter" className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {chapter.chapterName}
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Choose what your school sees</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You control which verified hours are shared with {chapter.chapterName}. Only <strong>shared</strong> hours count
          toward your requirement and appear on their dashboard.
        </p>
      </div>

      {/* Headline progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Shared hours toward requirement</p>
        <p className="text-4xl font-semibold tabular-nums text-foreground">
          <CountUp value={sharedHours} decimals={sharedHours % 1 === 0 ? 0 : 1} />
          <span className="text-xl text-muted-foreground"> / {goal || '—'}</span>
        </p>
        <div className="mt-3"><AnimatedProgress value={pct} className="h-3" aria-label="Progress toward requirement" /></div>
        {hiddenHours > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {hiddenHours % 1 === 0 ? hiddenHours : hiddenHours.toFixed(1)}h hidden from your school
          </p>
        )}
      </div>

      {/* By organization — each with a share toggle */}
      <div>
        <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">By organization</h2>
        {groups.length === 0 ? (
          <div className="rounded-xl border border-border">
            <EmptyState
              icon={Building2}
              title="No verified hours yet"
              description="Once a supervisor or organization verifies your hours, they'll appear here and you can choose whether to share them with your school."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <ul className="divide-y divide-border">
              {groups.map((g) => (
                <li key={g.orgId || g.org} className={`flex items-center justify-between gap-3 px-4 py-3 ${g.shared ? '' : 'opacity-60'}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-merit-blue-50">
                      <Building2 className="h-4 w-4 text-merit-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{g.org}</p>
                      <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                        <span>{g.hours % 1 === 0 ? g.hours : g.hours.toFixed(1)}h · {g.sessions} session{g.sessions === 1 ? '' : 's'}</span>
                        {g.institutional && (
                          <span className="inline-flex items-center gap-0.5 text-green-600 dark:text-green-400">
                            <ShieldCheck className="h-3 w-3" /> org-verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleOrg(g)}
                    disabled={busyOrg === (g.orgId || g.org)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      g.shared
                        ? 'border-merit-blue-200 bg-merit-blue-50 text-merit-blue-700 dark:border-merit-blue-900 dark:bg-merit-blue-900/30 dark:text-merit-blue-300'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                    aria-pressed={g.shared}
                  >
                    {g.shared ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {g.shared ? 'Shared' : 'Hidden'}
                  </button>
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
            {chapter.chapterName} only sees the organizations you mark <strong>Shared</strong> — never your pending,
            self-tracked, or hidden hours. <Link href="/hours" className="text-merit-blue-600 hover:underline">View all your sessions</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
