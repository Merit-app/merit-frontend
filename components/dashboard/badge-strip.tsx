'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { badgesApi } from '@/lib/api';

interface EarnedBadge {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: string;
}

const TIER_DOT: Record<EarnedBadge['tier'], string> = {
  bronze: 'bg-amber-400',
  silver: 'bg-slate-400',
  gold: 'bg-yellow-400',
  platinum: 'bg-sky-400',
};

const TIER_RING: Record<EarnedBadge['tier'], string> = {
  bronze: 'ring-amber-200',
  silver: 'ring-slate-200',
  gold: 'ring-yellow-300',
  platinum: 'ring-sky-200',
};

const TIER_BG: Record<EarnedBadge['tier'], string> = {
  bronze: 'bg-amber-50',
  silver: 'bg-slate-50',
  gold: 'bg-yellow-50',
  platinum: 'bg-sky-50',
};

export function BadgeStrip() {
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    badgesApi.me().then((res) => {
      const earned: EarnedBadge[] = (res.data.badges ?? [])
        .filter((b: any) => b.earned)
        .map((b: any) => ({
          id: b.badge.id,
          name: b.badge.name,
          tier: b.badge.tier as EarnedBadge['tier'],
          earnedAt: b.earnedAt ?? '',
        }))
        .sort((a: EarnedBadge, b: EarnedBadge) => {
          const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
          return tierOrder[a.tier] - tierOrder[b.tier];
        });
      setBadges(earned);
    }).catch(() => {
      // silent
    }).finally(() => setLoading(false));
  }, []);

  if (loading || badges.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-semibold text-ink-700">
          Badges
          <span className="ml-1.5 text-[11px] font-medium text-ink-400">{badges.length} earned</span>
        </p>
        <Link
          href="/badges"
          className="text-[12px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.slice(0, 8).map((b) => (
          <div
            key={b.id}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ring-1 ${TIER_RING[b.tier]} ${TIER_BG[b.tier]}`}
            title={`${b.name} · ${b.tier}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TIER_DOT[b.tier]}`} />
            <span className="text-[12px] font-semibold text-ink-800 leading-none">{b.name}</span>
          </div>
        ))}
        {badges.length > 8 && (
          <Link
            href="/badges"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-ink-200 bg-ink-50 text-[12px] font-medium text-ink-500 hover:text-ink-700 transition-colors"
          >
            +{badges.length - 8} more
          </Link>
        )}
      </div>
    </div>
  );
}
