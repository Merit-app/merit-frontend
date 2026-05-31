'use client';

import { useMeritStore } from '@/lib/store';
import { useMyBadges, useRefreshBadges } from '@/lib/hooks/use-queries';
import { BadgesPageSkeleton } from '@/components/skeletons';
import { ErrorState } from '@/components/ui/error-state';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw } from 'lucide-react';
import { EarnedBadgeCard, LockedBadgeCard } from '@/components/badges/badge-card';
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

// ── Tier legend ───────────────────────────────────────────────────────────────

const TIER_LEGEND = [
  { label: 'Bronze',   ring: 'bg-gradient-to-br from-amber-500 to-amber-700' },
  { label: 'Silver',   ring: 'bg-gradient-to-br from-slate-300 to-slate-500' },
  { label: 'Gold',     ring: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
  { label: 'Platinum', ring: 'bg-gradient-to-br from-violet-500 to-cyan-400' },
];

// ── Progress derivation ───────────────────────────────────────────────────────

function deriveProgress(badge: RawBadge, verifiedHours: number, sessionCount: number) {
  const cv = badge.condition_value;
  if (!badge.condition_type || !cv) return {};
  // Backend uses { min: N }; fall back to legacy { hours, sessions } keys
  const target = cv.min ?? cv.hours ?? cv.sessions;
  if (!target) return {};

  if (badge.condition_type === 'verified_hours') {
    return { progressCurrent: verifiedHours, progressTarget: target, progressLabel: 'verified hours' };
  }
  if (badge.condition_type === 'session_count') {
    return { progressCurrent: sessionCount, progressTarget: target, progressLabel: 'sessions logged' };
  }
  return {};
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BadgesPage() {
  const sessions = useMeritStore((s) => s.sessions);
  const { data: entries = [], isLoading, isError, refetch } = useMyBadges();
  const { mutate: handleRefresh, isPending: refreshing } = useRefreshBadges();

  const verifiedHours = sessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);
  const sessionCount = sessions.length;

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8 md:px-8 max-w-4xl mx-auto">
        <BadgesPageSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full px-4 py-8 md:px-8 max-w-4xl mx-auto">
        <ErrorState message="Failed to load badges." onRetry={() => refetch()} />
      </div>
    );
  }

  const earned = entries.filter((e) => e.earned);
  const locked = entries.filter((e) => !e.earned);

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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => handleRefresh()}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 text-[13px] font-medium text-ink-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </TooltipTrigger>
          <TooltipContent>Recompute badges from your latest sessions</TooltipContent>
        </Tooltip>
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
            {earned.map(({ badge, earnedAt }) => {
              const b = badge as RawBadge;
              return (
                <EarnedBadgeCard
                  key={b.id}
                  id={b.id}
                  name={b.name}
                  description={b.description}
                  tier={b.tier}
                  iconName={b.icon_name}
                  earned
                  earnedAt={earnedAt}
                />
              );
            })}
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
              const b = badge as RawBadge;
              const progress = deriveProgress(b, verifiedHours, sessionCount);
              return (
                <LockedBadgeCard
                  key={b.id}
                  id={b.id}
                  name={b.name}
                  description={b.description}
                  tier={b.tier}
                  iconName={b.icon_name}
                  earned={false}
                  {...progress}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── Empty ──────────────────────────────────────────────────────── */}
      {entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[15px] font-semibold text-ink-900 mb-2">No badges yet</p>
          <p className="text-sm text-ink-400">
            Log and verify volunteer hours to start earning badges.
          </p>
        </div>
      )}
    </div>
  );
}
