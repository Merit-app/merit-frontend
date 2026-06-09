'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Building2, Plus, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscoverOrgCard } from '@/components/orgs/discover-org-card';
import { CreateOrgModal } from '@/components/orgs/create-org-modal';
import { ClaimOrgModal } from '@/components/orgs/claim-org-modal';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { orgsApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { DiscoverOrg, Session } from '@/lib/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

// ── Category pills ────────────────────────────────────────────────────────────

const STATIC_CATEGORIES = [
  'All',
  'Food & Hunger',
  'Education & Tutoring',
  'Environment & Nature',
  'Animal Welfare',
  'Health & Wellness',
  'Community & Social',
  'Youth & Children',
  'Arts & Culture',
  'Emergency & Crisis',
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function orgHours(orgId: string, sessions: Session[]) {
  return sessions
    .filter((s) => s.orgSlug === orgId && s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);
}

function orgLastDate(orgId: string, sessions: Session[]): string | null {
  const dates = sessions
    .filter((s) => s.orgSlug === orgId)
    .map((s) => s.date)
    .sort((a, b) => b.localeCompare(a));
  return dates[0] ?? null;
}

// ── Deterministic avatar color ────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100',   text: 'text-blue-700' },
  { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  { bg: 'bg-amber-100',  text: 'text-amber-700' },
  { bg: 'bg-rose-100',   text: 'text-rose-700' },
  { bg: 'bg-sky-100',    text: 'text-sky-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-teal-100',   text: 'text-teal-700' },
];

function getAvatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── My Org Card (horizontal scroll) ──────────────────────────────────────────

function MyOrgCard({ org, sessions }: { org: ReturnType<typeof useMeritStore.getState>['organizations'][0]; sessions: Session[] }) {
  const hours = orgHours(org.id, sessions);
  const lastDate = orgLastDate(org.id, sessions);
  const hoursStr = hours % 1 === 0 ? String(hours) : hours.toFixed(1);
  const lastRelative = lastDate
    ? formatDistanceToNow(parseISO(lastDate + 'T00:00:00'), { addSuffix: true })
    : null;
  const color = getAvatarColor(org.name);

  return (
    <Link
      href={`/organizations/${org.slug}`}
      className="min-w-[200px] rounded-xl border border-border bg-card p-4 flex flex-col gap-2 flex-shrink-0 hover:shadow-md transition-shadow duration-150"
    >
      {/* Avatar circle — deterministic color */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${color.bg} ${color.text}`}>
        {getInitials(org.name)}
      </div>

      {/* Name */}
      <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">{org.name}</p>

      {/* Stats */}
      <div className="mt-auto space-y-0.5">
        <p className="text-[12px] text-muted-foreground">
          <span className="font-semibold text-foreground">{hoursStr} hrs</span> logged
        </p>
        {lastRelative && (
          <p className="text-[11px] text-muted-foreground">Last visited {lastRelative}</p>
        )}
      </div>

      {/* Trust badge */}
      {org.registrationStatus === 'registered' && (
        <span className="inline-flex items-center text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full w-fit">
          Verified
        </span>
      )}
      {org.registrationStatus === 'institutional' && (
        <span className="inline-flex items-center text-[10px] font-medium text-merit-blue-700 bg-merit-blue-50 px-1.5 py-0.5 rounded-full w-fit">
          Partner
        </span>
      )}
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrganizationsPage() {
  const hydrated = useHydrationStore((s) => s.hydrated);
  const organizations = useMeritStore((s) => s.organizations);
  const sessions = useMeritStore((s) => s.sessions);
  const followedOrgIds = useMeritStore((s) => s.followedOrgIds);
  const toggleFollowOptimistic = useMeritStore((s) => s.toggleFollowOptimistic);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [claimOrgId, setClaimOrgId] = useState<string | null>(null);
  const [claimOrgName, setClaimOrgName] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [discoverOrgs, setDiscoverOrgs] = useState<DiscoverOrg[]>([]);
  const [followingOrgs, setFollowingOrgs] = useState<DiscoverOrg[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offsetRef = useRef(0);

  const hasFollows = followedOrgIds.length > 0;
  const categories = hasFollows ? [...STATIC_CATEGORIES, 'Following'] : STATIC_CATEGORIES;

  // ── Fetch discover ────────────────────────────────────────────────────────

  const fetchDiscover = useCallback(async (q: string, cat: string, reset: boolean) => {
    if (reset) {
      setDiscoverLoading(true);
      offsetRef.current = 0;
    }

    try {
      if (cat === 'Following') {
        const res = await orgsApi.following();
        const orgs: DiscoverOrg[] = (res.data ?? []).map((o: any) => ({ ...o, isFollowing: true }));
        setFollowingOrgs(orgs);
        setDiscoverOrgs(orgs);
        setHasMore(false);
        return;
      }

      const res = await orgsApi.discover({
        q: q || undefined,
        category: cat !== 'All' ? cat : undefined,
        limit: 30,
        offset: reset ? 0 : offsetRef.current,
      });
      const incoming: DiscoverOrg[] = res.data ?? [];

      if (reset) {
        setDiscoverOrgs(incoming);
      } else {
        setDiscoverOrgs((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          return [...prev, ...incoming.filter((o) => !existingIds.has(o.id))];
        });
      }

      offsetRef.current = (reset ? 0 : offsetRef.current) + incoming.length;
      setHasMore(incoming.length === 30);
    } catch {
      // non-fatal
    } finally {
      setDiscoverLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial + category change
  useEffect(() => {
    if (!hydrated) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchDiscover(query, category, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, category]);

  // Debounced search
  useEffect(() => {
    if (!hydrated) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDiscover(query, category, true);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchDiscover(query, category, false);
  };

  // ── Follow toggle ─────────────────────────────────────────────────────────

  const handleToggleFollow = useCallback(async (orgId: string) => {
    toggleFollowOptimistic(orgId);
    // Update discover list optimistically
    setDiscoverOrgs((prev) =>
      prev.map((o) => o.id === orgId ? { ...o, isFollowing: !o.isFollowing } : o)
    );
    try {
      await orgsApi.follow(orgId);
    } catch {
      // Revert on failure
      toggleFollowOptimistic(orgId);
      setDiscoverOrgs((prev) =>
        prev.map((o) => o.id === orgId ? { ...o, isFollowing: !o.isFollowing } : o)
      );
    }
  }, [toggleFollowOptimistic]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 py-6 md:px-8 space-y-8">

      {/* SECTION 1 — Your Organizations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-foreground">Your Organizations</h2>
          {organizations.length > 0 && (
            <span className="text-[12px] text-muted-foreground">{organizations.length} {organizations.length === 1 ? 'org' : 'orgs'}</span>
          )}
        </div>

        {!hydrated ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-48 h-36 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <div className="bg-card rounded-xl border border-border px-5 py-6 text-center">
            <Building2 size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">
              Your organizations will appear here once you log your first session.
            </p>
            <Link href="/log" className="mt-3 inline-block text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors">
              Log a session →
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {organizations.map((org) => (
              <MyOrgCard key={org.id} org={org} sessions={sessions} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2 — Discover */}
      <section>
        <h2 className="text-[16px] font-semibold text-foreground mb-4">Discover</h2>

        {/* Action cards — create or claim */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl border-2 border-dashed border-border hover:border-ink-400 transition-colors p-4 cursor-pointer group text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-[13px] text-foreground">Add your organization</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Don't see your org? Add it so students can log hours here.
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={() => {
              // Open claim flow by searching for an existing org
              // For now route to the discover feed — users can click Claim on org pages
              window.location.href = '#discover-grid';
            }}
            className="rounded-xl border-2 border-dashed border-border hover:border-ink-400 transition-colors p-4 cursor-pointer group text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-[13px] text-foreground">Manage your org's page</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Already in Merit? Find it below and click Claim.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4" id="discover-grid">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations..."
            className="pl-9 h-10 text-[13px]"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors',
                category === cat
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {discoverLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="h-20 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-1/2" />
                  <div className="h-2.5 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : discoverOrgs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Building2 size={32} className="text-muted-foreground mb-3" />
            <p className="text-[15px] font-semibold text-foreground mb-1">No organizations found</p>
            <p className="text-small text-muted-foreground">
              {query ? 'Try a different search term.' : 'Check back later as more organizations join Merit.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoverOrgs.map((org) => (
                <DiscoverOrgCard
                  key={org.id}
                  org={org}
                  isFollowing={followedOrgIds.includes(org.id)}
                  onToggleFollow={handleToggleFollow}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-lg border border-border text-[13px] font-medium text-foreground hover:bg-background transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modals */}
      <CreateOrgModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      {claimOrgId && (
        <ClaimOrgModal
          open={!!claimOrgId}
          onClose={() => { setClaimOrgId(null); setClaimOrgName(''); }}
          orgId={claimOrgId}
          orgName={claimOrgName}
        />
      )}
    </div>
  );
}
