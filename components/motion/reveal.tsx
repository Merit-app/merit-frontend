'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

interface RevealProps {
  children: React.ReactNode;
  /** Seconds to wait before animating in. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  /** Animate only the first time it scrolls into view. */
  once?: boolean;
  className?: string;
}

/**
 * Scroll-triggered fade + rise. Wrap any block; it animates in as it enters
 * the viewport. Respects prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, y = 16, once = true, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

interface RevealGroupProps {
  children: React.ReactNode;
  /** Seconds between each child's entrance. */
  stagger?: number;
  once?: boolean;
  className?: string;
}

/**
 * Staggered scroll reveal — wrap a list/grid in RevealGroup and each direct
 * child in RevealItem.
 */
export function RevealGroup({ children, stagger = 0.08, once = true, className }: RevealGroupProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={groupVariants}
      custom={stagger}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={cn(className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
