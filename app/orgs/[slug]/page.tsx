import { notFound } from 'next/navigation';
import Link from 'next/link';
import { OrgCoverHeader } from '@/components/org-profile/cover-header';
import { OrgAboutCard } from '@/components/org-profile/about-card';
import { OrgCommunityCard } from '@/components/org-profile/community-card';
import { OrgVolunteersCard } from '@/components/org-profile/volunteers-card';
import { OrgSimilarCard } from '@/components/org-profile/similar-orgs-card';
import { ClaimButton } from '@/components/orgs/claim-button';
import { VolunteerInterestButton } from '@/components/orgs/volunteer-interest-button';
import type { OrgStats, SimilarOrg } from '@/lib/types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

async function fetchOrg(slug: string) {
  const res = await fetch(`${API_URL}/orgs/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch org: ${res.status}`);
  const json = await res.json();
  return json?.data?.org ?? null;
}

async function fetchStats(orgId: string): Promise<OrgStats | null> {
  try {
    const res = await fetch(`${API_URL}/organizations/${orgId}/stats`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch { return null; }
}

async function fetchSimilar(orgId: string): Promise<SimilarOrg[]> {
  try {
    const res = await fetch(`${API_URL}/organizations/${orgId}/similar`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch { return []; }
}

export default async function PublicOrgPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await fetchOrg(slug);
  if (!org) notFound();

  const [stats, similar] = await Promise.all([
    fetchStats(org.id),
    fetchSimilar(org.id),
  ]);

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Public nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white border-b border-ink-200">
        <Link href="/" className="text-[17px] font-bold text-ink-900 tracking-tight">
          merit<span className="text-merit-blue-600">.</span>
        </Link>
        <Link
          href="/signup"
          className="text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          Get started free
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <OrgCoverHeader
          id={org.id}
          name={org.name}
          category={org.category ?? null}
          city={org.city ?? null}
          state={org.state ?? null}
          website={org.website ?? null}
          logoUrl={org.logoUrl ?? null}
          coverUrl={org.coverUrl ?? null}
          isRegisteredNonprofit={org.isRegisteredNonprofit ?? false}
          isInstitutionalPartner={org.isInstitutionalPartner ?? false}
          claimed={org.claimed ?? false}
          isRecruiting={org.isRecruiting ?? false}
          showClaimLink={false}
          actions={
            <div className="flex items-center gap-2">
              {!org.claimed && (
                <ClaimButton
                  orgId={org.id}
                  orgName={org.name}
                  orgWebsiteUrl={org.website_url ?? org.website ?? null}
                />
              )}
              {/* Registered users: toggle interest; guests: go to signup */}
              <VolunteerInterestButton
                orgId={org.id}
                orgName={org.name}
                orgSlug={org.slug ?? ''}
              />
            </div>
          }
        />

        <OrgAboutCard
          description={org.description ?? null}
          contactEmail={org.contactEmail ?? null}
          contactPhone={org.contactPhone ?? null}
          ein={org.ein ?? null}
          claimed={org.claimed ?? false}
        />

        <OrgCommunityCard
          orgId={org.id}
          stats={stats}
          loading={false}
        />

        <OrgVolunteersCard
          volunteers={org.topVolunteers ?? []}
          totalVolunteers={org.totalVolunteers ?? 0}
        />

        <OrgSimilarCard
          orgs={similar}
          loading={false}
          basePath="/orgs"
        />
      </div>
    </div>
  );
}
