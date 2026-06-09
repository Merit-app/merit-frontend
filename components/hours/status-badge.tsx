import { cn } from '@/lib/utils';
import type { SessionStatus } from '@/lib/types';

const CONFIG: Record<SessionStatus, { label: string; className: string }> = {
  verified: { label: 'Verified',  className: 'text-success bg-success-bg' },
  pending:  { label: 'Pending',   className: 'text-warning bg-warning-bg' },
  disputed: { label: 'Disputed',  className: 'text-danger  bg-danger-bg'  },
};

const SELF_TRACKED = {
  label: 'Self-tracked',
  className: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10',
};

export function StatusBadge({ status, selfReported }: { status: SessionStatus; selfReported?: boolean }) {
  // Self-tracked sessions are stored as status 'verified' but aren't org-verified,
  // so they get their own label rather than the green "Verified" badge.
  const { label, className } = selfReported ? SELF_TRACKED : CONFIG[status];
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', className)}>
      {label}
    </span>
  );
}
