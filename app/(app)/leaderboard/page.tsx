'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMeritStore } from '@/lib/store'
import { leaderboardApi, type LeaderboardPeriod, type LeaderboardType } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { Podium } from '@/components/leaderboard/podium'
import { RankRow } from '@/components/leaderboard/rank-row'
import { PersonalCard } from '@/components/leaderboard/personal-card'
import { Trophy, Globe, MapPin, GraduationCap, User, Users, Plus, LogIn, X, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ActiveType = LeaderboardType | 'personal' | 'groups'

const TYPE_OPTIONS: {
  value: ActiveType
  label: string
  icon: React.ElementType
  needsUser?: boolean
  needsSchool?: boolean
  needsCity?: boolean
}[] = [
  { value: 'global', label: 'Global', icon: Globe },
  { value: 'local', label: 'Local', icon: MapPin, needsUser: true, needsCity: true },
  { value: 'school', label: 'School', icon: GraduationCap, needsSchool: true },
  { value: 'personal', label: 'My Stats', icon: User, needsUser: true },
  { value: 'groups', label: 'Groups', icon: Users, needsUser: true },
]

const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'month', label: 'This month' },
  { value: 'week', label: 'This week' },
]

const MIN_THRESHOLD = 10

// ── Group modals ──────────────────────────────────────────────────────────────

function JoinGroupModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    if (!code.trim()) return
    setJoining(true)
    setError('')
    try {
      const res = await leaderboardApi.joinGroup(code.trim())
      if (res.data.alreadyMember) {
        toast.success("You're already in that group!")
      } else {
        toast.success(`Joined "${res.data.group.name}"!`)
      }
      onJoined()
      onClose()
    } catch {
      setError('Invalid invite code. Check it and try again.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-base font-semibold mb-4">Join a group</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Enter the invite code from your teacher, coach, or friend.
      </p>
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        placeholder="e.g. AB12CD34"
        className="w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary mb-2"
      />
      {error && <p className="text-xs text-destructive mb-3">{error}</p>}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleJoin}
          disabled={!code.trim() || joining}
          className="flex-1 rounded-lg bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {joining ? 'Joining…' : 'Join group'}
        </button>
      </div>
    </ModalOverlay>
  )
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    setCreating(true)
    setError('')
    try {
      const res = await leaderboardApi.createGroup({ name: name.trim() })
      setCreatedCode(res.data.code)
      onCreated()
    } catch {
      setError('Could not create group. Try again.')
    } finally {
      setCreating(false)
    }
  }

  function copyCode() {
    if (!createdCode) return
    navigator.clipboard.writeText(createdCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (createdCode) {
    return (
      <ModalOverlay onClose={onClose}>
        <h2 className="text-base font-semibold mb-2">Group created! 🎉</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Share this invite code with people you want to compete with.
        </p>
        <div className="flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3 mb-4">
          <span className="flex-1 text-2xl font-bold tracking-[0.3em] text-primary text-center font-mono">
            {createdCode}
          </span>
          <button
            onClick={copyCode}
            className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-foreground text-background py-2 text-sm font-medium hover:opacity-90"
        >
          Done
        </button>
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-base font-semibold mb-4">Create a group</h2>
      <p className="text-sm text-muted-foreground mb-4">
        A private leaderboard for you and your friends. Share the invite code to add members.
      </p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        placeholder="e.g. NHS Chapter 42, Swim Team…"
        maxLength={100}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
      />
      {error && <p className="text-xs text-destructive mb-3">{error}</p>}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={name.trim().length < 2 || creating}
          className="flex-1 rounded-lg bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {creating ? 'Creating…' : 'Create group'}
        </button>
      </div>
    </ModalOverlay>
  )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const user = useMeritStore((s) => s.user)
  const queryClient = useQueryClient()
  const [type, setType] = useState<ActiveType>('global')
  const [period, setPeriod] = useState<LeaderboardPeriod>('all')
  const [joinOpen, setJoinOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)

  // Determine school/city scope for scoped leaderboards
  const school = type === 'school' ? (user?.school ?? undefined) : undefined
  const city   = type === 'local'  ? (user?.city  ?? undefined) : undefined

  // Main leaderboard query
  const { data: lbData, isLoading: lbLoading } = useQuery({
    queryKey: queryKeys.leaderboard(type as LeaderboardType, period, school, city),
    queryFn: async () => {
      if (type === 'personal' || type === 'groups') return null
      const res = await leaderboardApi.get({
        type: type as LeaderboardType,
        period,
        school,
        city,
        limit: 50,
      })
      return res.data
    },
    enabled: type !== 'personal' && type !== 'groups',
    staleTime: 60_000,
  })

  // Personal stats query
  const { data: personalData, isLoading: personalLoading } = useQuery({
    queryKey: queryKeys.leaderboardUser(user?.username ?? ''),
    queryFn: async () => {
      const res = await leaderboardApi.getUserStats(user!.username!)
      return res.data
    },
    enabled: type === 'personal' && !!user?.username,
    staleTime: 60_000,
  })

  // My groups query
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['leaderboard', 'groups', 'mine'],
    queryFn: async () => {
      const res = await leaderboardApi.myGroups()
      return res.data
    },
    enabled: type === 'groups',
    staleTime: 30_000,
  })

  // Active group detail query
  const { data: groupDetail, isLoading: groupDetailLoading } = useQuery({
    queryKey: ['leaderboard', 'group', activeGroupId],
    queryFn: async () => {
      const res = await leaderboardApi.getGroup(activeGroupId!)
      return res.data
    },
    enabled: type === 'groups' && !!activeGroupId,
    staleTime: 30_000,
  })

  function invalidateGroups() {
    queryClient.invalidateQueries({ queryKey: ['leaderboard', 'groups', 'mine'] })
    queryClient.invalidateQueries({ queryKey: ['leaderboard', 'group', activeGroupId] })
  }

  const entries = lbData?.entries ?? []
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const currentUserEntry = lbData?.currentUserEntry ?? null
  const currentUserInList = currentUserEntry
    ? entries.some((e) => e.isCurrentUser)
    : false

  const totalParticipants = lbData?.totalParticipants ?? 0
  const belowThreshold = !lbLoading && type !== 'personal' && type !== 'groups' && totalParticipants > 0 && totalParticipants < MIN_THRESHOLD

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top student volunteers on Merit</p>
        </div>
      </div>

      {/* Type pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {TYPE_OPTIONS.map((opt) => {
          const disabled =
            (opt.needsUser && !user) ||
            (opt.needsSchool && !user?.school) ||
            (opt.needsCity && !user?.city)

          return (
            <button
              key={opt.value}
              onClick={() => {
                if (!disabled) {
                  setType(opt.value)
                  setActiveGroupId(null)
                }
              }}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
                type === opt.value
                  ? 'bg-foreground text-background'
                  : disabled
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'bg-muted hover:bg-muted/80 text-foreground',
              )}
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Period pills — only for ranked views */}
      {type !== 'personal' && type !== 'groups' && (
        <div className="flex gap-2 flex-wrap">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-3.5 py-1 rounded-full text-xs font-medium transition-colors',
                period === p.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* School missing notice */}
      {type === 'school' && !user?.school && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Add your school in{' '}
            <a href="/settings/profile" className="underline font-medium">
              Settings → Profile
            </a>{' '}
            to see your school leaderboard.
          </p>
        </div>
      )}

      {/* City missing notice */}
      {type === 'local' && !user?.city && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Add your city in{' '}
            <a href="/settings/profile" className="underline font-medium">
              Settings → Profile
            </a>{' '}
            to see your local leaderboard.
          </p>
        </div>
      )}

      {/* Personal stats card */}
      {type === 'personal' && (
        <>
          {personalLoading ? (
            <div className="rounded-xl border p-10 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : !user?.username ? (
            <div className="rounded-xl border p-8 text-center space-y-2">
              <p className="font-medium">Set a username first</p>
              <p className="text-sm text-muted-foreground">
                Go to{' '}
                <a href="/settings/profile" className="underline">
                  Settings → Profile
                </a>{' '}
                to claim your username.
              </p>
            </div>
          ) : personalData?.user?.isPrivate ? (
            <div className="rounded-xl border p-8 text-center space-y-2">
              <p className="font-medium">Profile is private</p>
              <p className="text-sm text-muted-foreground">
                Make your profile public in{' '}
                <a href="/settings/profile" className="underline">
                  Settings
                </a>{' '}
                to get a shareable rank card.
              </p>
            </div>
          ) : personalData ? (
            <PersonalCard
              username={personalData.user.username}
              name={personalData.user.name}
              avatarUrl={personalData.user.avatarUrl ?? null}
              school={personalData.user.school ?? null}
              stats={personalData.stats}
              topOrgs={personalData.topOrgs ?? []}
              badges={personalData.badges ?? []}
            />
          ) : null}
        </>
      )}

      {/* Groups tab */}
      {type === 'groups' && (
        <div className="space-y-4">
          {/* Action row */}
          <div className="flex gap-2">
            <button
              onClick={() => setJoinOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium hover:bg-muted transition-colors"
            >
              <LogIn size={14} />
              Join with code
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              Create group
            </button>
          </div>

          {/* Group list */}
          {groupsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : !groupsData?.groups?.length ? (
            <div className="rounded-xl border p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="font-medium">No groups yet</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Create a private leaderboard to compete with friends, teammates, or classmates.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {groupsData.groups.map((g: any) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroupId(activeGroupId === g.id ? null : g.id)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors hover:bg-muted/50',
                    activeGroupId === g.id && 'border-primary/40 bg-primary/5',
                  )}
                >
                  <div>
                    <p className="font-medium text-sm">{g.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Code: <span className="font-mono">{g.code}</span> · {g.role}
                    </p>
                  </div>
                  <Users size={16} className="text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Group leaderboard */}
          {activeGroupId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Group rankings
                </p>
                <button
                  onClick={() => {
                    if (activeGroupId) {
                      const group = groupsData?.groups?.find((g: any) => g.id === activeGroupId)
                      if (group) {
                        navigator.clipboard.writeText(group.code)
                        toast.success('Invite code copied!')
                      }
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <Copy size={12} />
                  Copy invite code
                </button>
              </div>

              {groupDetailLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : !groupDetail?.entries?.length ? (
                <div className="rounded-xl border p-8 text-center">
                  <p className="text-sm text-muted-foreground">No members yet. Share the invite code!</p>
                </div>
              ) : groupDetail.entries.length < MIN_THRESHOLD ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <p className="text-sm text-amber-800 font-medium">
                    {groupDetail.entries.length} {groupDetail.entries.length === 1 ? 'member' : 'members'} so far
                    — need {MIN_THRESHOLD} to show rankings
                  </p>
                  <p className="text-xs text-amber-700">
                    Share the invite code to get more people in the group!
                  </p>
                  <div className="rounded-xl border-2 border-amber-300 bg-card px-4 py-2 flex items-center gap-2">
                    <span className="flex-1 font-mono font-bold tracking-widest text-amber-900">
                      {groupsData?.groups?.find((g: any) => g.id === activeGroupId)?.code}
                    </span>
                    <button
                      onClick={() => {
                        const group = groupsData?.groups?.find((g: any) => g.id === activeGroupId)
                        if (group) {
                          navigator.clipboard.writeText(group.code)
                          toast.success('Invite code copied!')
                        }
                      }}
                      className="text-xs text-amber-700 font-medium flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden divide-y divide-border">
                  {groupDetail.entries.map((entry: any) => (
                    <RankRow key={entry.rank} {...entry} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ranked list */}
      {type !== 'personal' && type !== 'groups' && (
        <>
          {lbLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : belowThreshold ? (
            /* FIX 5a: below threshold — show count + waiting message instead of empty state */
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-semibold text-amber-900">
                {totalParticipants} {totalParticipants === 1 ? 'student' : 'students'} so far — need {MIN_THRESHOLD} to show rankings
              </p>
              <p className="text-sm text-amber-700">
                {type === 'school'
                  ? 'Spread the word at your school!'
                  : type === 'local'
                    ? 'Be among the first in your city!'
                    : 'Keep logging hours — rankings appear once there are enough participants.'}
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border p-12 text-center space-y-2">
              <Trophy className="w-9 h-9 text-muted-foreground mx-auto" />
              <p className="font-medium">No entries yet</p>
              <p className="text-sm text-muted-foreground">
                {type === 'school'
                  ? "No one from your school has verified hours yet. Be the first!"
                  : type === 'local'
                    ? 'No local volunteers found for this period.'
                    : 'No verified hours logged for this period yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Podium for all-time global */}
              {period === 'all' && type === 'global' && top3.length >= 1 && (
                <Podium first={top3[0]} second={top3[1]} third={top3[2]} />
              )}

              {/* Rank rows */}
              <div className="rounded-xl border overflow-hidden divide-y divide-border">
                {/* Top 3 as rows when no podium */}
                {!(period === 'all' && type === 'global') &&
                  top3.map((entry) => <RankRow key={entry.rank} {...entry} />)}
                {/* Positions 4+ (or all when no podium) */}
                {rest.map((entry) => (
                  <RankRow key={entry.rank} {...entry} />
                ))}
              </div>

              {/* Pinned own rank if not visible in list */}
              {currentUserEntry && !currentUserInList && (
                <div className="rounded-xl border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/50 border-b">
                    <p className="text-xs text-muted-foreground font-medium">Your rank</p>
                  </div>
                  <RankRow {...currentUserEntry} />
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground pb-2">
                {lbData?.totalParticipants ?? 0} students ranked
              </p>
            </>
          )}
        </>
      )}

      {/* Modals */}
      {joinOpen && (
        <JoinGroupModal
          onClose={() => setJoinOpen(false)}
          onJoined={invalidateGroups}
        />
      )}
      {createOpen && (
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onCreated={invalidateGroups}
        />
      )}
    </div>
  )
}
