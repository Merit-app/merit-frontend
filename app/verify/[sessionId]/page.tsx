import type { Metadata } from 'next';
import { CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

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

// ─── Status config ────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    wrapperClass: 'bg-green-50 border-green-200 text-green-700',
    iconClass: 'text-green-500',
  },
  pending: {
    icon: Clock,
    label: 'Pending Verification',
    wrapperClass: 'bg-amber-50 border-amber-200 text-amber-700',
    iconClass: 'text-amber-500',
  },
  disputed: {
    icon: XCircle,
    label: 'Disputed',
    wrapperClass: 'bg-red-50 border-red-200 text-red-700',
    iconClass: 'text-red-500',
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <XCircle className="w-16 h-16 text-red-300" />
          <h1 className="text-xl font-semibold text-gray-900">Record not found</h1>
          <p className="text-gray-500 text-center max-w-sm">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-start justify-center p-6 pt-12">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Session Record</h2>
            <div className="divide-y divide-gray-100">
              {detailRows.map((row) => (
                <div key={row.label} className="flex justify-between py-3 text-sm gap-4">
                  <span className="text-gray-500 shrink-0">{row.label}</span>
                  <span className="text-gray-900 font-medium text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Merit seal ── */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-500">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <span>
              This record is stored securely on Merit and has not been altered.{' '}
              Record ID:{' '}
              <code className="text-xs font-mono text-gray-400 break-all">{session.id}</code>
            </span>
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-xs text-gray-400 pb-8">
            Powered by{' '}
            <a href="https://meritco.app" className="underline hover:text-gray-600">
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
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <a href="https://meritco.app" className="font-bold text-gray-900 text-lg tracking-tight">
        merit.
      </a>
      <span className="text-sm text-gray-400">Session Verification</span>
    </header>
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}): Promise<Metadata> {
  return {
    title: 'Session Verification — Merit',
    description: 'Verify a student volunteer hour record on Merit.',
    robots: 'noindex, nofollow',
  };
}
