import type { OrgStats } from '@/lib/types';

interface Props {
  stats: OrgStats | null;
  loading?: boolean;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-ink-900">{value}</p>
      <p className="text-[11px] font-medium text-ink-500 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

export function OrgCommunityCard({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-ink-200 p-5">
        <h2 className="text-[15px] font-semibold text-ink-900 mb-4">Merit Community</h2>
        <div className="flex gap-6 justify-around">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-7 w-12 bg-ink-100 rounded animate-pulse mx-auto" />
              <div className="h-3 w-16 bg-ink-100 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalStudents === 0) {
    return (
      <div className="bg-white rounded-xl border border-ink-200 p-5">
        <h2 className="text-[15px] font-semibold text-ink-900 mb-3">Merit Community</h2>
        <p className="text-sm text-ink-500">
          No volunteer sessions logged yet. Be the first!
        </p>
      </div>
    );
  }

  const hoursDisplay = stats.totalHours % 1 === 0 ? String(stats.totalHours) : stats.totalHours.toFixed(1);
  const avgDisplay = stats.avgSessionHours % 1 === 0 ? `${stats.avgSessionHours}h` : `${stats.avgSessionHours.toFixed(1)}h`;

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-5">
      <h2 className="text-[15px] font-semibold text-ink-900 mb-4">Merit Community</h2>

      {/* Big stats row */}
      <div className="flex gap-4 justify-around mb-4 pb-4 border-b border-ink-100">
        <Stat label="Students" value={String(stats.totalStudents)} />
        <Stat label="Total Hours" value={hoursDisplay} />
        <Stat label="Avg Session" value={avgDisplay} />
      </div>

      {/* Secondary info */}
      <div className="space-y-1.5 text-[13px] text-ink-600">
        {stats.mostActiveMonths.length > 0 && (
          <p>
            <span className="text-ink-400">Most active in:</span>{' '}
            <span className="font-medium text-ink-700">{stats.mostActiveMonths.join(', ')}</span>
          </p>
        )}
        <p>
          <span className="font-medium text-ink-700">{stats.recentVolunteerCount}</span>{' '}
          {stats.recentVolunteerCount === 1 ? 'student' : 'students'} volunteered this month
        </p>
      </div>
    </div>
  );
}
