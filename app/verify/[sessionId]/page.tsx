import type { Metadata } from 'next';
import { CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

// ─── Types ────────────────────────────────────────────────────────────────

interface VerificationData {
  id: string;
  date: string;
  hours: number;
  activity: string | null;
  status: 'verified' | 'pending' | 'disputed';
  verifiedAt: string | null;
  supervisorName: string | null;
  student: {
    name: string | null;
    school: string | null;
    grade: number | null;
  };
  organization: {
    name: string | null;
    city: string | null;
    category: string | null;
  };
}

// ─── Data fetching ────────────────────────────────────────────────────────

async function getSessionVerification(sessionId: string): Promise<VerificationData | null> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  try {
    const res = await fetch(`${apiUrl}/sessions/verify/${sessionId}`, {
      cache: 'no-store', // always fresh — verification pages must reflect current state
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─── Status config (semantic tokens → dark-mode correct) ────────────────────

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    wrapperClass: 'bg-success/10 border-success/30 text-success',
    iconClass: 'text-success',
  },
  pending: {
    icon: Clock,
    label: 'Pending Verification',
    wrapperClass: 'bg-warning/10 border-warning/30 text-warning',
    iconClass: 'text-warning',
  },
  disputed: {
    icon: XCircle,
    label: 'Disputed',
    wrapperClass: 'bg-destructive/10 border-destructive/30 text-destructive',
    iconClass: 'text-destructive',
  },
} as const;

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getSessionVerification(sessionId);

  // ── Not found ──
  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <XCircle className="w-16 h-16 text-destructive/40" />
          <h1 className="text-xl font-semibold text-foreground">Record not found</h1>
          <p className="text-muted-foreground text-center max-w-sm">
            This session may have been deleted or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const formattedDate = (() => {
    try {
      return new Date(session.date).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return session.date;
    }
  })();

  const formattedVerifiedAt = session.verifiedAt
    ? (() => {
        try {
          return new Date(session.verifiedAt).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } catch {
          return session.verifiedAt;
        }
      })()
    : null;

  const detailRows = [
    { label: 'Student',      value: session.student.name },
    { label: 'School',       value: session.student.school },
    { label: 'Grade',        value: session.student.grade != null ? `Grade ${session.student.grade}` : null },
    { label: 'Organization', value: session.organization.name },
    { label: 'Location',     value: session.organization.city },
    { label: 'Date',         value: formattedDate },
    { label: 'Hours',        value: session.hours != null ? `${session.hours} hours` : null },
    { label: 'Activity',     value: session.activity },
    { label: 'Supervisor',   value: session.supervisorName },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 flex items-start justify-center p-6 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-lg space-y-5">

          {/* ── Status badge ── */}
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${status.wrapperClass}`}>
            <StatusIcon className={`w-8 h-8 shrink-0 ${status.iconClass}`} />
            <div>
              <p className="font-semibold text-lg leading-tight">{status.label}</p>
              {formattedVerifiedAt && (
                <p className="text-sm opacity-75 mt-0.5">Verified on {formattedVerifiedAt}</p>
              )}
            </div>
          </div>

          {/* ── Session details card ── */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Session Record</h2>
            <div className="divide-y divide-border">
              {detailRows.map((row) => (
                <div key={row.label} className="flex justify-between py-3 text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">{row.label}</span>
                  <span className="text-foreground font-medium text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Merit seal ── */}
          <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border text-sm text-muted-foreground">
            <ShieldCheck className="w-5 h-5 text-merit-blue-600 shrink-0 mt-0.5" />
            <span>
              This record is stored securely on Merit and has not been altered.{' '}
              Record ID:{' '}
              <code className="text-xs font-mono text-muted-foreground/70 break-all">{session.id}</code>
            </span>
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-xs text-muted-foreground pb-8">
            Powered by{' '}
            <a href="https://www.meritco.app" className="underline hover:text-foreground">
              Merit
            </a>
            {' '}— Student volunteer hour verification
          </p>

        </div>
      </main>
    </div>
  );
}

// ─── Minimal header ───────────────────────────────────────────────────────

function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <a href="https://www.meritco.app" className="font-bold text-foreground text-lg tracking-tight">
        merit<span className="text-merit-blue-600">.</span>
      </a>
      <span className="text-sm text-muted-foreground">Session Verification</span>
    </header>
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}): Promise<Metadata> {
  return buildMetadata({
    title: 'Session Verification',
    description: 'Verify a student volunteer hour record on Merit. Independently confirm hours logged and supervisor-verified.',
  });
}
