'use client';

import { useEffect, useState } from 'react';
import { badgesApi, ApiError } from '@/lib/api';
import { useMeritStore } from '@/lib/store';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { EarnedBadgeCard, LockedBadgeCard } from '@/components/badges/badge-card';
import type { BadgeCardProps } from '@/components/badges/badge-card';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawBadge {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon_name?: string;
  condition_type?: string;
  condition_value?: Record<string, number>;
}

interface BadgeEntry {
  badge: RawBadge;
  earned: boolean;
  earnedAt?: string;
}

const TIER_ORDER: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

// ── Tier legend ───────────────────────────────────────────────────────────────

const TIER_LEGEND = [
  { label: 'Bronze',   ring: 'bg-gradient-to-br from-amber-500 to-amber-700' },
  { label: 'Silver',   ring: 'bg-gradient-to-br from-slate-300 to-slate-500' },
  { label: 'Gold',     ring: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
  { label: 'Platinum', ring: 'bg-gradient-to-br from-violet-500 to-cyan-400' },
];

// ── Progress derivation ───────────────────────────────────────────────────────

function deriveProgress(badge: RawBadge, verifiedHours: number, sessionCount: number) {
  if (!badge.condition_type || !badge.condition_value) return {};
  const cv = badge.condition_value;
  if (badge.condition_type === 'verified_hours' && cv.hours) {
    return { progressCurrent: verifiedHours, progressTarget: cv.hours, progressLabel: 'verified hours' };
  }
  if (badge.condition_type === 'session_count' && cv.sessions) {
    return { progressCurrent: sessionCount, progressTarget: cv.sessions, progressLabel: 'sessions logged' };
  }
  return {};
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BadgesPage() {
  const sessions = useMeritStore((s) => s.sessions);
  const [entries, setEntries] = useState<BadgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const verifiedHours = sessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);
  const sessionCount = sessions.length;

  async function load() {
    setLoading(true);
    try {
      const res = await badgesApi.me();
      const sorted = [...(res.data.badges ?? [])].sort((a: BadgeEntry, b: BadgeEntry) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return (TIER_ORDER[a.badge.tier] ?? 9) - (TIER_ORDER[b.badge.tier] ?? 9);
      });
      setEntries(sorted);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message || 'Failed to load badges.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await badgesApi.refresh();
      await load();
      toast.success('Badges refreshed.');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message || 'Failed to refresh badges.');
      else toast.error('Could not reach the server.');
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const earned = entries.filter((e) => e.earned);
  const locked = entries.filter((e) => !e.earned);

  if (loading) {
    return (
      <div className="w-full px-4 py-8 md:px-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-ink-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Your Badges</h1>
          <p className="text-sm text-ink-500 mt-1">
            {earned.length} earned · {locked.length} locked
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 text-[13px] font-medium text-ink-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Tier legend ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        {TIER_LEGEND.map(({ label, ring }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn('w-4 h-4 rounded-full shadow-sm', ring)} />
            <span className="text-[12px] text-ink-500">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Earned ─────────────────────────────────────────────────────── */}
      {earned.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[13px] font-semibold text-ink-500 uppercase tracking-wide mb-4">
            Earned ({earned.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {earned.map(({ badge, earnedAt }) => (
              <EarnedBadgeCard
                key={badge.id}
                id={badge.id}
                name={badge.name}
                description={badge.description}
                tier={badge.tier}
                iconName={badge.icon_name}
                earned
                earnedAt={earnedAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Locked ─────────────────────────────────────────────────────── */}
      {locked.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold text-ink-500 uppercase tracking-wide mb-4">
            Locked ({locked.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {locked.map(({ badge }) => {
              const progress = deriveProgress(badge, verifiedHours, sessionCount);
              return (
                <LockedBadgeCard
                  key={badge.id}
                  id={badge.id}
                  name={badge.name}
                  description={badge.description}
                  tier={badge.tier}
                  iconName={badge.icon_name}
                  earned={false}
                  {...progress}
                />
              );
            })}
          </div>
        </section>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink-400 text-sm">No badges found. Log and verify volunteer hours to start earning.</p>
        </div>
      )}
    </div>
  );
}
