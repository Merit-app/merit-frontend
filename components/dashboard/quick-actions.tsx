'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Plus, CalendarPlus } from 'lucide-react';
import { useMeritStore } from '@/lib/store';

export function QuickActions() {
  const router = useRouter();
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);
  const organizations = useMeritStore((s) => s.organizations);

  const totalHours = sessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);
  const remaining = user.nhsGoalHours - totalHours;

  // Top org by session count (for the "almost there" suggestion)
  const orgCounts: Record<string, number> = {};
  sessions.forEach((s) => { orgCounts[s.orgSlug] = (orgCounts[s.orgSlug] ?? 0) + 1; });
  const topOrgSlug = Object.entries(orgCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topOrg = organizations.find((o) => o.slug === topOrgSlug);

  const showAlmostThere = remaining > 0 && remaining <= 20 && topOrg;
  const showAddOrg = organizations.length < 5;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Card 1: Almost there / Log time suggestion */}
      {showAlmostThere ? (
        <div className="bg-white rounded-xl border border-ink-200 p-5">
          <p className="text-micro text-ink-500 mb-2">Almost there</p>
          <p className="text-h3 text-ink-900 mb-1">
            {remaining % 1 === 0 ? remaining : remaining.toFixed(1)} hrs left on your goal
          </p>
          <p className="text-small text-ink-500 mb-4">
            You've visited {topOrg.name} the most. Log time there to close it out.
          </p>
          <Link
            href={`/log?org=${topOrg.slug}`}
            className="inline-flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Log time at {topOrg.name.split(' ')[0]}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink-200 p-5">
          <p className="text-micro text-ink-500 mb-2">Keep going</p>
          <p className="text-h3 text-ink-900 mb-1">Log a new session</p>
          <p className="text-small text-ink-500 mb-4">
            Consistent logging makes verification faster and your record more credible.
          </p>
          <Link
            href="/log"
            className="inline-flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Log hours
          </Link>
        </div>
      )}

      {/* Card 2: Add org / coming up */}
      {showAddOrg ? (
        <div className="bg-white rounded-xl border border-ink-200 p-5">
          <p className="text-micro text-ink-500 mb-2">Expand your record</p>
          <p className="text-h3 text-ink-900 mb-1">Add another organization</p>
          <p className="text-small text-ink-500 mb-4">
            Colleges like to see breadth. Add another org to diversify your service record.
          </p>
          <Link
            href="/organizations"
            className="inline-flex items-center gap-1.5 border border-ink-200 hover:bg-ink-50 text-ink-700 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Building2 size={14} />
            Browse organizations
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink-200 p-5">
          <p className="text-micro text-ink-500 mb-2">Stay on track</p>
          <p className="text-h3 text-ink-900 mb-1">Export your record</p>
          <p className="text-small text-ink-500 mb-4">
            Download a verified PDF of your hours for scholarships, college applications, and graduation.
          </p>
          <Link
            href="/export"
            className="inline-flex items-center gap-1.5 border border-ink-200 hover:bg-ink-50 text-ink-700 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <CalendarPlus size={14} />
            Export PDF
          </Link>
        </div>
      )}
    </div>
  );
}
