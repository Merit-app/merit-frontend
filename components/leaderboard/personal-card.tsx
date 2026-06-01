'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Copy, Check, Share2, Trophy, Clock, Building2, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BadgeChip } from '@/components/badges/badge-chip'

interface PersonalCardProps {
  username: string
  name: string
  avatarUrl: string | null
  school: string | null
  stats: {
    verifiedHours: number
    sessionCount: number
    globalRank: number | null
    globalTotal: number
    monthlyRank: number | null
    schoolRank: number | null
    schoolTotal: number | null
  }
  topOrgs: { name: string; hours: number }[]
  badges: { id: string; name: string; tier: string }[]
}

export function PersonalCard({
  username,
  name,
  avatarUrl,
  school,
  stats,
  topOrgs,
  badges,
}: PersonalCardProps) {
  const [copied, setCopied] = useState(false)

  const cardUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/leaderboard/u/${username}`
      : `https://meritco.app/leaderboard/u/${username}`

  const copyLink = () => {
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true)
      toast.success('Link copied — share it with friends!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const leaderboardBadges = badges.filter(
    (b) =>
      b.name.includes('Champion') ||
      b.name.includes('Leader') ||
      b.name.includes('Pillar') ||
      b.name.includes('Achiever'),
  )

  const statBlocks = [
    {
      label: 'Global rank',
      value: stats.globalRank ? `#${stats.globalRank}` : 'Unranked',
      sub: `of ${stats.globalTotal} students`,
      icon: Trophy,
      highlight: stats.globalRank != null && stats.globalRank <= 10,
    },
    {
      label: 'Verified hours',
      value: `${stats.verifiedHours}h`,
      sub: `${stats.sessionCount} sessions`,
      icon: Clock,
      highlight: stats.verifiedHours > 50,
    },
    {
      label: 'School rank',
      value: stats.schoolRank ? `#${stats.schoolRank}` : school ? 'Unranked' : 'N/A',
      sub: stats.schoolTotal ? `of ${stats.schoolTotal}` : school ?? '',
      icon: GraduationCap,
      highlight: stats.schoolRank === 1,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Card */}
      <div className="rounded-2xl border-2 border-border bg-gradient-to-br from-background to-muted/30 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/20 relative">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="64px" />
            ) : (
              <span className="text-xl font-bold text-primary">{initials}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            {school && <p className="text-sm text-muted-foreground">{school}</p>}
            <p className="text-xs text-muted-foreground mt-0.5">meritco.app/u/{username}</p>
          </div>
        </div>

        {/* Rank highlights */}
        <div className="grid grid-cols-3 gap-2">
          {statBlocks.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-3 text-center space-y-1 ${
                item.highlight ? 'border-primary/30 bg-primary/5' : ''
              }`}
            >
              <item.icon
                className={`w-4 h-4 mx-auto ${
                  item.highlight ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <p className={`font-bold text-base leading-tight ${item.highlight ? 'text-primary' : ''}`}>
                {item.value}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Monthly rank highlight */}
        {stats.monthlyRank != null && stats.monthlyRank <= 3 && (
          <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-3 flex items-center gap-3">
            <span className="text-2xl">
              {stats.monthlyRank === 1 ? '🥇' : stats.monthlyRank === 2 ? '🥈' : '🥉'}
            </span>
            <div>
              <p className="font-semibold text-sm text-amber-800">
                #{stats.monthlyRank} this month
              </p>
              <p className="text-xs text-amber-700">
                Top {stats.monthlyRank} globally for volunteer hours
              </p>
            </div>
          </div>
        )}

        {/* Top orgs */}
        {topOrgs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Most active at
            </p>
            <div className="space-y-1.5">
              {topOrgs.map((org) => (
                <div key={org.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[170px]">{org.name}</span>
                  </div>
                  <span className="text-muted-foreground text-xs font-medium tabular-nums">
                    {org.hours}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard badges */}
        {leaderboardBadges.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {leaderboardBadges.map((badge) => (
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
        )}

        {/* Merit branding */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Verified by merit.</span>
          <span className="text-xs text-muted-foreground">meritco.app</span>
        </div>
      </div>

      {/* Share actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={copyLink}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy link
            </>
          )}
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="outline"
            onClick={() => {
              navigator.share({
                title: `${name}'s Merit Profile`,
                text: `Check out my volunteer hours on Merit — ${stats.verifiedHours} verified hours!`,
                url: cardUrl,
              })
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Anyone with this link can see your rank card. Update your privacy in{' '}
        <a href="/settings/profile" className="underline hover:text-foreground">
          settings
        </a>
        .
      </p>
    </div>
  )
}
