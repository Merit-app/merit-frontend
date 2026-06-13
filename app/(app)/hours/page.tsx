'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, ChevronUp, ChevronDown, Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/hours/status-badge';
import { TierBadge } from '@/components/hours/tier-badge';
import { SessionDetailSheet } from '@/components/hours/session-detail-sheet';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useMeritStore } from '@/lib/store';
import { sessionsApi, ApiError } from '@/lib/api';
import { formatSessionDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Session, SessionStatus } from '@/lib/types';

type FilterTab = 'all' | SessionStatus;
type SortKey = 'date' | 'org' | 'hours' | 'status';
type SortDir = 'asc' | 'desc';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'verified', label: 'Verified' },
  { key: 'pending',  label: 'Pending' },
  { key: 'disputed', label: 'Disputed' },
];

const PREF_KEY = 'hours-list-prefs';

function loadPrefs(): { filter: FilterTab; sortKey: SortKey; sortDir: SortDir } {
  if (typeof window === 'undefined') return { filter: 'all', sortKey: 'date', sortDir: 'desc' };
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return { filter: 'all', sortKey: 'date', sortDir: 'desc' };
    return JSON.parse(raw);
  } catch {
    return { filter: 'all', sortKey: 'date', sortDir: 'desc' };
  }
}

export default function HoursPage() {
  const sessions = useMeritStore((s) => s.sessions);
  const deleteSession = useMeritStore((s) => s.deleteSession);
  const searchParams = useSearchParams();

  const prefs = useMemo(() => loadPrefs(), []);

  const [filter, setFilter] = useState<FilterTab>(prefs.filter);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>(prefs.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(prefs.sortDir);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Persist sort/filter prefs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PREF_KEY, JSON.stringify({ filter, sortKey, sortDir }));
  }, [filter, sortKey, sortDir]);

  // Open sheet from URL param
  useEffect(() => {
    const id = searchParams.get('session');
    if (id) {
      const found = sessions.find((s) => s.id === id);
      if (found) { setSelectedSession(found); setSheetOpen(true); }
    }
  }, [searchParams, sessions]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const filtered = useMemo(() => {
    let rows = sessions;
    if (filter !== 'all') rows = rows.filter((s) => s.status === filter);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.org.toLowerCase().includes(q) ||
          s.activity.toLowerCase().includes(q) ||
          s.supervisor.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      if (sortKey === 'org') cmp = a.org.localeCompare(b.org);
      if (sortKey === 'hours') cmp = a.hours - b.hours;
      if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [sessions, filter, query, sortKey, sortDir]);

  const allFilteredIds = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(allFilteredIds));
  }

  function toggleSelectRow(id: string, e: React.MouseEvent | React.ChangeEvent) {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    setBulkDeleting(true);
    const failed: string[] = [];
    await Promise.all(
      ids.map(async (id) => {
        try {
          await sessionsApi.delete(id);
          deleteSession(id);
        } catch (err) {
          failed.push(id);
          if (err instanceof ApiError) {
            console.error('Failed to delete session', id, err.message);
          }
        }
      })
    );
    setBulkDeleting(false);
    setSelected(new Set());
    if (failed.length === 0) {
      toast.success(`${ids.length} session${ids.length === 1 ? '' : 's'} deleted.`);
    } else {
      toast.error(`${failed.length} could not be deleted.`);
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} className="text-muted-foreground ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-muted-foreground ml-0.5" />
      : <ChevronDown size={12} className="text-muted-foreground ml-0.5" />;
  }

  return (
    <div className="px-4 py-4 md:px-8 md:py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                filter === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions..."
              className="pl-9 w-56 h-9 text-[13px]"
            />
          </div>
          <Link
            href="/log"
            className="flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Log session
          </Link>
        </div>
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-foreground px-4 py-2.5">
          <span className="text-[13px] text-background font-medium">{selected.size} selected</span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-[13px] text-background/70 hover:text-background transition-colors"
          >
            Deselect all
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={13} />
            {bulkDeleting ? 'Deleting...' : `Delete ${selected.size}`}
          </button>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Clock size={32} className="text-muted-foreground mb-3" />
          <p className="text-[15px] font-semibold text-foreground mb-1">No sessions found.</p>
          <p className="text-small text-muted-foreground mb-4">
            {query || filter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Your verified sessions will appear here once logged.'}
          </p>
          <Link
            href="/log"
            className="flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Log first session
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <div className="min-w-[820px]">
            {/* Header */}
            <div className="grid grid-cols-[32px_120px_1fr_1fr_80px_140px_100px_40px] gap-3 px-4 py-2.5 border-b border-border bg-background items-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                aria-label="Select all sessions"
                className="h-4 w-4 rounded border-border accent-merit-blue-600 cursor-pointer"
              />
              {(
                [
                  { key: 'date',   label: 'Date' },
                  { key: 'org',    label: 'Organization' },
                  { label: 'Activity', noSort: true },
                  { key: 'hours',  label: 'Hours' },
                  { label: 'Tier', noSort: true },
                  { key: 'status', label: 'Status' },
                  { label: '',     noSort: true },
                ] as { key?: SortKey; label: string; noSort?: boolean }[]
              ).map(({ key, label, noSort }) => (
                <button
                  key={label || 'actions'}
                  type="button"
                  onClick={() => key && toggleSort(key)}
                  disabled={noSort}
                  className={cn(
                    'flex items-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-left',
                    !noSort && 'hover:text-foreground cursor-pointer',
                    noSort && 'cursor-default'
                  )}
                >
                  {label}
                  {key && <SortIcon col={key} />}
                </button>
              ))}
            </div>

            {/* Rows — plain div with onClick; checkbox stops propagation */}
            {filtered.map((session) => {
              const hoursStr = session.hours % 1 === 0 ? `${session.hours}` : session.hours.toFixed(1);
              const isSelected = selected.has(session.id);
              return (
                <div
                  key={session.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setSelectedSession(session); setSheetOpen(true); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedSession(session);
                      setSheetOpen(true);
                    }
                  }}
                  className={cn(
                    'grid grid-cols-[32px_120px_1fr_1fr_80px_140px_100px_40px] gap-3 px-4 py-3.5',
                    'border-b border-border last:border-0 items-center',
                    'transition-colors duration-100 cursor-pointer focus-visible:outline-none',
                    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-merit-blue-400',
                    isSelected ? 'bg-merit-blue-50' : 'hover:bg-background'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleSelectRow(session.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select session at ${session.org}`}
                    className="h-4 w-4 rounded border-border accent-merit-blue-600 cursor-pointer"
                  />
                  <span className="text-[13px] text-muted-foreground tabular-nums">{formatSessionDate(session.date)}</span>
                  <span className="text-[13px] font-medium text-foreground truncate">{session.org}</span>
                  <span className="text-[12px] text-muted-foreground truncate">{session.activity}</span>
                  <span className="text-[13px] font-medium text-foreground tabular-nums">{hoursStr} hrs</span>
                  <TierBadge tier={session.tier} />
                  <StatusBadge status={session.status} selfReported={session.selfReported} />
                  <span className="text-muted-foreground text-[18px] leading-none select-none">›</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SessionDetailSheet
        session={selectedSession}
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelectedSession(null); }}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Delete ${selected.size} session${selected.size === 1 ? '' : 's'}?`}
        description="This permanently removes the selected sessions and can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
