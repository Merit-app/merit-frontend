'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Plus } from 'lucide-react';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatSessionDate, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'text-success bg-success-bg' },
  pending:  { label: 'Pending',  className: 'text-warning bg-warning-bg' },
  disputed: { label: 'Disputed', className: 'text-danger bg-danger-bg'  },
};

const SELF_TRACKED_STYLE = {
  label: 'Self-tracked',
  className: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10',
};

function RecentSessionsSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y divide-border">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-3 w-10 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-12 shrink-0" />
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentSessions() {
  const router = useRouter();
  const hydrated = useHydrationStore((s) => s.hydrated);
  const sessions = useMeritStore((s) => s.sessions);

  if (!hydrated) return <RecentSessionsSkeleton />;

  const recent = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-h3 text-foreground">Recent sessions</h3>
        </div>
        <EmptyState
          icon={Clock}
          title="Nothing logged yet"
          description="Your first session is the hardest — it takes about 20 seconds."
          action={
            <Link
              href="/log"
              className="flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus size={14} />
              Log your first session
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-foreground">Recent sessions</h3>
        <Link
          href="/hours"
          className="text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="divide-y divide-border">
        {recent.map((session) => {
          const status = session.selfReported
            ? SELF_TRACKED_STYLE
            : STATUS_STYLES[session.status] ?? STATUS_STYLES.pending;
          return (
            <button
              key={session.id}
              onClick={() => router.push(`/hours?session=${session.id}`)}
              className="w-full flex items-center gap-4 py-3 hover:bg-background -mx-2 px-2 rounded-lg transition-colors duration-100 text-left cursor-pointer"
            >
              {/* Date - relative time */}
              <span className="text-small text-muted-foreground w-20 shrink-0 tabular-nums">
                {formatRelativeTime(session.date + 'T12:00:00')}
              </span>

              {/* Org + activity */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{session.org}</p>
                <p className="text-[12px] text-muted-foreground truncate mt-0.5">{session.activity}</p>
              </div>

              {/* Hours */}
              <span className="text-[13px] font-medium text-foreground tabular-nums shrink-0">
                {session.hours % 1 === 0 ? session.hours : session.hours.toFixed(1)} hrs
              </span>

              {/* Status badge */}
              <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0', status.className)}>
                {status.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
