'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SlideProps {
  heading: string;
  subtext: string;
  visual: React.ReactNode;
  /** Direction: 1 = entering from right, -1 = entering from left */
  direction: 1 | -1;
}

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
};

export function OnboardingSlide({ heading, subtext, visual, direction }: SlideProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.8 }}
      className="flex flex-col items-center text-center px-6 pt-4 pb-2 gap-5"
    >
      {/* Visual */}
      <div className={cn(
        'w-full rounded-2xl bg-ink-100 flex items-center justify-center',
        'h-40 sm:h-48',
      )}>
        {visual}
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold text-ink-900 leading-snug">{heading}</h2>
        <p className="text-sm text-ink-500 leading-relaxed">{subtext}</p>
      </div>
    </motion.div>
  );
}
