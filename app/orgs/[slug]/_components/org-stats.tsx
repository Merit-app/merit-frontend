interface Props {
  totalVerifiedHours: number;
  totalVerifiedSessions: number;
  totalVolunteers: number;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-xl border border-ink-200 px-4 py-3 text-center">
      <p className="text-xl font-bold text-ink-900 leading-tight">{value}</p>
      <p className="text-[11px] text-ink-500 mt-0.5 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

export function OrgStats({ totalVerifiedHours, totalVerifiedSessions, totalVolunteers }: Props) {
  const hoursDisplay =
    totalVerifiedHours % 1 === 0
      ? String(totalVerifiedHours)
      : totalVerifiedHours.toFixed(1);

  return (
    <div className="flex gap-3">
      <StatCard label="Verified Hours" value={hoursDisplay} />
      <StatCard label="Sessions" value={String(totalVerifiedSessions)} />
      <StatCard label="Volunteers" value={String(totalVolunteers)} />
    </div>
  );
}
