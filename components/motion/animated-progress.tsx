'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  /** Seconds to wait before the fill starts. */
  delay?: number;
  className?: string;
  barClassName?: string;
  'aria-label'?: string;
}

/**
 * Progress bar that animates its fill when it scrolls into view.
 * Respects prefers-reduced-motion (renders at final width).
 */
export function AnimatedProgress({
  value,
  delay = 0,
  className,
  barClassName,
  ...rest
}: AnimatedProgressProps) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}
      {...rest}
    >
      <motion.div
        className={cn('h-full rounded-full bg-merit-blue-600', barClassName)}
        initial={reduce ? { width: `${pct}%` } : { width: '0%' }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      />
    </div>
  );
}
