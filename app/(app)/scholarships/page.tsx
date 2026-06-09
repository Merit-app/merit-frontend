'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, GraduationCap, Sparkles, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { scholarshipsApi } from '@/lib/api';
import { ScholarshipCard } from '@/components/scholarships/scholarship-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Category = 'all' | 'community' | 'environment' | 'education' | 'health' | 'stem' | 'arts' | 'leadership' | 'athletics' | 'indigenous' | 'social-impact';
type Location = 'all' | 'BC' | 'Canada';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'community',    label: 'Community' },
  { key: 'environment',  label: 'Environment' },
  { key: 'education',    label: 'Education' },
  { key: 'health',       label: 'Health' },
  { key: 'stem',         label: 'STEM' },
  { key: 'leadership',   label: 'Leadership' },
  { key: 'athletics',    label: 'Athletics' },
  { key: 'arts',         label: 'Arts' },
  { key: 'indigenous',   label: 'Indigenous' },
  { key: 'social-impact',label: 'Social Impact' },
];

const LABEL_MAP: Record<string, string> = {
  community: 'community', environment: 'environment', nature: 'nature',
  volunteering: 'volunteering', education: 'education', health: 'health',
  'social-impact': 'social impact', leadership: 'leadership', athletics: 'athletics',
  stem: 'STEM', arts: 'arts & culture', indigenous: 'Indigenous',
};

function CategoryPill({ cat }: { cat: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-merit-blue-50 dark:bg-merit-blue-500/10 text-merit-blue-700 dark:text-merit-blue-300 px-2.5 py-0.5 rounded-full capitalize">
      {LABEL_MAP[cat] ?? cat.replace('-', ' ')}
    </span>
  );
}

export default function ScholarshipsPage() {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState<Category>('all');
  const [location, setLocation]   = useState<Location>('all');

  // Personalized recommendations
  const { data: forMeRes, isLoading: forMeLoading } = useQuery({
    queryKey: ['scholarships-for-me'],
    queryFn: () => scholarshipsApi.forMe(),
  });
  const forMeData    = (forMeRes as any)?.data;
  const recommended  = forMeData?.scholarships ?? [];
  const matchedCats  = forMeData?.matchedCategories ?? [];
  const forMeSaved   = new Set<string>(forMeData?.savedIds ?? []);

  // Discover list
  const { data: listRes, isLoading: listLoading } = useQuery({
    queryKey: ['scholarships-list', search, category, location],
    queryFn: () => scholarshipsApi.list({
      search:   search || undefined,
      category: category !== 'all' ? category : undefined,
      location: location !== 'all' ? location : undefined,
      limit: 48,
    }),
    staleTime: 60_000,
  });
  const listData   = (listRes as any)?.data;
  const scholarships = listData?.scholarships ?? [];
  const listSaved    = new Set<string>(listData?.savedIds ?? []);

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-6xl mx-auto">
      {/* ── Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-h1 text-foreground flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-merit-blue-600" />
            Scholarships
          </h1>
          <p className="text-small text-muted-foreground mt-1">
            Discover scholarships matched to your volunteer history.
          </p>
        </div>
        <Link
          href="/saved"
          className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground border border-border rounded-lg px-3 py-2 hover:text-foreground hover:bg-muted transition-colors"
        >
          <Bookmark className="w-4 h-4" />
          Saved
        </Link>
      </div>

      {/* ── Section 1: For You */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-merit-blue-600" />
          <h2 className="text-h2 text-foreground">Scholarships for you</h2>
        </div>

        {matchedCats.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <p className="text-small text-muted-foreground">Based on your</p>
            {matchedCats.map((c: string) => <CategoryPill key={c} cat={c} />)}
            <p className="text-small text-muted-foreground">volunteer work</p>
          </div>
        )}
        {matchedCats.length === 0 && !forMeLoading && (
          <p className="text-small text-muted-foreground mb-4">
            {recommended.length > 0
              ? 'Featured scholarships — log volunteer sessions to get personalized matches.'
              : 'Log volunteer sessions at organizations to get personalized scholarship recommendations.'}
          </p>
        )}

        {forMeLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : recommended.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-foreground mb-1">No recommendations yet</p>
            <p className="text-small text-muted-foreground mb-4">
              Log volunteer hours at organizations to get matched scholarships.
            </p>
            <Link
              href="/log"
              className="inline-flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Log your first session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((s: any) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                isSaved={forMeSaved.has(s.id)}
                invalidateKey={['scholarships-for-me']}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Section 2: Discover */}
      <section>
        <h2 className="text-h2 text-foreground mb-4">Discover all scholarships</h2>

        {/* Search + location */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholarships..."
              className="w-full bg-card border border-border text-foreground rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-merit-blue-400 transition-colors"
            />
          </div>
          {/* Location toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
            {(['all', 'BC', 'Canada'] as Location[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                  location === loc ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {loc === 'all' ? 'Everywhere' : loc}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors border',
                category === key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results */}
        {listLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : scholarships.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-14 text-center">
            <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-foreground mb-1">No scholarships found</p>
            <p className="text-small text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scholarships.map((s: any) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                isSaved={listSaved.has(s.id)}
                invalidateKey={['scholarships-list', search, category, location]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
