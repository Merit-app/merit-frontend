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
    return json?.data?.badges ?? [];
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

  const profile = await fetchProfile(username);

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

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <ProfileHero
          name={profile.name}
          username={username}
          school={profile.school ?? null}
          grade={profile.grade ?? null}
          graduationYear={profile.graduationYear ?? null}
          memberSince={profile.memberSince}
          bio={profile.bio ?? null}
        />

        <StatsRow
          verifiedHours={profile.verifiedHours ?? 0}
          totalOrgs={profile.totalOrgs ?? 0}
          lastActive={profile.lastActive ?? null}
        />

        {badges.length > 0 && <BadgesSection badges={badges} />}

        <OrgsSection orgs={orgs} />
      </div>
    </div>
  );
}
