'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bookmark, Building2, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DiscoverOrgCard } from '@/components/orgs/discover-org-card';
import { ScholarshipCard } from '@/components/scholarships/scholarship-card';
import { useMeritStore } from '@/lib/store';
import { orgsApi, scholarshipsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DiscoverOrg } from '@/lib/types';

type Tab = 'all' | 'organizations' | 'scholarships';

export default function SavedPage() {
  const followedOrgIds = useMeritStore((s) => s.followedOrgIds);
  const toggleFollowOptimistic = useMeritStore((s) => s.toggleFollowOptimistic);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // ── Saved orgs ──────────────────────────────────────────────────────────────
  const [orgs, setOrgs] = useState<DiscoverOrg[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    orgsApi.following()
      .then((res) => {
        if (!cancelled) setOrgs((res.data ?? []).map((o: any) => ({ ...o, isFollowing: true })));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setOrgsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleToggleFollow = useCallback(async (orgId: string) => {
    toggleFollowOptimistic(orgId);
    setOrgs((prev) => prev.filter((o) => o.id !== orgId));
    try {
      await orgsApi.follow(orgId);
    } catch {
      toggleFollowOptimistic(orgId);
      orgsApi.following().then((res) => {
        setOrgs((res.data ?? []).map((o: any) => ({ ...o, isFollowing: true })));
      }).catch(() => {});
    }
  }, [toggleFollowOptimistic]);

  // ── Saved scholarships ───────────────────────────────────────────────────────
  const { data: scholRes, isLoading: scholLoading } = useQuery({
    queryKey: ['scholarships-saved'],
    queryFn: () => scholarshipsApi.saved(),
  });
  const scholarships: any[] = (scholRes as any)?.data?.scholarships ?? [];

  // ── Derived counts ───────────────────────────────────────────────────────────
  const loading = orgsLoading || scholLoading;
  const totalSaved = orgs.length + scholarships.length;

  const TABS: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'all',           label: 'All',          icon: Bookmark,      count: totalSaved },
    { key: 'organizations', label: 'Organizations', icon: Building2,     count: orgs.length },
    { key: 'scholarships',  label: 'Scholarships',  icon: GraduationCap, count: scholarships.length },
  ];

  const showOrgs = activeTab === 'all' || activeTab === 'organizations';
  const showSchols = activeTab === 'all' || activeTab === 'scholarships';

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h1 text-foreground flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-merit-blue-600" />
          Saved
        </h1>
        <p className="text-small text-muted-foreground mt-1">
          Organizations and scholarships you've bookmarked.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit mb-8">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors',
              activeTab === key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {!loading && count > 0 && (
              <span className={cn(
                'text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
                activeTab === key
                  ? 'bg-merit-blue-100 text-merit-blue-700 dark:bg-merit-blue-500/20 dark:text-merit-blue-300'
                  : 'bg-muted-foreground/15 text-muted-foreground',
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Empty (all tabs, nothing saved) ─────────────────────────────────── */}
      {!loading && totalSaved === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bookmark size={28} className="text-muted-foreground" />
          </div>
          <p className="text-[16px] font-semibold text-foreground mb-2">Nothing saved yet</p>
          <p className="text-[13px] text-muted-foreground max-w-xs mb-6">
            Bookmark organizations you want to volunteer at, and scholarships you want to apply for.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/organizations" className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium transition-colors">
              <Building2 className="w-4 h-4" />
              Find organizations
            </Link>
            <Link href="/scholarships" className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-foreground text-[13px] font-medium hover:bg-muted transition-colors">
              <GraduationCap className="w-4 h-4" />
              Browse scholarships
            </Link>
          </div>
        </div>
      )}

      {/* ── Organizations section ────────────────────────────────────────────── */}
      {showOrgs && (orgsLoading || orgs.length > 0) && (
        <section className={cn(showSchols && scholarships.length > 0 && 'mb-12')}>
          {activeTab === 'all' && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold text-foreground">Organizations</h2>
                {!orgsLoading && (
                  <span className="text-[11px] font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {orgs.length}
                  </span>
                )}
              </div>
              <Link href="/organizations" className="text-[12px] text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors">
                Discover more →
              </Link>
            </div>
          )}

          {orgsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : orgs.length === 0 && activeTab === 'organizations' ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-foreground mb-1">No saved organizations</p>
              <p className="text-small text-muted-foreground mb-4">Bookmark organizations you want to volunteer at.</p>
              <Link href="/organizations" className="inline-flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors">
                Discover organizations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgs.map((org) => (
                <DiscoverOrgCard
                  key={org.id}
                  org={org}
                  isFollowing={followedOrgIds.includes(org.id)}
                  onToggleFollow={handleToggleFollow}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Scholarships section ─────────────────────────────────────────────── */}
      {showSchols && (scholLoading || scholarships.length > 0) && (
        <section>
          {activeTab === 'all' && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold text-foreground">Scholarships</h2>
                {!scholLoading && (
                  <span className="text-[11px] font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {scholarships.length}
                  </span>
                )}
              </div>
              <Link href="/scholarships" className="text-[12px] text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors">
                Discover more →
              </Link>
            </div>
          )}

          {scholLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : scholarships.length === 0 && activeTab === 'scholarships' ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-foreground mb-1">No saved scholarships</p>
              <p className="text-small text-muted-foreground mb-4">Bookmark scholarships you want to apply for.</p>
              <Link href="/scholarships" className="inline-flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors">
                Browse scholarships
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scholarships.map((s: any) => (
                <ScholarshipCard
                  key={s.id}
                  scholarship={s}
                  isSaved={true}
                  invalidateKey={['scholarships-saved']}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
