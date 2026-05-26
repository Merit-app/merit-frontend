import { formatDistanceToNow, parseISO } from 'date-fns';

interface Props {
  verifiedHours: number;
  totalOrgs: number;
  lastActive: string | null;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-xl border border-ink-200 px-4 py-3 text-center">
      <p className="text-xl font-bold text-ink-900 leading-tight">{value}</p>
      <p className="text-[11px] text-ink-500 mt-0.5 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

export function StatsRow({ verifiedHours, totalOrgs, lastActive }: Props) {
  const hoursDisplay = verifiedHours % 1 === 0
    ? String(verifiedHours)
    : verifiedHours.toFixed(1);

  const lastActiveDisplay = lastActive
    ? formatDistanceToNow(parseISO(lastActive), { addSuffix: true })
    : 'No activity yet';

  return (
    <div className="flex gap-3">
      <StatCard label="Verified Hours" value={hoursDisplay} />
      <StatCard label="Organizations" value={String(totalOrgs)} />
      <StatCard label="Last Active" value={lastActiveDisplay} />
    </div>
  );
}
