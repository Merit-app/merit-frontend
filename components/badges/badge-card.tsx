'use client';

import {
  Star, Flame, Trophy, Crown, Gem, Shield, ShieldCheck,
  Compass, GraduationCap, Home, Sun, Clock, Award, Zap,
  Lock, Users, Heart, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

// ── Icon map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Star, Flame, Trophy, Crown, Gem, Shield, ShieldCheck,
  Compass, GraduationCap, Home, Sun, Clock, Award, Zap,
  Users, Heart, Calendar,
};

// ── Tier styles ───────────────────────────────────────────────────────────────

const tierStyles = {
  bronze: {
    ring: 'bg-gradient-to-br from-amber-500 to-amber-700',
    inner: 'bg-gradient-to-br from-amber-400 to-amber-600',
    pill: 'bg-amber-100 text-amber-700',
    label: 'Bronze',
  },
  silver: {
    ring: 'bg-gradient-to-br from-slate-300 to-slate-500',
    inner: 'bg-gradient-to-br from-slate-200 to-slate-400',
    pill: 'bg-slate-100 text-slate-600',
    label: 'Silver',
  },
  gold: {
    ring: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    inner: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    pill: 'bg-yellow-100 text-yellow-700',
    label: 'Gold',
  },
  platinum: {
    ring: 'bg-gradient-to-br from-violet-500 to-cyan-400',
    inner: 'bg-gradient-to-br from-violet-400 to-cyan-500',
    pill: 'bg-violet-100 text-violet-700',
    label: 'Platinum',
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BadgeCardProps {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  iconName?: string;
  earned: boolean;
  earnedAt?: string;
  /** For locked badges: current progress value (e.g. current hours) */
  progressCurrent?: number;
  /** For locked badges: target value from condition_value */
  progressTarget?: number;
  progressLabel?: string;
}

// ── Medallion ─────────────────────────────────────────────────────────────────

function Medallion({ tier, iconName, earned }: { tier: BadgeCardProps['tier']; iconName?: string; earned: boolean }) {
  const s = tierStyles[tier] ?? tierStyles.bronze;
  const Icon = iconMap[iconName ?? ''] ?? Star;

  return (
    <div className={cn('relative flex items-center justify-center', !earned && 'grayscale opacity-40')}>
      {/* Outer ring */}
      <div className={cn('w-20 h-20 rounded-full flex items-center justify-center shadow-lg', s.ring)}>
        {/* Inner circle */}
        <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', s.inner)}>
          <Icon className="w-7 h-7 text-white drop-shadow" />
        </div>
      </div>
      {/* Lock overlay for locked badges */}
      {!earned && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// ── Earned BadgeCard ──────────────────────────────────────────────────────────

import { motion } from 'framer-motion';

export function EarnedBadgeCard({ id, name, description, tier, iconName, earnedAt }: BadgeCardProps) {
  const s = tierStyles[tier] ?? tierStyles.bronze;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl border border-border p-5 flex flex-col items-center text-center gap-3 shadow-sm cursor-default"
    >
      <Medallion tier={tier} iconName={iconName} earned />
      <div className="space-y-1">
        <p className="text-[14px] font-bold text-ink-900 leading-snug">{name}</p>
        <span className={cn('inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', s.pill)}>
          {s.label}
        </span>
      </div>
      <p className="text-[11px] text-ink-500 leading-snug">{description}</p>
      {earnedAt && (
        <p className="text-[11px] text-ink-400">Earned {formatDate(earnedAt)}</p>
      )}
    </motion.div>
  );
}

// ── Locked BadgeCard ──────────────────────────────────────────────────────────

export function LockedBadgeCard({ id, name, description, tier, iconName, progressCurrent, progressTarget, progressLabel }: BadgeCardProps) {
  const s = tierStyles[tier] ?? tierStyles.bronze;
  const hasProgress = progressCurrent !== undefined && progressTarget !== undefined && progressTarget > 0;
  const pct = hasProgress ? Math.min(100, Math.round(((progressCurrent ?? 0) / (progressTarget ?? 1)) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col items-center text-center gap-3 opacity-70">
      <Medallion tier={tier} iconName={iconName} earned={false} />
      <div className="space-y-1">
        <p className="text-[14px] font-semibold text-ink-600 leading-snug">{name}</p>
        <span className={cn('inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full opacity-60', s.pill)}>
          {s.label}
        </span>
      </div>
      <p className="text-[11px] text-ink-400 leading-snug">{description}</p>
      {hasProgress && (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] text-ink-400">
            <span>{progressLabel ?? 'Progress'}</span>
            <span>{progressCurrent} / {progressTarget}</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
            <div className="h-full bg-ink-300 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
