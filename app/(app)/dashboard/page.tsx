import type { Metadata } from 'next';
import { useEffect } from 'react';
import { GreetingHeader } from '@/components/dashboard/greeting-header';
import { GoalProgressCard } from '@/components/dashboard/goal-progress-card';
import { StatsRow } from '@/components/dashboard/stats-row';
import { ActivityChartClient } from '@/components/dashboard/activity-chart-client';
import { RecentSessions } from '@/components/dashboard/recent-sessions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { BadgeStrip } from '@/components/dashboard/badge-strip';
import { StreakDisplay } from '@/components/dashboard/streak-display';
import { useMeritStore } from '@/lib/store';
import { toast } from 'sonner';

export const metadata: Metadata = { title: 'Dashboard' };

function MilestoneChecker() {
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);

  useEffect(() => {
    const verified = sessions.filter((s) => s.status === 'verified');
    const totalHours = verified.reduce((sum, s) => sum + s.hours, 0);
    const goal = user.nhsGoalHours || 1;
    const percent = Math.round((totalHours / goal) * 100);

    if (goal && totalHours > 0) {
      const shownKey = `milestone-${Math.floor(percent / 25) * 25}`;
      const alreadyShown = localStorage.getItem(shownKey) === 'true';

      if (percent >= 100 && !alreadyShown) {
        toast.success('🎉🎉🎉 You hit your goal!');
        localStorage.setItem(shownKey, 'true');
      } else if (percent >= 75 && percent < 100) {
        const key75 = 'milestone-75';
        if (!localStorage.getItem(key75)) {
          toast.success('🎉 Almost there — 75% done!');
          localStorage.setItem(key75, 'true');
        }
      } else if (percent >= 50 && percent < 75) {
        const key50 = 'milestone-50';
        if (!localStorage.getItem(key50)) {
          toast.success('🎉 Halfway to your goal! Keep it up');
          localStorage.setItem(key50, 'true');
        }
      } else if (percent >= 25 && percent < 50) {
        const key25 = 'milestone-25';
        if (!localStorage.getItem(key25)) {
          toast.success('🎉 You\'re a quarter of the way there!');
          localStorage.setItem(key25, 'true');
        }
      }
    }
  }, [user.nhsGoalHours, sessions]);

  return null;
}

export default function DashboardPage() {
  return (
    <div className="w-full px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto">
      <MilestoneChecker />
      <GreetingHeader />
      <StreakDisplay />
      <WelcomeBanner />
      <GoalProgressCard />
      <StatsRow />
      <BadgeStrip />
      <ActivityChartClient />
      <RecentSessions />
      <QuickActions />
    </div>
  );
}
