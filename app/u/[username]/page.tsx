import { notFound } from 'next/navigation';
import { ProfileHero } from './_components/profile-hero';
import { StatsRow } from './_components/stats-row';
import { BadgesSection } from './_components/badges-section';
import { OrgsSection } from './_components/orgs-section';
import { PrivateProfile } from './_components/private-profile';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

async function fetchProfile(username: string) {
  const res = await fetch(`${API_URL}/profiles/${encodeURIComponent(username)}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
  const json = await res.json();
  return json?.data?.profile ?? null;
}

async function fetchProfileBadges(username: string) {
  try {
    const res = await fetch(`${API_URL}/profiles/${encodeURIComponent(username)}/badges`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Backend returns { badge: { id, name, tier, icon_name, ... }, earnedAt }
    // Flatten to the flat shape BadgesSection expects
    const raw: any[] = json?.data?.badges ?? [];
    return raw.map((item: any) => ({
      id: item.badge?.id ?? item.id ?? '',
      name: item.badge?.name ?? item.name ?? '',
      description: item.badge?.description ?? item.description ?? '',
      tier: item.badge?.tier ?? item.tier ?? 'bronze',
      iconName: item.badge?.icon_name ?? item.iconName ?? '',
      earnedAt: item.earnedAt ?? item.earned_at ?? '',
    }));
  } catch {
    return [];
  }
}

async function fetchProfileOrgs(username: string) {
  try {
    const res = await fetch(`${API_URL}/profiles/${encodeURIComponent(username)}/orgs`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.orgs ?? [];
  } catch {
    return [];
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Wrap fetch so any non-404 backend error (500, network, etc.) shows
  // the not-found UI instead of crashing with "Something went wrong"
  let profile: Awaited<ReturnType<typeof fetchProfile>>;
  try {
    profile = await fetchProfile(username);
  } catch (err) {
    console.error(`[profile] fetchProfile failed for "${username}":`, err);
    notFound();
  }

  if (!profile) {
    notFound();
  }

  if (profile.isPrivate) {
    return <PrivateProfile username={username} />;
  }

  const [badges, orgs] = await Promise.all([
    fetchProfileBadges(username),
    fetchProfileOrgs(username),
  ]);

  // Stats are nested under profile.stats on the backend response
  const stats = (profile as any).stats ?? {};

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <ProfileHero
          name={profile.name ?? username}
          username={username}
          school={profile.school ?? null}
          grade={profile.grade ?? null}
          graduationYear={profile.graduationYear ?? null}
          memberSince={profile.memberSince ?? new Date().toISOString()}
          bio={profile.bio ?? null}
        />

        <StatsRow
          verifiedHours={stats.verifiedHours ?? 0}
          totalOrgs={stats.orgCount ?? 0}
          lastActive={stats.lastActive ?? null}
        />

        {badges.length > 0 && <BadgesSection badges={badges} />}

        <OrgsSection orgs={orgs} />
      </div>
    </div>
  );
}
