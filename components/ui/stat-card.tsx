import * as React from 'react';
import { cn } from '@/lib/utils';

type Accent = 'blue' | 'green' | 'amber' | 'violet' | 'neutral';

const ACCENT_ICON: Record<Accent, string> = {
  blue: 'bg-merit-blue-50 text-merit-blue-600',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-[#FAF5FF] text-[#7E22CE] dark:bg-[#2c1f45] dark:text-[#d8b4fe]',
  neutral: 'bg-muted text-muted-foreground',
};

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Small caption under the value (e.g. "of 40 goal"). */
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: Accent;
  /** Trend chip, e.g. "+3 this week". */
  trend?: { label: string; direction?: 'up' | 'down' | 'flat' };
  className?: string;
}

/**
 * The single stat tile used across dashboard / org / chapter. Value renders in
 * tabular-nums so columns of numbers align. Replaces the ~4 divergent
 * hand-rolled stat-card patterns the surveys found.
 */
export function StatCard({ label, value, hint, icon, accent = 'neutral', trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5',
        'transition-shadow duration-200 hover:shadow-[var(--shadow-elevated)]',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-micro text-muted-foreground">{label}</p>
        {icon ? (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg [&_svg]:size-4', ACCENT_ICON[accent])}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      <div className="flex items-center gap-2">
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
              trend.direction === 'down'
                ? 'bg-red-50 text-red-700'
                : trend.direction === 'flat'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-green-50 text-green-700',
            )}
          >
            {trend.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
