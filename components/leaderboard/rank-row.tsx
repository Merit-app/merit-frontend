import Link from 'next/link'
import { BadgeChip } from '@/components/badges/badge-chip'

interface RankRowProps {
  rank: number
  name: string
  username: string | null
  avatarUrl: string | null
  school: string | null
  verifiedHours: number
  sessionCount: number
  isPrivate: boolean
  isCurrentUser: boolean
  badges: { id: string; name: string; tier: string; iconName: string }[]
}

export function RankRow({
  rank,
  name,
  username,
  avatarUrl,
  school,
  verifiedHours,
  sessionCount,
  isPrivate,
  isCurrentUser,
  badges,
}: RankRowProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const rowContent = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 ${
        isCurrentUser ? 'bg-primary/5 border-l-2 border-primary' : ''
      }`}
    >
      {/* Rank */}
      <div
        className={`w-7 text-center shrink-0 font-bold tabular-nums ${
          rank <= 3 ? 'text-base' : 'text-xs text-muted-foreground'
        }`}
      >
        {rank}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center text-xs font-bold">
        {avatarUrl && !isPrivate ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-primary">{isPrivate ? '?' : initials}</span>
        )}
      </div>

      {/* Name + school + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`font-medium text-sm truncate max-w-[160px] ${
              isCurrentUser ? 'text-primary' : ''
            }`}
          >
            {name}
            {isCurrentUser && (
              <span className="ml-1 text-xs font-normal text-primary">(you)</span>
            )}
          </span>
          {badges.slice(0, 2).map((badge) => (
            <BadgeChip
              key={badge.id}
              badge={{
                id: badge.id,
                name: badge.name,
                tier: badge.tier as 'bronze' | 'silver' | 'gold' | 'platinum',
              }}
              size="xs"
            />
          ))}
        </div>
        {school && !isPrivate && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{school}</p>
        )}
      </div>

      {/* Hours + sessions */}
      <div className="text-right shrink-0">
        <p className="font-bold text-sm tabular-nums">{verifiedHours}h</p>
        <p className="text-[11px] text-muted-foreground">
          {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
        </p>
      </div>
    </div>
  )

  if (username && !isPrivate) {
    return (
      <Link href={`/u/${username}`} className="block">
        {rowContent}
      </Link>
    )
  }

  return <div>{rowContent}</div>
}
