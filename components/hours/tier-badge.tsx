import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationTier } from '@/lib/types';

export function TierBadge({ tier }: { tier: VerificationTier }) {
  if (!tier) return <span className="text-[12px] text-ink-400">—</span>;

  if (tier === 'institution') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-merit-blue-700 bg-merit-blue-50 px-2 py-0.5 rounded-full">
        <ShieldCheck size={11} />
        Institution
      </span>
    );
  }

  return (
    <span className="text-[11px] font-medium text-ink-500 bg-ink-100 px-2 py-0.5 rounded-full">
      Supervisor
    </span>
  );
}
