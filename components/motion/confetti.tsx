'use client';

import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EC4899', '#06B6D4'];
const COUNT = 32;
const DURATION_MS = 2800;

interface ConfettiBurstProps {
  /** Called when the burst finishes so the parent can unmount it. */
  onDone?: () => void;
}

/**
 * One-shot celebration confetti — renders a fixed overlay of falling pieces,
 * then calls onDone. Use sparingly so it stays special (goal completion,
 * milestone badges). No-ops under prefers-reduced-motion.
 */
export function ConfettiBurst({ onDone }: ConfettiBurstProps) {
  const reduce = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.8 + Math.random() * 1,
        drift: (Math.random() - 0.5) * 160,
        rotate: (Math.random() - 0.5) * 720,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 5,
      })),
    []
  );

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), reduce ? 0 : DURATION_MS);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
          }}
          initial={{ y: -24, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', x: p.drift, opacity: [1, 1, 0.9, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.3, 0.1, 0.6, 1] }}
        />
      ))}
    </div>
  );
}
