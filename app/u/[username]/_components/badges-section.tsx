interface Badge {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  iconName: string;
  earnedAt: string;
}

interface Props {
  badges: Badge[];
}

const TIER_STYLES: Record<Badge['tier'], { ring: string; bg: string; label: string; dot: string }> = {
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

function BadgeChip({ badge }: { badge: Badge }) {
  const styles = TIER_STYLES[badge.tier];
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ring-1 ${styles.ring} ${styles.bg}`}
      title={badge.description}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink-900 leading-tight truncate">{badge.name}</p>
        <p className={`text-[10px] font-medium uppercase tracking-wide ${styles.label}`}>{badge.tier}</p>
      </div>
    </div>
  );
}

export function BadgesSection({ badges }: Props) {
  if (badges.length === 0) {
    return (
      <section>
        <h2 className="text-[15px] font-semibold text-ink-900 mb-3">Badges</h2>
        <p className="text-sm text-ink-400">No badges earned yet.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-ink-900">
          Badges
          <span className="ml-2 text-[12px] font-medium text-ink-400">{badges.length}</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {badges.map((b) => (
          <BadgeChip key={b.id} badge={b} />
        ))}
      </div>
    </section>
  );
}
