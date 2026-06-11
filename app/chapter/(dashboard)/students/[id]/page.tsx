'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { chapterApi, ApiError } from '@/lib/api';
import { ArrowLeft, CheckCircle2, AlertTriangle, Plus, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chapterApi.getStudent(id);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    );
  }
  if (!data) return <div className="text-muted-foreground">Student not found.</div>;

  const s = data.student;
  const pct = data.goal > 0 ? Math.min(100, Math.round((data.verifiedHours / data.goal) * 100)) : 0;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/chapter/roster" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to students
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-merit-blue-50 text-lg font-bold text-merit-blue-600">
            {s.name?.[0] ?? '?'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{s.name}</h1>
            <p className="text-sm text-muted-foreground">{s.email}</p>
            <p className="text-xs text-muted-foreground">
              {s.school ? `${s.school} · ` : ''}{s.graduationYear ? `Class of ${s.graduationYear}` : 'No grad year'}
            </p>
          </div>
        </div>
        <StatusPill status={data.status} />
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Verified hours</p>
            <p className="text-3xl font-semibold tabular-nums text-foreground">
              {data.verifiedHours}<span className="text-lg text-muted-foreground"> / {data.goal || '—'}</span>
            </p>
          </div>
          {data.remaining > 0 && data.goal > 0 && (
            <p className="text-sm text-muted-foreground">{data.remaining} hrs remaining</p>
          )}
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-merit-blue-600" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <GoalCard studentId={id} current={s.goalOverride} effective={data.goal} onSaved={load} />
        <AdjustCard studentId={id} onSaved={load} />
      </div>

      {/* Adjustments */}
      {data.adjustments?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-2 font-medium text-foreground">Hour adjustments</h3>
          <ul className="space-y-1.5 text-sm">
            {data.adjustments.map((a: any) => (
              <li key={a.id} className="flex justify-between">
                <span className="text-muted-foreground">{a.reason || 'Adjustment'} · {new Date(a.createdAt).toLocaleDateString()}</span>
                <span className={a.hours >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {a.hours >= 0 ? '+' : ''}{a.hours} hrs
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sessions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-medium text-foreground">Logged sessions</h3>
        {data.sessions?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions yet.</p>
        ) : (
          <div className="space-y-1.5">
            {data.sessions.map((x: any) => (
              <div key={x.id} className="flex items-center justify-between border-b border-border/50 py-2 text-sm last:border-0">
                <div>
                  <span className="text-foreground">{x.orgName ?? 'Self-tracked'}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{x.date ? new Date(x.date).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-foreground">{x.hours} hrs</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    x.selfReported ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : x.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {x.selfReported ? 'self' : x.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    met: { label: 'Met requirement', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    on_track: { label: 'On track', cls: 'bg-merit-blue-50 text-merit-blue-700 dark:bg-merit-blue-900/30 dark:text-merit-blue-300' },
    at_risk: { label: 'At risk', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    no_goal: { label: 'No goal set', cls: 'bg-muted text-muted-foreground' },
  };
  const b = map[status] ?? map.no_goal;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${b.cls}`}>
      {status === 'met' && <CheckCircle2 className="h-3.5 w-3.5" />}
      {(status === 'at_risk' || status === 'overdue') && <AlertTriangle className="h-3.5 w-3.5" />}
      {b.label}
    </span>
  );
}

function GoalCard({ studentId, current, effective, onSaved }: { studentId: string; current: number | null; effective: number; onSaved: () => void }) {
  const [value, setValue] = useState(current != null ? String(current) : '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(clear = false) {
    setBusy(true); setMsg(null);
    try {
      await chapterApi.setStudentGoal(studentId, clear ? null : Math.max(0, parseInt(value || '0', 10) || 0));
      setMsg('Saved');
      if (clear) setValue('');
      onSaved();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : 'Failed');
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center gap-1.5"><Target className="h-4 w-4 text-merit-blue-600" /><h3 className="font-medium text-foreground">Individual goal</h3></div>
      <p className="mb-3 text-xs text-muted-foreground">Override the cohort goal for this student. Effective goal: {effective} hrs.</p>
      <div className="flex items-center gap-2">
        <input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 20"
          className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button onClick={() => save(false)} disabled={busy} className="rounded-lg bg-merit-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-merit-blue-700 disabled:opacity-60">Set</button>
        {current != null && <button onClick={() => save(true)} disabled={busy} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>}
      </div>
      {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}

function AdjustCard({ studentId, onSaved }: { studentId: string; onSaved: () => void }) {
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    const h = parseFloat(hours);
    if (!h) { setMsg('Enter a non-zero number'); return; }
    setBusy(true); setMsg(null);
    try {
      await chapterApi.adjustHours(studentId, { hours: h, reason: reason || undefined });
      setHours(''); setReason(''); setMsg('Recorded');
      onSaved();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : 'Failed');
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center gap-1.5"><Plus className="h-4 w-4 text-merit-blue-600" /><h3 className="font-medium text-foreground">Grant / waive hours</h3></div>
      <p className="mb-3 text-xs text-muted-foreground">Add credit (e.g. +5) or remove (e.g. -2). Counts toward their goal.</p>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="± hrs"
            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={submit} disabled={busy} className="w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background disabled:opacity-60">
          {busy ? 'Saving…' : 'Apply adjustment'}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
