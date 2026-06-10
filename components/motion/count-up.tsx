'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CountUpProps {
  value: number;
  /** Seconds the count takes. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animated number — counts from 0 to `value` when it scrolls into view.
 * Renders in Geist Mono tabular figures so digits don't jitter.
 */
export function CountUp({
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => (0).toFixed(decimals));

  useEffect(() => {
    if (reduce) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, duration, decimals, reduce]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
