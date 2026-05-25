'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OrgCard } from '@/components/orgs/org-card';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { OrgCategory } from '@/lib/types';

const CATEGORIES: (OrgCategory | 'All')[] = [
  'All', 'Community', 'Education', 'Health', 'Animal welfare',
  'Environment', 'Social services', 'Other',
];

export default function OrganizationsPage() {
  const hydrated = useHydrationStore((s) => s.hydrated);
  const organizations = useMeritStore((s) => s.organizations);
  const sessions = useMeritStore((s) => s.sessions);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<OrgCategory | 'All'>('All');

  const filtered = useMemo(() => {
    let orgs = organizations;
    if (category !== 'All') orgs = orgs.filter((o) => o.category === category);
    if (query) {
      const q = query.toLowerCase();
      orgs = orgs.filter((o) => o.name.toLowerCase().includes(q));
    }
    return orgs;
  }, [organizations, category, query]);

  return (
    <div className="px-4 py-4 md:px-8 md:py-6">
      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations..."
            className="pl-9 h-9 text-[13px]"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors',
                category === cat
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {!hydrated ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-ink-200 p-5 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Building2 size={32} className="text-ink-300 mb-3" />
          <p className="text-[15px] font-semibold text-ink-900 mb-1">No organizations found.</p>
          <p className="text-small text-ink-500">
            {query || category !== 'All'
              ? 'Try a different search or category.'
              : 'Organizations you log hours at will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((org) => (
            <OrgCard key={org.id} org={org} sessions={sessions} />
          ))}
        </div>
      )}
    </div>
  );
}
