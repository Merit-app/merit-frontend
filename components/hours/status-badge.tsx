import { cn } from '@/lib/utils';
import type { SessionStatus } from '@/lib/types';

const CONFIG: Record<SessionStatus, { label: string; className: string }> = {
  verified: { label: 'Verified',  className: 'text-success bg-success-bg' },
  pending:  { label: 'Awaiting reply', className: 'text-warning bg-warning-bg' },
  disputed: { label: 'Disputed',  className: 'text-danger  bg-danger-bg'  },
};

const SELF_TRACKED = {
  label: 'Self-tracked',
  className: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10',
};

// Logged but the supervisor text hasn't gone out yet — neutral so it reads as a
// draft awaiting an action, distinct from the yellow "Awaiting reply".
const NOT_SENT = {
  label: 'Not sent yet',
  className: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-500/15',
};

export function StatusBadge({
  status,
  selfReported,
  verificationSent,
}: {
  status: SessionStatus;
  selfReported?: boolean;
  verificationSent?: boolean;
}) {
  // Self-tracked sessions are stored as status 'verified' but aren't org-verified,
  // so they get their own label rather than the green "Verified" badge.
  let label: string;
  let className: string;
  if (selfReported) {
    ({ label, className } = SELF_TRACKED);
  } else if (status === 'pending' && verificationSent === false) {
    ({ label, className } = NOT_SENT);
  } else {
    ({ label, className } = CONFIG[status]);
  }

  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', className)}>
      {label}
    </span>
  );
}
