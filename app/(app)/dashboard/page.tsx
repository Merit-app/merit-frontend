import type { Metadata } from 'next';
import { GreetingHeader } from '@/components/dashboard/greeting-header';
import { GoalProgressCard } from '@/components/dashboard/goal-progress-card';
import { StatsRow } from '@/components/dashboard/stats-row';
import { ActivityChartClient } from '@/components/dashboard/activity-chart-client';
import { RecentSessions } from '@/components/dashboard/recent-sessions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { BadgeStrip } from '@/components/dashboard/badge-strip';
import { SelfTrackedStat } from '@/components/dashboard/self-tracked-stat';
import { StreakDisplay } from '@/components/dashboard/streak-display';
import { InboxPreview } from '@/components/dashboard/inbox-preview';
import { MilestoneCheckerClient } from '@/components/dashboard/milestone-checker-client';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'Dashboard', noIndex: true });

export default function DashboardPage() {
  return (
    <div className="w-full px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto">
      <MilestoneCheckerClient />
      <GreetingHeader />
      <StreakDisplay />
      <WelcomeBanner />
      <InboxPreview />
      <GoalProgressCard />
      <StatsRow />
      <SelfTrackedStat />
      <BadgeStrip />
      <ActivityChartClient />
      <RecentSessions />
      <QuickActions />
    </div>
  );
}
