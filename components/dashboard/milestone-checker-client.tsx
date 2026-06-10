'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMeritStore } from '@/lib/store';
import { ConfettiBurst } from '@/components/motion';

export function MilestoneCheckerClient() {
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const verified = sessions.filter((s) => s.status === 'verified');
    const totalHours = verified.reduce((sum, s) => sum + s.hours, 0);
    const goal = user.nhsGoalHours || 1;
    const percent = Math.round((totalHours / goal) * 100);

    if (goal && totalHours > 0) {
      const shownKey = `milestone-${Math.floor(percent / 25) * 25}`;
      const alreadyShown = window.localStorage.getItem(shownKey) === 'true';

      if (percent >= 100 && !alreadyShown) {
        toast.success('🎉🎉🎉 You hit your goal!');
        setCelebrate(true);
        window.localStorage.setItem(shownKey, 'true');
      } else if (percent >= 75 && percent < 100) {
        const key75 = 'milestone-75';
        if (!window.localStorage.getItem(key75)) {
          toast.success('🎉 Almost there — 75% done!');
          window.localStorage.setItem(key75, 'true');
        }
      } else if (percent >= 50 && percent < 75) {
        const key50 = 'milestone-50';
        if (!window.localStorage.getItem(key50)) {
          toast.success('🎉 Halfway to your goal! Keep it up');
          window.localStorage.setItem(key50, 'true');
        }
      } else if (percent >= 25 && percent < 50) {
        const key25 = 'milestone-25';
        if (!window.localStorage.getItem(key25)) {
          toast.success("🎉 You're a quarter of the way there!");
          window.localStorage.setItem(key25, 'true');
        }
      }
    }
  }, [user.nhsGoalHours, sessions]);

  if (!celebrate) return null;
  return <ConfettiBurst onDone={() => setCelebrate(false)} />;
}
