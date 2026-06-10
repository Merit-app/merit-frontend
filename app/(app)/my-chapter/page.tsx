'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chapterApi } from '@/lib/api';
import { GraduationCap, CheckCircle2, AlertTriangle, CalendarDays, Clock, MapPin, Users, Eye, ShieldCheck, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyChapterPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => chapterApi.myChapter().then((r) => setData(r.data));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function consent() {
    await chapterApi.acknowledgeConsent().catch(() => {});
    load();
  }
  async function leave() {
    if (!confirm('Leave this chapter? Your coordinator will no longer see your hours. You can be re-added later.')) return;
    await chapterApi.leaveChapter().catch(() => {});
    router.push('/dashboard');
  }

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

      {/* Consent banner */}
      {!data.consentGiven && (
        <div className="rounded-xl border border-merit-blue-200 bg-merit-blue-50/60 p-4 dark:border-merit-blue-800/50 dark:bg-merit-blue-900/15">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-merit-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Your coordinator at {data.chapterName} can see your progress</p>
              <p className="mt-1 text-sm text-muted-foreground">
                They can view your <strong>verified service hours</strong>, sessions, and whether you&apos;ve met
                your requirement{data.isMinor ? ', as part of your school program' : ''}. They cannot see your
                password or change your account.
              </p>
              <button onClick={consent} className="mt-3 rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-merit-blue-700">
                I understand
              </button>
            </div>
          </div>
        </div>
      )}

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

      <Opportunities />

      <Link href="/log" className="block rounded-xl bg-merit-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-merit-blue-700">
        Log hours
      </Link>

      {/* Privacy & control */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">What {data.chapterName} can see</h3>
        </div>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• Your name, email, and graduation year</li>
          <li>• Your verified service hours and the sessions behind them</li>
          <li>• Whether you’ve met your requirement</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">They cannot see your password, log in as you, or edit your account.</p>
        <button onClick={leave} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700">
          <LogOut className="h-4 w-4" /> Leave this chapter
        </button>
      </div>
    </div>
  );
}

function Opportunities() {
  const [opps, setOpps] = useState<any[] | null>(null);

  const load = () => chapterApi.myOpportunities().then((r) => setOpps(r.data)).catch(() => setOpps([]));
  useEffect(() => { void load(); }, []);

  async function toggle(o: any) {
    if (o.mySignupStatus && o.mySignupStatus !== 'cancelled') {
      await chapterApi.cancelOpportunity(o.id).catch(() => {});
    } else {
      await chapterApi.signupOpportunity(o.id).catch(() => {});
    }
    load();
  }

  if (!opps || opps.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 font-medium text-foreground">Opportunities from your chapter</h3>
      <div className="space-y-3">
        {opps.map((o) => {
          const joined = o.mySignupStatus && o.mySignupStatus !== 'cancelled';
          return (
            <div key={o.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{o.title}</p>
                  {o.orgName && <p className="text-sm text-muted-foreground">{o.orgName}</p>}
                </div>
                <button
                  onClick={() => toggle(o)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    joined ? 'border border-border text-muted-foreground hover:text-foreground' : 'bg-merit-blue-600 text-white hover:bg-merit-blue-700'
                  }`}
                >
                  {joined ? (o.mySignupStatus === 'waitlisted' ? 'Waitlisted ✓' : 'Signed up ✓') : 'Sign up'}
                </button>
              </div>
              {o.description && <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>}
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {o.startsAt && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {new Date(o.startsAt).toLocaleString()}</span>}
                {o.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {o.location}</span>}
                {o.slots != null && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {o.signupCount}/{o.slots} signed up</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
