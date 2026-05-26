'use client';

import { useState, useEffect } from 'react';
import { badgesApi, profilesApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BadgeItem {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt?: string;
}

const TIER_RING: Record<BadgeItem['tier'], string> = {
  bronze: 'ring-amber-300',
  silver: 'ring-slate-300',
  gold: 'ring-yellow-400',
  platinum: 'ring-sky-300',
};

const TIER_BG: Record<BadgeItem['tier'], string> = {
  bronze: 'bg-amber-50',
  silver: 'bg-slate-50',
  gold: 'bg-yellow-50',
  platinum: 'bg-sky-50',
};

const TIER_DOT: Record<BadgeItem['tier'], string> = {
  bronze: 'bg-amber-400',
  silver: 'bg-slate-400',
  gold: 'bg-yellow-400',
  platinum: 'bg-sky-400',
};

interface Props {
  initialTopBadgeIds: string[];
}

export function TopBadgesPicker({ initialTopBadgeIds }: Props) {
  const [earned, setEarned] = useState<BadgeItem[]>([]);
  const [selected, setSelected] = useState<string[]>(initialTopBadgeIds);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    badgesApi.me().then((res) => {
      const items: BadgeItem[] = (res.data.badges ?? [])
        .filter((b: any) => b.earned)
        .map((b: any) => ({
          id: b.badge.id,
          name: b.badge.name,
          tier: b.badge.tier,
          earnedAt: b.earnedAt,
        }));
      setEarned(items);
    }).catch(() => {
      // silent — user just won't see badges
    }).finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast.info('You can pin up to 3 badges.');
        return prev;
      }
      return [...prev, id];
    });
  }

  async function save() {
    setSaving(true);
    try {
      await profilesApi.update({ topBadgeIds: selected });
      toast.success('Pinned badges saved.');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to save pinned badges.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-[12px] text-ink-400">Loading badges…</p>;
  }

  if (earned.length === 0) {
    return (
      <p className="text-[12px] text-ink-400">
        You haven&apos;t earned any badges yet. Log and verify volunteer hours to earn them.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-ink-500">
        Select up to 3 badges to pin to your public profile.{' '}
        <span className="text-ink-400">({selected.length}/3 selected)</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {earned.map((b) => {
          const isSelected = selected.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => toggle(b.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border ring-1 transition-all text-left',
                TIER_RING[b.tier],
                TIER_BG[b.tier],
                isSelected ? 'opacity-100 shadow-sm' : 'opacity-60 hover:opacity-90',
              )}
            >
              <span className={cn('w-2 h-2 rounded-full shrink-0', TIER_DOT[b.tier])} />
              <span className="text-[13px] font-semibold text-ink-900 leading-tight">{b.name}</span>
              {isSelected && (
                <span className="ml-1 text-[10px] font-bold text-merit-blue-600 uppercase">Pinned</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className={cn(
          'mt-1 px-4 py-2 rounded-lg bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium transition-all',
          saving && 'opacity-60 cursor-not-allowed',
        )}
      >
        {saving ? 'Saving…' : 'Save pinned badges'}
      </button>
    </div>
  );
}
