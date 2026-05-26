import { notFound } from 'next/navigation';
import { OrgHero } from './_components/org-hero';
import { OrgStats } from './_components/org-stats';
import { TopVolunteers } from './_components/top-volunteers';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

async function fetchOrg(slug: string) {
  const res = await fetch(`${API_URL}/orgs/${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch org: ${res.status}`);
  const json = await res.json();
  return json?.data?.org ?? null;
}

export default async function PublicOrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await fetchOrg(slug);

  if (!org) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <OrgHero
          name={org.name}
          description={org.description ?? null}
          category={org.category ?? null}
          city={org.city ?? null}
          state={org.state ?? null}
          website={org.website ?? null}
          ein={org.ein ?? null}
          isRegisteredNonprofit={org.isRegisteredNonprofit ?? false}
          isInstitutionalPartner={org.isInstitutionalPartner ?? false}
          claimed={org.claimed ?? false}
          isRecruiting={org.isRecruiting ?? false}
        />

        <OrgStats
          totalVerifiedHours={org.totalVerifiedHours ?? 0}
          totalVerifiedSessions={org.totalVerifiedSessions ?? 0}
          totalVolunteers={org.totalVolunteers ?? 0}
        />

        <TopVolunteers volunteers={org.topVolunteers ?? []} />
      </div>
    </div>
  );
}
