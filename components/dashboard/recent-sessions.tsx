'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Plus } from 'lucide-react';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { formatSessionDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'text-success bg-success-bg' },
  pending:  { label: 'Pending',  className: 'text-warning bg-warning-bg' },
  disputed: { label: 'Disputed', className: 'text-danger bg-danger-bg'  },
};

function RecentSessionsSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y divide-ink-100">
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
      <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-h3 text-ink-900">Recent sessions</h3>
        </div>
        <div className="flex flex-col items-center py-10 text-center">
          <Clock size={32} className="text-ink-300 mb-3" />
          <p className="text-[15px] font-semibold text-ink-900 mb-1">Nothing logged yet.</p>
          <p className="text-small text-ink-500 mb-4">Your first session is the hardest.</p>
          <Link
            href="/log"
            className="flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Log first session
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-ink-900">Recent sessions</h3>
        <Link
          href="/hours"
          className="text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="divide-y divide-ink-100">
        {recent.map((session) => {
          const status = STATUS_STYLES[session.status] ?? STATUS_STYLES.pending;
          return (
            <button
              key={session.id}
              onClick={() => router.push(`/hours?session=${session.id}`)}
              className="w-full flex items-center gap-4 py-3 hover:bg-ink-50 -mx-2 px-2 rounded-lg transition-colors duration-100 text-left cursor-pointer"
            >
              {/* Date */}
              <span className="text-small text-ink-500 w-16 shrink-0 tabular-nums">
                {formatSessionDate(session.date)}
              </span>

              {/* Org + activity */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink-900 truncate">{session.org}</p>
                <p className="text-[12px] text-ink-500 truncate mt-0.5">{session.activity}</p>
              </div>

              {/* Hours */}
              <span className="text-[13px] font-medium text-ink-700 tabular-nums shrink-0">
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
