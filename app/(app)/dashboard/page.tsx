import type { Metadata } from 'next';
import { GreetingHeader } from '@/components/dashboard/greeting-header';
import { GoalProgressCard } from '@/components/dashboard/goal-progress-card';
import { StatsRow } from '@/components/dashboard/stats-row';
import { ActivityChartClient } from '@/components/dashboard/activity-chart-client';
import { RecentSessions } from '@/components/dashboard/recent-sessions';
import { QuickActions } from '@/components/dashboard/quick-actions';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-4xl">
      <GreetingHeader />
      <GoalProgressCard />
      <StatsRow />
      <ActivityChartClient />
      <RecentSessions />
      <QuickActions />
    </div>
  );
}
