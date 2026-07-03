'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltProps {
  children: React.ReactNode;
  /** Max rotation in degrees at the edges. */
  max?: number;
  /** Lift toward the viewer on hover (px of translateZ). */
  lift?: number;
  className?: string;
}

/**
 * Pointer-driven 3D tilt — the Framer/Vercel "this thing is a real object"
 * effect for hero device mockups. Springs back to flat on leave, and is a
 * no-op under prefers-reduced-motion (renders a plain div).
 */
export function Tilt({ children, max = 8, lift = 24, className }: TiltProps) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 150, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);

  if (reduce) return <div className={className}>{children}</div>;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('[transform-style:preserve-3d]', className)}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      whileHover={{ z: lift }}
      transition={{ type: 'spring', ...spring }}
    >
      {children}
    </motion.div>
  );
}
