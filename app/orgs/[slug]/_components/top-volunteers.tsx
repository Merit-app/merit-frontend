import Link from 'next/link';

interface Volunteer {
  userId: string;
  name: string;
  username: string | null;
  verifiedHours: number;
  sessionCount: number;
}

interface Props {
  volunteers: Volunteer[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TopVolunteers({ volunteers }: Props) {
  if (volunteers.length === 0) {
    return (
      <section>
        <h2 className="text-[15px] font-semibold text-ink-900 mb-3">Top Volunteers</h2>
        <p className="text-sm text-ink-400">No public volunteer data available yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-[15px] font-semibold text-ink-900 mb-3">
        Top Volunteers
        <span className="ml-2 text-[12px] font-medium text-ink-400">{volunteers.length}</span>
      </h2>

      <div className="space-y-2">
        {volunteers.map((v, i) => {
          const hoursDisplay =
            v.verifiedHours % 1 === 0
              ? String(v.verifiedHours)
              : v.verifiedHours.toFixed(1);

          const inner = (
            <div className="flex items-center gap-3 bg-white rounded-xl border border-ink-200 px-4 py-3 hover:border-ink-300 transition-colors">
              {/* Rank */}
              <span className="text-[12px] font-bold text-ink-400 w-5 shrink-0 text-center">
                {i + 1}
              </span>
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
                style={{ background: '#DBEAFE', color: '#1D4ED8' }}
              >
                {getInitials(v.name)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink-900 truncate">{v.name}</p>
                {v.username && (
                  <p className="text-[11px] text-ink-400">@{v.username}</p>
                )}
              </div>
              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-[13px] font-bold text-ink-900">{hoursDisplay} hrs</p>
                <p className="text-[11px] text-ink-400">{v.sessionCount} session{v.sessionCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          );

          return v.username ? (
            <Link key={v.userId} href={`/u/${v.username}`} className="block">
              {inner}
            </Link>
          ) : (
            <div key={v.userId}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
