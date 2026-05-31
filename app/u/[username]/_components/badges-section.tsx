import { BadgeChip } from '@/components/badges/badge-chip';

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
          <BadgeChip key={b.id} badge={b} size="sm" />
        ))}
      </div>
    </section>
  );
}
