import { Globe } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Props {
  name: string;
  username: string;
  school: string | null;
  grade: number | null;
  graduationYear: number | null;
  memberSince: string;
  bio: string | null;
}

export function ProfileHero({ name, username, school, grade, graduationYear, memberSince, bio }: Props) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const schoolLine = [school, grade ? `Grade ${grade}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col sm:flex-row items-start gap-5 pb-6 border-b border-ink-200">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold shrink-0"
        style={{ background: '#DBEAFE', color: '#1D4ED8' }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-ink-900 leading-tight">{name}</h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-merit-blue-700 bg-merit-blue-50 border border-merit-blue-200 px-2 py-0.5 rounded-full">
            <Globe size={10} />
            Public profile
          </span>
        </div>

        <p className="text-sm text-ink-500 mb-0.5">@{username}</p>

        {schoolLine && (
          <p className="text-sm text-ink-600 mb-1">{schoolLine}{graduationYear ? ` · Class of ${graduationYear}` : ''}</p>
        )}

        <p className="text-xs text-ink-400">
          Member since {formatDistanceToNow(parseISO(memberSince), { addSuffix: true })}
        </p>

        {bio && (
          <p className="text-sm text-ink-600 mt-3 leading-relaxed max-w-lg">{bio}</p>
        )}
      </div>
    </div>
  );
}
