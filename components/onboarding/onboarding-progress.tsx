'use client';

import { cn } from '@/lib/utils';

interface Props {
  total: number;
  current: number; // 0-indexed
}

export function OnboardingProgress({ total, current }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i === current
              ? 'w-4 h-1.5 bg-merit-blue-600'
              : i < current
              ? 'w-1.5 h-1.5 bg-merit-blue-300'
              : 'w-1.5 h-1.5 bg-ink-200',
          )}
        />
      ))}
    </div>
  );
}
