'use client';

/**
 * /verify?token=…&response=YES|NO|STOP
 *
 * The page a supervisor lands on from the verification email. It looks up what
 * the token is asking them to confirm, shows it, and only acts on an explicit
 * button click — never auto-POSTs on load, so corporate email link-scanners
 * (Outlook SafeLinks, antivirus prefetch) can't silently verify hours.
 *
 * Public: the token is the credential. Backend: GET /verifications/lookup +
 * POST /verifications/confirm-magic-link.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  BellOff,
} from 'lucide-react';
import { verificationsApi, type VerificationLookup } from '@/lib/api';

type Intent = 'YES' | 'NO' | 'STOP';

function normalizeIntent(raw: string | null): Intent {
  const v = (raw ?? 'YES').toUpperCase();
  return v === 'NO' || v === 'STOP' ? (v as Intent) : 'YES';
}

function formatDate(date: string | null): string | null {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-foreground">
          merit<span className="text-merit-blue-600">.</span>
        </span>
        <span className="text-sm text-muted-foreground">Hour Verification</span>
      </header>
      <main className="flex-1 flex items-start justify-center p-6 pt-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

function Centered({ icon, title, body, tone = 'muted' }: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: 'success' | 'danger' | 'muted';
}) {
  const ring =
    tone === 'success' ? 'bg-success/10 text-success'
    : tone === 'danger' ? 'bg-destructive/10 text-destructive'
    : 'bg-muted text-muted-foreground';
  return (
    <div className="flex flex-col items-center text-center gap-4 pt-8">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${ring}`}>{icon}</div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground max-w-sm">{body}</p>
    </div>
  );
}

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const intent = normalizeIntent(params.get('response'));

  const [lookup, setLookup] = useState<VerificationLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'verified' | 'disputed' | 'opt_out' | 'error' | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) { setLoading(false); return; }
    verificationsApi
      .lookup(token)
      .then((r) => { if (active) setLookup(r.data); })
      .catch(() => { if (active) setLookup({ state: 'invalid' }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function submit() {
    setSubmitting(true);
    try {
      const r = await verificationsApi.confirm(token, intent);
      const handled = r.data?.handled;
      setResult(handled === 'verified' ? 'verified' : handled === 'disputed' ? 'disputed' : handled === 'opt_out' ? 'opt_out' : 'verified');
    } catch {
      setResult('error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Terminal states ──────────────────────────────────────────────────────
  if (result === 'verified') {
    return <Centered tone="success" icon={<CheckCircle2 className="h-8 w-8" />} title="Hours verified — thank you" body="You've confirmed these volunteer hours. The student has been notified. You can close this page." />;
  }
  if (result === 'disputed') {
    return <Centered tone="danger" icon={<XCircle className="h-8 w-8" />} title="Marked as disputed" body="Thanks for letting us know. We've flagged these hours and notified the student. You can close this page." />;
  }
  if (result === 'opt_out') {
    return <Centered icon={<BellOff className="h-8 w-8" />} title="You're unsubscribed" body="You won't receive further verification messages at this address. You can close this page." />;
  }
  if (result === 'error') {
    return <Centered tone="danger" icon={<XCircle className="h-8 w-8" />} title="Something went wrong" body="We couldn't record your response. The link may have expired or already been used. Please ask the student to resend the request." />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading verification…</p>
      </div>
    );
  }

  if (!token || !lookup || lookup.state === 'invalid') {
    return <Centered tone="danger" icon={<XCircle className="h-8 w-8" />} title="Link not valid" body="This verification link is invalid. It may have been mistyped or already used. Please ask the student to resend it." />;
  }
  if (lookup.state === 'expired') {
    return <Centered icon={<Clock className="h-8 w-8" />} title="Link expired" body="This verification link has expired. Please ask the student to send a new request." />;
  }
  if (lookup.state === 'already_responded') {
    return <Centered tone="success" icon={<CheckCircle2 className="h-8 w-8" />} title="Already answered" body="This verification has already been responded to. No further action is needed — you can close this page." />;
  }

  // ── Pending: show what they're confirming + require a click ──────────────
  const rows = [
    { label: 'Student', value: lookup.studentName },
    { label: 'Organization', value: lookup.orgName },
    { label: 'Hours', value: `${lookup.hours} hours` },
    { label: 'Date', value: formatDate(lookup.date) },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value));

  const isDispute = intent === 'NO';
  const isStop = intent === 'STOP';

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-merit-blue-600/10 text-merit-blue-600">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {isStop ? 'Unsubscribe from verifications?' : isDispute ? 'Report a problem with these hours?' : 'Confirm these volunteer hours'}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground max-w-sm">
          {isStop
            ? 'You will stop receiving verification messages at this address.'
            : isDispute
              ? `${lookup.studentName} listed you as their supervisor. If this looks wrong, let us know.`
              : `${lookup.studentName} listed you as their supervisor and is asking you to confirm the hours below.`}
        </p>
      </div>

      {!isStop && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 py-3 text-sm">
                <span className="text-muted-foreground shrink-0">{r.label}</span>
                <span className="text-foreground font-medium text-right">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-60 ${
          isDispute || isStop ? 'bg-destructive' : 'bg-merit-blue-600 hover:bg-merit-blue-700'
        }`}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isStop ? 'Unsubscribe' : isDispute ? 'Yes, report a problem' : 'Yes, I verify these hours'}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Powered by Merit — student volunteer hour verification. If you didn&apos;t expect this, you can ignore it.
      </p>
    </div>
  );
}

export default function VerifyConfirmPage() {
  return (
    <Suspense fallback={null}>
      <Shell>
        <VerifyInner />
      </Shell>
    </Suspense>
  );
}
