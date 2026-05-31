import { Skeleton } from '@/components/ui/skeleton';

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function SessionRowSkeleton() {
  return (
    <div className="grid grid-cols-[32px_120px_1fr_1fr_80px_140px_100px_40px] gap-3 px-4 py-3.5 border-b border-ink-100 items-center">
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <span />
    </div>
  );
}

export function SessionsListSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-ink-200 overflow-x-auto">
      <div className="min-w-[820px]">
        <div className="grid grid-cols-[32px_120px_1fr_1fr_80px_140px_100px_40px] gap-3 px-4 py-2.5 border-b border-ink-200 bg-ink-50">
          <Skeleton className="h-3 w-4 rounded" />
          {['Date', 'Organization', 'Activity', 'Hours', 'Tier', 'Status', ''].map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SessionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="rounded-xl border border-ink-200 bg-white p-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Organizations ────────────────────────────────────────────────────────────

export function OrgCardSkeleton() {
  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden bg-white">
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="p-4 pt-8 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20 mt-1" />
      </div>
    </div>
  );
}

export function OrgGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <OrgCardSkeleton key={i} />)}
    </div>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export function BadgeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 flex flex-col items-center gap-3">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

export function BadgesPageSkeleton() {
  return (
    <div className="space-y-8">
      {['Earned', 'Locked'].map((section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <BadgeCardSkeleton key={i} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ink-200 bg-white p-6 flex gap-4">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
