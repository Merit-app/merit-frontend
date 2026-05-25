import type { Metadata } from 'next';
import { GreetingHeader } from '@/components/dashboard/greeting-header';
import { GoalProgressCard } from '@/components/dashboard/goal-progress-card';
import { StatsRow } from '@/components/dashboard/stats-row';
import { ActivityChartClient } from '@/components/dashboard/activity-chart-client';
import { RecentSessions } from '@/components/dashboard/recent-sessions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="w-full px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto">
      <GreetingHeader />
      <WelcomeBanner />
      <GoalProgressCard />
      <StatsRow />
      <ActivityChartClient />
      <RecentSessions />
      <QuickActions />
    </div>
  );
}
