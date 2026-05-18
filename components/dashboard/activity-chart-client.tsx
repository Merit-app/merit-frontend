'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ActivityChart = dynamic(() => import('./activity-chart'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
      <Skeleton className="h-4 w-24 mb-5" />
      <Skeleton className="h-44 w-full" />
    </div>
  ),
});

export function ActivityChartClient() {
  return <ActivityChart />;
}
