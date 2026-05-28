'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Bookmark } from 'lucide-react';
import { OrgCoverHeader } from '@/components/org-profile/cover-header';
import { OrgAboutCard } from '@/components/org-profile/about-card';
import { OrgCommunityCard } from '@/components/org-profile/community-card';
import { OrgVolunteersCard } from '@/components/org-profile/volunteers-card';
import { OrgSimilarCard } from '@/components/org-profile/similar-orgs-card';
import { useMeritStore } from '@/lib/store';
import { orgsApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { OrgStats, SimilarOrg } from '@/lib/types';

type OrgData = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  website: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  ein: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isRegisteredNonprofit: boolean;
  isInstitutionalPartner: boolean;
  claimed: boolean;
  isRecruiting: boolean;
  totalVerifiedHours: number;
  totalVerifiedSessions: number;
  totalVolunteers: number;
  topVolunteers: Array<{ userId: string; name: string; username: string | null; verifiedHours: number; sessionCount: number }>;
};

export default function AppOrgProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const followedOrgIds = useMeritStore((s) => s.followedOrgIds);
  const toggleFollowOptimistic = useMeritStore((s) => s.toggleFollowOptimistic);

  const [org, setOrg] = useState<OrgData | null>(null);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [similar, setSimilar] = useState<SimilarOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await orgsApi.getPublic(slug);
        const data = res.data.org;
        if (cancelled) return;
        setOrg(data);

        // Fetch stats + similar in parallel (public endpoints)
        const [statsRes, similarRes] = await Promise.allSettled([
          orgsApi.stats(data.id),
          orgsApi.similar(data.id),
        ]);
        if (cancelled) return;
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (similarRes.status === 'fulfilled') setSimilar(similarRes.value.data ?? []);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFoundFlag(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (notFoundFlag) notFound();

  const isFollowing = org ? followedOrgIds.includes(org.id) : false;

  const handleToggleFollow = useCallback(async () => {
    if (!org) return;
    toggleFollowOptimistic(org.id);
    try {
      await orgsApi.follow(org.id);
    } catch {
      toggleFollowOptimistic(org.id); // revert
    }
  }, [org, toggleFollowOptimistic]);

  // Skeleton
  if (loading) {
    return (
      <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
          <div className="h-40 bg-ink-100" />
          <div className="p-5 space-y-3">
            <div className="h-6 bg-ink-100 rounded w-48" />
            <div className="h-4 bg-ink-100 rounded w-32" />
          </div>
        </div>
        <div className="h-32 bg-white rounded-xl border border-ink-200" />
        <div className="h-40 bg-white rounded-xl border border-ink-200" />
      </div>
    );
  }

  if (!org) return null;

  const orgSlugForLog = org.slug ?? org.id;

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <p className="text-[12px] text-ink-400">
        <Link href="/organizations" className="hover:text-ink-700 transition-colors">Organizations</Link>
        {' · '}
        <span className="text-ink-600">{org.name}</span>
      </p>

      {/* Cover + Header */}
      <OrgCoverHeader
        id={org.id}
        name={org.name}
        category={org.category}
        city={org.city}
        state={org.state}
        website={org.website}
        logoUrl={org.logoUrl}
        coverUrl={org.coverUrl}
        isRegisteredNonprofit={org.isRegisteredNonprofit}
        isInstitutionalPartner={org.isInstitutionalPartner}
        claimed={org.claimed}
        isRecruiting={org.isRecruiting}
        showClaimLink={true}
        actions={
          <>
            {/* Bookmark */}
            <button
              onClick={handleToggleFollow}
              aria-label={isFollowing ? 'Unfollow' : 'Bookmark'}
              className="h-8 px-3 rounded-lg bg-white/80 backdrop-blur-sm border border-white/60 flex items-center gap-1.5 text-[12px] font-medium hover:bg-white transition-colors shadow-sm"
            >
              <Bookmark
                size={13}
                className={cn(isFollowing ? 'fill-merit-blue-600 text-merit-blue-600' : 'text-ink-600')}
              />
              <span className={isFollowing ? 'text-merit-blue-600' : 'text-ink-700'}>
                {isFollowing ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Volunteer CTA */}
            <Link
              href={`/log?org=${orgSlugForLog}`}
              className="h-8 px-3 rounded-lg bg-merit-blue-600 hover:bg-merit-blue-700 flex items-center gap-1.5 text-[12px] font-medium text-white transition-colors shadow-sm"
            >
              <Plus size={13} />
              I volunteer here
            </Link>
          </>
        }
      />

      {/* About */}
      <OrgAboutCard
        description={org.description}
        contactEmail={org.contactEmail}
        contactPhone={org.contactPhone}
        ein={org.ein}
        claimed={org.claimed}
      />

      {/* Community Stats */}
      <OrgCommunityCard
        orgId={org.id}
        stats={stats}
        loading={!stats && loading}
      />

      {/* Recent Volunteers */}
      <OrgVolunteersCard
        volunteers={org.topVolunteers}
        totalVolunteers={org.totalVolunteers}
      />

      {/* Similar Orgs */}
      <OrgSimilarCard
        orgs={similar}
        loading={false}
        basePath="/organizations"
      />
    </div>
  );
}
