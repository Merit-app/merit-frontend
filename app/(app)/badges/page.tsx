'use client';

import { useEffect, useState } from 'react';
import { badgesApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

interface BadgeEntry {
  badge: {
    id: string;
    name: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  earned: boolean;
  earnedAt?: string;
}

const TIER_ORDER: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const TIER_STYLES: Record<string, { ring: string; bg: string; dot: string; label: string; text: string }> = {
  bronze: { ring: 'ring-amber-300', bg: 'bg-amber-50', dot: 'bg-amber-400', label: 'text-amber-700', text: 'Bronze' },
  silver: { ring: 'ring-slate-300', bg: 'bg-slate-50', dot: 'bg-slate-400', label: 'text-slate-600', text: 'Silver' },
  gold: { ring: 'ring-yellow-400', bg: 'bg-yellow-50', dot: 'bg-yellow-400', label: 'text-yellow-700', text: 'Gold' },
  platinum: { ring: 'ring-sky-300', bg: 'bg-sky-50', dot: 'bg-sky-400', label: 'text-sky-700', text: 'Platinum' },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function BadgesPage() {
  const [entries, setEntries] = useState<BadgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await badgesApi.me();
      const sorted = [...(res.data.badges ?? [])].sort((a, b) => {
        // Earned first, then by tier
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return (TIER_ORDER[a.badge.tier] ?? 9) - (TIER_ORDER[b.badge.tier] ?? 9);
      });
      setEntries(sorted);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to load badges.');
      }
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
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to refresh badges.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const earned = entries.filter((e) => e.earned);
  const locked = entries.filter((e) => !e.earned);

  if (loading) {
    return (
      <div className="w-full px-4 py-8 md:px-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-ink-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 md:px-8 md:py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Badges</h1>
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

      {/* Earned badges */}
      {earned.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[13px] font-semibold text-ink-500 uppercase tracking-wide mb-3">
            Earned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {earned.map(({ badge, earnedAt }) => {
              const s = TIER_STYLES[badge.tier];
              return (
                <div
                  key={badge.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border ring-1 ${s.ring} ${s.bg}`}
                >
                  <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-ink-900 truncate">{badge.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${s.label}`}>
                        {s.text}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-600 mt-0.5 leading-snug">{badge.description}</p>
                    {earnedAt && (
                      <p className="text-[11px] text-ink-400 mt-1">Earned {formatDate(earnedAt)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold text-ink-500 uppercase tracking-wide mb-3">
            Locked
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locked.map(({ badge }) => {
              const s = TIER_STYLES[badge.tier];
              return (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 p-4 rounded-xl border border-ink-200 bg-white opacity-50"
                >
                  <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-ink-700 truncate">{badge.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${s.label}`}>
                        {s.text}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-500 mt-0.5 leading-snug">{badge.description}</p>
                  </div>
                </div>
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
