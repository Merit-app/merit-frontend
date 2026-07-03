import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned action (button/link). */
  action?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  className?: string;
}

/**
 * One consistent header for every section/page block: title + optional subtitle
 * + optional right-side action. Replaces the ad-hoc `flex justify-between` +
 * `text-h2` headers scattered across pages so spacing/weight stays uniform.
 */
export function SectionHeader({ title, subtitle, action, icon, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-2.5">
        {icon ? <span className="mt-0.5 text-muted-foreground [&_svg]:size-5">{icon}</span> : null}
        <div className="min-w-0">
          <h2 className="text-h2 truncate text-foreground">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
