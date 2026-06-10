'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  /** 0–100. Clamped. */
  value: number;
  /** Outer diameter in px. */
  size?: number;
  strokeWidth?: number;
  /** Content rendered in the center of the ring. */
  children?: React.ReactNode;
  className?: string;
  /** Stroke gradient: warm student look. Set false for a flat accent ring. */
  gradient?: boolean;
}

/**
 * Animated goal ring — sweeps to `value` on mount. The hero progress moment
 * for the student dashboard.
 */
export function ProgressRing({
  value,
  size = 112,
  strokeWidth = 10,
  children,
  className,
  gradient = true,
}: ProgressRingProps) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {gradient && (
          <defs>
            <linearGradient id="merit-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={gradient ? 'url(#merit-ring-gradient)' : 'var(--primary)'}
          strokeDasharray={c}
          initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
