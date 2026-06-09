import type { Metadata } from 'next';
import { CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

// ─── Types ────────────────────────────────────────────────────────────────

interface OrgVerificationData {
  student: { name: string | null; school: string | null; grade: number | null };
  organization: { name: string | null; city: string | null; category: string | null };
  summary: {
    verifiedHours: number;
    totalHours: number;
    totalSessions: number;
    verifiedSessions: number;
    pendingSessions: number;
    disputedSessions: number;
    firstDate: string | null;
    lastDate: string | null;
  };
  sessions: Array<{
    id: string;
    date: string;
    hours: number;
    activity: string | null;
    status: 'verified' | 'pending' | 'disputed';
    verifiedAt: string | null;
    supervisorName: string | null;
  }>;
}

// ─── Data fetching ────────────────────────────────────────────────────────

async function getOrgVerification(userId: string, orgId: string): Promise<OrgVerificationData | null> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  try {
    const res = await fetch(`${apiUrl}/sessions/verify/org/${userId}/${orgId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

function fmtShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

const STATUS_BADGE = {
  verified: { icon: CheckCircle2, label: 'Verified', cls: 'text-green-600' },
  pending:  { icon: Clock,        label: 'Pending',  cls: 'text-amber-500' },
  disputed: { icon: XCircle,      label: 'Disputed', cls: 'text-red-500' },
} as const;

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function OrgVerifyPage({
  params,
}: {
  params: Promise<{ userId: string; orgId: string }>;
}) {
  const { userId, orgId } = await params;
  const data = await getOrgVerification(userId, orgId);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <XCircle className="w-16 h-16 text-red-300" />
          <h1 className="text-xl font-semibold text-gray-900">Record not found</h1>
          <p className="text-gray-500 text-center max-w-sm">
            These records may have been deleted or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const { student, organization, summary, sessions } = data;
  const hoursStr = (n: number) => (n % 1 === 0 ? `${n}` : n.toFixed(1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-2xl space-y-5">

          {/* ── Verified banner ── */}
          <div className="flex items-center gap-4 p-5 rounded-xl border bg-green-50 border-green-200 text-green-700">
            <ShieldCheck className="w-9 h-9 shrink-0 text-green-500" />
            <div>
              <p className="font-semibold text-lg leading-tight">
                {hoursStr(summary.verifiedHours)} verified {summary.verifiedHours === 1 ? 'hour' : 'hours'}
              </p>
              <p className="text-sm opacity-80 mt-0.5">
                {student.name ?? 'Student'} at {organization.name ?? 'this organization'}
              </p>
            </div>
          </div>

          {/* ── Summary stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Verified hours" value={hoursStr(summary.verifiedHours)} />
            <Stat label="Total logged" value={hoursStr(summary.totalHours)} />
            <Stat label="Verified sessions" value={`${summary.verifiedSessions}`} />
            <Stat label="Total sessions" value={`${summary.totalSessions}`} />
          </div>

          {/* ── Who / where ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Record summary</h2>
            <div className="divide-y divide-gray-100">
              {([
                { label: 'Student',      value: student.name },
                { label: 'School',       value: student.school },
                { label: 'Grade',        value: student.grade != null ? `Grade ${student.grade}` : null },
                { label: 'Organization', value: organization.name },
                { label: 'Location',     value: organization.city },
                { label: 'Date range',   value: summary.firstDate ? `${fmtDate(summary.firstDate)} – ${fmtDate(summary.lastDate)}` : null },
              ] as { label: string; value: string | null }[])
                .filter((r): r is { label: string; value: string } => Boolean(r.value))
                .map((r) => (
                  <div key={r.label} className="flex justify-between py-3 text-sm gap-4">
                    <span className="text-gray-500 shrink-0">{r.label}</span>
                    <span className="text-gray-900 font-medium text-right">{r.value}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* ── Session breakdown ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Sessions <span className="text-gray-400 font-normal">({sessions.length})</span>
            </h2>
            <div className="divide-y divide-gray-100">
              {sessions.map((sess) => {
                const badge = STATUS_BADGE[sess.status] ?? STATUS_BADGE.pending;
                const BadgeIcon = badge.icon;
                return (
                  <div key={sess.id} className="flex items-center gap-3 py-3 text-sm">
                    <span className="text-gray-400 w-28 shrink-0">{fmtShort(sess.date)}</span>
                    <span className="flex-1 text-gray-900 truncate">{sess.activity ?? 'Volunteer session'}</span>
                    <span className="text-gray-900 font-medium shrink-0">{hoursStr(sess.hours)}h</span>
                    <span className={`flex items-center gap-1 shrink-0 ${badge.cls}`}>
                      <BadgeIcon className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs">{badge.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Seal ── */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-500">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <span>This record is stored securely on Merit and reflects the student&apos;s current hours at this organization.</span>
          </div>

          <p className="text-center text-xs text-gray-400 pb-8">
            Powered by{' '}
            <a href="https://meritco.app" className="underline hover:text-gray-600">Merit</a>
            {' '}— Student volunteer hour verification
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <a href="https://meritco.app" className="font-bold text-gray-900 text-lg tracking-tight">merit.</a>
      <span className="text-sm text-gray-400">Hours Verification</span>
    </header>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Hours Verification',
    description: 'Verify a student’s total volunteer hours at an organization on Merit.',
  });
}
