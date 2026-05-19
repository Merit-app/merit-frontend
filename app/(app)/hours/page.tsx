'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/hours/status-badge';
import { TierBadge } from '@/components/hours/tier-badge';
import { SessionDetailSheet } from '@/components/hours/session-detail-sheet';
import { useMeritStore } from '@/lib/store';
import { formatSessionDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
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

export default function HoursPage() {
  const sessions = useMeritStore((s) => s.sessions);
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Open sheet from URL param (e.g. from dashboard recent sessions)
  useEffect(() => {
    const id = searchParams.get('session');
    if (id) {
      const found = sessions.find((s) => s.id === id);
      if (found) { setSelectedSession(found); setSheetOpen(true); }
    }
  }, [searchParams, sessions]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const filtered = useMemo(() => {
    let rows = sessions;
    if (filter !== 'all') rows = rows.filter((s) => s.status === filter);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (s) => s.org.toLowerCase().includes(q) || s.activity.toLowerCase().includes(q) || s.supervisor.toLowerCase().includes(q)
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

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} className="text-ink-300 ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-ink-600 ml-0.5" />
      : <ChevronDown size={12} className="text-ink-600 ml-0.5" />;
  }

  return (
    <div className="px-4 py-4 md:px-8 md:py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        {/* Filter chips */}
        <div className="flex items-center gap-1 bg-ink-100 p-1 rounded-lg">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                filter === key
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions..."
              className="pl-9 w-56 h-9 text-[13px]"
            />
          </div>
          {/* Log new */}
          <Link
            href="/log"
            className="flex items-center gap-1.5 bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Log session
          </Link>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Clock size={32} className="text-ink-300 mb-3" />
          <p className="text-[15px] font-semibold text-ink-900 mb-1">No sessions found.</p>
          <p className="text-small text-ink-500 mb-4">
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
        <div className="bg-white rounded-xl border border-ink-200 overflow-x-auto">
          {/* min-w wrapper ensures header and rows share the same width context */}
          <div className="min-w-[780px]">
            {/* Header row */}
            <div className="grid grid-cols-[120px_1fr_1fr_80px_140px_100px_40px] gap-3 px-4 py-2.5 border-b border-ink-200 bg-ink-50">
              {([
                { key: 'date',   label: 'Date' },
                { key: 'org',    label: 'Organization' },
                { label: 'Activity', noSort: true },
                { key: 'hours',  label: 'Hours' },
                { label: 'Tier', noSort: true },
                { key: 'status', label: 'Status' },
                { label: '',     noSort: true },
              ] as { key?: SortKey; label: string; noSort?: boolean }[]).map(({ key, label, noSort }) => (
                <button
                  key={label || 'actions'}
                  type="button"
                  onClick={() => key && toggleSort(key)}
                  disabled={noSort}
                  className={cn(
                    'flex items-center text-[11px] font-semibold uppercase tracking-wide text-ink-500 text-left',
                    !noSort && 'hover:text-ink-700 cursor-pointer',
                    noSort && 'cursor-default'
                  )}
                >
                  {label}
                  {key && <SortIcon col={key} />}
                </button>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((session) => {
              const hoursStr = session.hours % 1 === 0 ? `${session.hours}` : session.hours.toFixed(1);
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => { setSelectedSession(session); setSheetOpen(true); }}
                  className="w-full grid grid-cols-[120px_1fr_1fr_80px_140px_100px_40px] gap-3 px-4 py-3.5 border-b border-ink-100 last:border-0 hover:bg-ink-50 transition-colors duration-100 text-left items-center cursor-pointer"
                >
                  <span className="text-[13px] text-ink-500 tabular-nums">{formatSessionDate(session.date)}</span>
                  <span className="text-[13px] font-medium text-ink-900 truncate">{session.org}</span>
                  <span className="text-[12px] text-ink-500 truncate">{session.activity}</span>
                  <span className="text-[13px] font-medium text-ink-900 tabular-nums">{hoursStr} hrs</span>
                  <span><TierBadge tier={session.tier} /></span>
                  <span><StatusBadge status={session.status} /></span>
                  <span className="text-ink-300 text-[18px] leading-none select-none">›</span>
                </button>
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
    </div>
  );
}
