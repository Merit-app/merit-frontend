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
  totalVolunteers: number;
}

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  { bg: '#DBEAFE', fg: '#1D4ED8' },
  { bg: '#D1FAE5', fg: '#065F46' },
  { bg: '#FDE68A', fg: '#92400E' },
  { bg: '#FCE7F3', fg: '#9D174D' },
  { bg: '#E0E7FF', fg: '#3730A3' },
  { bg: '#D1FAE5', fg: '#047857' },
  { bg: '#FEF3C7', fg: '#B45309' },
  { bg: '#F3E8FF', fg: '#6B21A8' },
];

export function OrgVolunteersCard({ volunteers, totalVolunteers }: Props) {
  const shown = volunteers.slice(0, 8);
  const overflow = totalVolunteers - shown.length;

  if (shown.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="text-[15px] font-semibold text-foreground mb-4">Recent Volunteers</h2>

      <div className="flex flex-wrap gap-2 mb-3">
        {shown.map((v, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const avatar = (
            <div
              key={v.userId}
              title={v.name}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 cursor-default"
              style={{ background: color.bg, color: color.fg }}
            >
              {getInitials(v.name)}
            </div>
          );

          return v.username ? (
            <Link key={v.userId} href={`/u/${v.username}`} title={v.name}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 hover:ring-2 hover:ring-merit-blue-400 transition-all"
                style={{ background: color.bg, color: color.fg }}
              >
                {getInitials(v.name)}
              </div>
            </Link>
          ) : (
            <div
              key={v.userId}
              title={v.name}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
              style={{ background: color.bg, color: color.fg }}
            >
              {getInitials(v.name)}
            </div>
          );
        })}
      </div>

      {overflow > 0 && (
        <p className="text-[12px] text-muted-foreground">
          And <span className="font-medium">{overflow}</span> others have volunteered here
        </p>
      )}
    </div>
  );
}
