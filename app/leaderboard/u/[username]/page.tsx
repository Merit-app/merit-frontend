import { notFound } from 'next/navigation'
import { PersonalCard } from '@/components/leaderboard/personal-card'
import type { Metadata } from 'next'

async function fetchUserStats(username: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/leaderboard/u/${encodeURIComponent(username)}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const data = await fetchUserStats(username)
  if (!data || data.user?.isPrivate) {
    return { title: 'Rank Card — Merit' }
  }
  const hours = data.stats?.verifiedHours ?? 0
  const rank = data.stats?.globalRank
  return {
    title: `${data.user.name}'s Volunteer Stats — Merit`,
    description: `${data.user.name} has logged ${hours} verified volunteer hours on Merit. Global rank: ${rank ? '#' + rank : 'unranked'}.`,
    openGraph: {
      title: `${data.user.name} — Merit Volunteer Stats`,
      description: `${hours} verified hours · Global rank ${rank ? '#' + rank : 'unranked'}`,
    },
  }
}

export default async function PublicRankCardPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await fetchUserStats(username)

  if (!data) notFound()

  if (data.user?.isPrivate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4 text-center">
        <p className="font-semibold text-lg">Profile is private</p>
        <p className="text-muted-foreground text-sm max-w-xs">
          This student has set their profile to private and can't be viewed publicly.
        </p>
        <a href="/leaderboard" className="text-sm underline text-muted-foreground hover:text-foreground">
          View leaderboard →
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Minimal header */}
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-bold text-lg tracking-tight">
          merit<span className="text-primary">.</span>
        </a>
        <a
          href="/leaderboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View leaderboard →
        </a>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <p className="text-center text-sm text-muted-foreground mb-6">
          {data.user.name}&apos;s volunteer hour stats on Merit
        </p>
        <PersonalCard
          username={data.user.username}
          name={data.user.name}
          avatarUrl={data.user.avatarUrl ?? null}
          school={data.user.school ?? null}
          stats={data.stats}
          topOrgs={data.topOrgs ?? []}
          badges={data.badges ?? []}
        />
      </main>
    </div>
  )
}
