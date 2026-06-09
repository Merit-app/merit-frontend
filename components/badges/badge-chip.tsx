import {
  Award,
  Star,
  Flame,
  Crown,
  Trophy,
  Shield,
  Zap,
  Clock,
  Heart,
  BookOpen,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Icon map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Star,
  Flame,
  Crown,
  Trophy,
  Shield,
  Zap,
  Clock,
  Heart,
  BookOpen,
};

// ── Tier styles (single source of truth) ─────────────────────────────────────

export const tierStyles = {
  bronze: {
    pill: 'bg-amber-50 border-amber-200 text-amber-800',
    dot: 'bg-amber-500',
    iconColor: 'text-amber-700',
    ring: 'bg-gradient-to-br from-amber-500 to-amber-700',
    inner: 'bg-gradient-to-br from-amber-400 to-amber-600',
    label: 'text-amber-600',
  },
  silver: {
    pill: 'bg-slate-50 border-slate-200 text-slate-700',
    dot: 'bg-slate-400',
    iconColor: 'text-slate-600',
    ring: 'bg-gradient-to-br from-slate-300 to-slate-500',
    inner: 'bg-gradient-to-br from-slate-200 to-slate-400',
    label: 'text-slate-500',
  },
  gold: {
    pill: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    dot: 'bg-yellow-500',
    iconColor: 'text-yellow-700',
    ring: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    inner: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    label: 'text-yellow-600',
  },
  platinum: {
    pill: 'bg-violet-50 border-violet-200 text-violet-800',
    dot: 'bg-violet-500',
    iconColor: 'text-violet-700',
    ring: 'bg-gradient-to-br from-violet-500 to-cyan-400',
    inner: 'bg-gradient-to-br from-violet-400 to-cyan-500',
    label: 'text-violet-600',
  },
} as const;

export type BadgeTier = keyof typeof tierStyles;

export interface BadgeChipData {
  id: string;
  name: string;
  tier: BadgeTier;
  description?: string;
}

// ── BadgeChip — compact pill ──────────────────────────────────────────────────

/**
 * Use for: dashboard badge strip, leaderboard rows, personal card,
 * public profile badges grid, anywhere space is limited.
 */
export function BadgeChip({
  badge,
  size = 'sm',
  showTier = false,
  className,
}: {
  badge: BadgeChipData;
  size?: 'xs' | 'sm';
  showTier?: boolean;
  className?: string;
}) {
  const style = tierStyles[badge.tier] ?? tierStyles.bronze;

  if (size === 'xs') {
    return (
      <span
        title={badge.description ?? badge.name}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ring-1 border',
          badge.tier === 'bronze' && 'ring-amber-300 bg-amber-50 text-amber-800',
          badge.tier === 'silver' && 'ring-slate-300 bg-slate-50 text-slate-700',
          badge.tier === 'gold' && 'ring-yellow-400 bg-yellow-50 text-yellow-800',
          badge.tier === 'platinum' && 'ring-violet-300 bg-violet-50 text-violet-800',
          className,
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
        {badge.name}
      </span>
    );
  }

  return (
    <div
      title={badge.description ?? badge.name}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium',
        style.pill,
        className,
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', style.dot)} />
      <span>{badge.name}</span>
      {showTier && (
        <span className="uppercase text-[10px] tracking-wide opacity-60 font-semibold">
          {badge.tier}
        </span>
      )}
    </div>
  );
}

// ── BadgeMedallion — full medallion with icon ─────────────────────────────────

const MEDALLION_SIZES = {
  sm: {
    outer: 'w-10 h-10',
    inner: 'w-7 h-7',
    icon: 'w-3.5 h-3.5',
    name: 'text-xs',
    tier: 'text-[10px]',
    maxW: 'max-w-[56px]',
  },
  md: {
    outer: 'w-16 h-16',
    inner: 'w-11 h-11',
    icon: 'w-5 h-5',
    name: 'text-xs',
    tier: 'text-[10px]',
    maxW: 'max-w-[72px]',
  },
  lg: {
    outer: 'w-20 h-20',
    inner: 'w-14 h-14',
    icon: 'w-6 h-6',
    name: 'text-sm',
    tier: 'text-xs',
    maxW: 'max-w-[88px]',
  },
};

/**
 * Use for: /badges page, public profile top badges, settings preview.
 */
export function BadgeMedallion({
  name,
  tier,
  iconName,
  earned = true,
  earnedAt,
  size = 'md',
  className,
}: {
  name: string;
  tier: string;
  iconName?: string;
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const style = tierStyles[tier as BadgeTier] ?? tierStyles.bronze;
  const Icon = (iconName ? iconMap[iconName] : null) ?? Award;
  const s = MEDALLION_SIZES[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2',
        !earned && 'opacity-40 grayscale',
        className,
      )}
    >
      <div className="relative">
        <div
          className={cn(
            s.outer,
            'rounded-full flex items-center justify-center shadow-md',
            style.ring,
          )}
        >
          <div
            className={cn(
              s.inner,
              'rounded-full flex items-center justify-center',
              style.inner,
            )}
          >
            <Icon className={cn(s.icon, 'text-white drop-shadow')} />
          </div>
        </div>
        {!earned && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-muted-foreground" />
          </div>
        )}
      </div>

      <p
        className={cn(
          'font-semibold text-center leading-tight',
          s.name,
          s.maxW,
        )}
      >
        {name}
      </p>

      <p className={cn('uppercase tracking-wider font-bold', s.tier, style.label)}>
        {tier}
      </p>

      {earned && earnedAt && (
        <p className="text-[10px] text-muted-foreground">
          {new Date(earnedAt).toLocaleDateString('en-CA', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}
