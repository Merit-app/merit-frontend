'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { DiscoverOrgCard } from '@/components/orgs/discover-org-card';
import { useMeritStore } from '@/lib/store';
import { orgsApi } from '@/lib/api';
import type { DiscoverOrg } from '@/lib/types';

export default function SavedPage() {
  const followedOrgIds = useMeritStore((s) => s.followedOrgIds);
  const toggleFollowOptimistic = useMeritStore((s) => s.toggleFollowOptimistic);

  const [orgs, setOrgs] = useState<DiscoverOrg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    orgsApi.following()
      .then((res) => {
        if (!cancelled) {
          setOrgs((res.data ?? []).map((o: any) => ({ ...o, isFollowing: true })));
        }
      })
      .catch(() => {/* non-fatal */})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleToggleFollow = useCallback(async (orgId: string) => {
    // Optimistic remove from list
    toggleFollowOptimistic(orgId);
    setOrgs((prev) => prev.filter((o) => o.id !== orgId));
    try {
      await orgsApi.follow(orgId);
    } catch {
      // Revert
      toggleFollowOptimistic(orgId);
      // Re-fetch to restore
      orgsApi.following().then((res) => {
        setOrgs((res.data ?? []).map((o: any) => ({ ...o, isFollowing: true })));
      }).catch(() => {});
    }
  }, [toggleFollowOptimistic]);

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-ink-900 mb-1">Saved Organizations</h1>
        <p className="text-[14px] text-ink-500">Organizations you&apos;ve bookmarked</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-ink-200 overflow-hidden animate-pulse">
              <div className="h-20 bg-ink-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-ink-100 rounded w-3/4" />
                <div className="h-2.5 bg-ink-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-ink-100 flex items-center justify-center mb-4">
            <Bookmark size={24} className="text-ink-400" />
          </div>
          <p className="text-[16px] font-semibold text-ink-900 mb-2">No saved organizations yet</p>
          <p className="text-[13px] text-ink-500 max-w-xs mb-6">
            Browse organizations and bookmark ones you&apos;re interested in volunteering at.
          </p>
          <Link
            href="/organizations"
            className="px-5 py-2.5 rounded-lg bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium transition-colors"
          >
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
    </div>
  );
}
