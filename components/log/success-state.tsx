'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  supervisorName: string;
  onLogAnother: () => void;
}

const POLL_STATES = [
  { label: 'Waiting for verification...', delay: 0 },
  { label: 'Text delivered to supervisor.', delay: 2500 },
  { label: `Verified — just now.`, delay: 6000 },
];

export function SuccessState({ supervisorName, onLogAnother }: Props) {
  const router = useRouter();
  const [pollIndex, setPollIndex] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    POLL_STATES.forEach(({ delay }, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => setPollIndex(i), delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.6 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Check size={28} className="text-success" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <h2 className="text-h1 text-ink-900 mb-2">
        Sent to {supervisorName || 'your supervisor'}
      </h2>
      <p className="text-small text-ink-500 mb-8">
        They'll get a text in the next few seconds.
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-3 mb-10">
        <Button
          onClick={onLogAnother}
          className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium"
        >
          Log another session
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className="border-ink-200 text-ink-700 hover:bg-ink-50 font-medium"
        >
          Back to dashboard
        </Button>
      </div>

      {/* Live status indicator */}
      <div className="flex items-center gap-2 text-[13px] text-ink-500">
        <span
          className={[
            'h-2 w-2 rounded-full shrink-0 transition-colors duration-500',
            pollIndex >= 2 ? 'bg-success' : 'bg-warning animate-pulse',
          ].join(' ')}
        />
        {pollIndex < POLL_STATES.length
          ? POLL_STATES[pollIndex].label
          : POLL_STATES[POLL_STATES.length - 1].label}
      </div>
    </div>
  );
}
