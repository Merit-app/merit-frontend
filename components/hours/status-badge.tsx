import { cn } from '@/lib/utils';
import type { SessionStatus } from '@/lib/types';

const CONFIG: Record<SessionStatus, { label: string; className: string }> = {
  verified: { label: 'Verified',  className: 'text-success bg-success-bg' },
  pending:  { label: 'Pending',   className: 'text-warning bg-warning-bg' },
  disputed: { label: 'Disputed',  className: 'text-danger  bg-danger-bg'  },
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', className)}>
      {label}
    </span>
  );
}
