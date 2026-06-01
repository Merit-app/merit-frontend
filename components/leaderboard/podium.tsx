import Image from 'next/image'
import Link from 'next/link'
import { Crown, Medal, Award } from 'lucide-react'

export interface PodiumEntry {
  rank: number
  name: string
  username: string | null
  avatarUrl: string | null
  verifiedHours: number
  isPrivate: boolean
  isCurrentUser: boolean
}

const podiumConfig = [
  {
    rank: 1,
    icon: Crown,
    iconColor: 'text-yellow-500',
    ringColor: 'ring-yellow-400',
    bg: 'bg-gradient-to-b from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    height: 'h-28',
    badge: '🥇',
    label: '1st Place',
    textSize: 'text-xl',
  },
  {
    rank: 2,
    icon: Medal,
    iconColor: 'text-slate-400',
    ringColor: 'ring-slate-300',
    bg: 'bg-gradient-to-b from-slate-50 to-gray-50',
    border: 'border-slate-200',
    height: 'h-20',
    badge: '🥈',
    label: '2nd Place',
    textSize: 'text-lg',
  },
  {
    rank: 3,
    icon: Award,
    iconColor: 'text-amber-600',
    ringColor: 'ring-amber-400',
    bg: 'bg-gradient-to-b from-amber-50 to-orange-50',
    border: 'border-amber-200',
    height: 'h-16',
    badge: '🥉',
    label: '3rd Place',
    textSize: 'text-base',
  },
]

function PodiumAvatar({
  entry,
  config,
}: {
  entry: PodiumEntry
  config: (typeof podiumConfig)[0]
}) {
  const initials = entry.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const content = (
    <div className="flex flex-col items-center gap-1.5">
      <config.icon className={`w-5 h-5 ${config.iconColor}`} />

      <div
        className={`w-14 h-14 rounded-full ring-4 ${config.ringColor} overflow-hidden bg-primary/10 flex items-center justify-center relative ${
          entry.isCurrentUser ? 'ring-primary' : ''
        }`}
      >
        {entry.avatarUrl && !entry.isPrivate ? (
          <Image src={entry.avatarUrl} alt={entry.name} fill className="object-cover" sizes="56px" />
        ) : (
          <span className="text-base font-bold text-primary">
            {entry.isPrivate ? '?' : initials}
          </span>
        )}
      </div>

      <div className="text-center px-1">
        <p className={`font-bold ${config.textSize} leading-tight line-clamp-1`}>{entry.name}</p>
        <p className="text-xs text-muted-foreground font-semibold">{entry.verifiedHours}h</p>
      </div>

      <span className="text-xl">{config.badge}</span>
    </div>
  )

  if (entry.username && !entry.isPrivate) {
    return (
      <Link href={`/u/${entry.username}`} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return <div>{content}</div>
}

export function Podium({
  first,
  second,
  third,
}: {
  first?: PodiumEntry
  second?: PodiumEntry
  third?: PodiumEntry
}) {
  if (!first && !second && !third) return null

  return (
    <div className="flex items-end justify-center gap-2 py-4">
      {/* 2nd place */}
      <div className="flex flex-col items-center w-28">
        {second && <PodiumAvatar entry={second} config={podiumConfig[1]} />}
        <div
          className={`w-full ${podiumConfig[1].height} rounded-t-lg ${podiumConfig[1].bg} border ${podiumConfig[1].border} flex items-center justify-center mt-2`}
        >
          <span className="text-xs font-bold text-muted-foreground">{podiumConfig[1].label}</span>
        </div>
      </div>

      {/* 1st place — tallest */}
      <div className="flex flex-col items-center w-28">
        {first && <PodiumAvatar entry={first} config={podiumConfig[0]} />}
        <div
          className={`w-full ${podiumConfig[0].height} rounded-t-lg ${podiumConfig[0].bg} border ${podiumConfig[0].border} flex items-center justify-center mt-2`}
        >
          <span className="text-xs font-bold text-amber-600">{podiumConfig[0].label}</span>
        </div>
      </div>

      {/* 3rd place */}
      <div className="flex flex-col items-center w-28">
        {third && <PodiumAvatar entry={third} config={podiumConfig[2]} />}
        <div
          className={`w-full ${podiumConfig[2].height} rounded-t-lg ${podiumConfig[2].bg} border ${podiumConfig[2].border} flex items-center justify-center mt-2`}
        >
          <span className="text-xs font-bold text-amber-700">{podiumConfig[2].label}</span>
        </div>
      </div>
    </div>
  )
}
