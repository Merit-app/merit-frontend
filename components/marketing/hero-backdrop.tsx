'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Immersive hero atmosphere for the dark band: two slow-drifting blue aurora
 * blobs (Framer) + a masked blueprint grid + a crisp top spotlight (Stripe).
 * Purely decorative (aria-hidden, non-interactive). Under prefers-reduced-motion
 * the blobs render static — no drift, no CPU.
 */
export function HeroBackdrop() {
  const reduce = useReducedMotion();

  const drift = (dx: number, dy: number) =>
    reduce
      ? undefined
      : {
          x: [0, dx, 0],
          y: [0, dy, 0],
        };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Masked blueprint grid */}
      <div className="absolute inset-0 text-white/60 bg-grid-faint mask-radial-fade opacity-[0.14]" />

      {/* Top spotlight */}
      <div className="absolute left-1/2 top-[-240px] h-[520px] w-[880px] -translate-x-1/2 rounded-full bg-merit-blue-500/[0.18] blur-[140px]" />

      {/* Aurora blobs */}
      <motion.div
        className="absolute left-[8%] top-[12%] h-[360px] w-[360px] rounded-full bg-merit-blue-600/25 blur-[120px]"
        animate={drift(60, 40)}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[6%] top-[30%] h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[130px]"
        animate={drift(-50, 30)}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom fade so the band reads as a plane, not a void */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </div>
  );
}
