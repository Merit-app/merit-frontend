import { cn } from '@/lib/utils';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeChipData {
  id: string;
  name: string;
  tier: BadgeTier;
  description?: string;
}

const TIER_STYLES: Record<BadgeTier, { ring: string; bg: string; label: string; dot: string }> = {
  bronze: {
    ring: 'ring-amber-300',
    bg: 'bg-amber-50',
    label: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  silver: {
    ring: 'ring-slate-300',
    bg: 'bg-slate-50',
    label: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  gold: {
    ring: 'ring-yellow-400',
    bg: 'bg-yellow-50',
    label: 'text-yellow-700',
    dot: 'bg-yellow-400',
  },
  platinum: {
    ring: 'ring-sky-300',
    bg: 'bg-sky-50',
    label: 'text-sky-700',
    dot: 'bg-sky-400',
  },
};

/**
 * BadgeChip — compact pill for use in rank rows, profile cards, etc.
 * Sizes: 'sm' (default) or 'xs' (leaderboard inline)
 */
export function BadgeChip({
  badge,
  size = 'sm',
  className,
}: {
  badge: BadgeChipData;
  size?: 'xs' | 'sm';
  className?: string;
}) {
  const styles = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze;

  if (size === 'xs') {
    return (
      <span
        title={badge.description ?? badge.name}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ring-1',
          styles.ring,
          styles.bg,
          styles.label,
          className,
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', styles.dot)} />
        {badge.name}
      </span>
    );
  }

  return (
    <div
      title={badge.description ?? badge.name}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border ring-1',
        styles.ring,
        styles.bg,
        className,
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', styles.dot)} />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink-900 leading-tight truncate">{badge.name}</p>
        <p className={cn('text-[10px] font-medium uppercase tracking-wide', styles.label)}>
          {badge.tier}
        </p>
      </div>
    </div>
  );
}
