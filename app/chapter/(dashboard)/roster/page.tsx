'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { chapterApi, adminApi, ApiError, type RosterStudent, type RosterImportRow, type RosterImportResult } from '@/lib/api';
import { Search, Upload, ChevronRight, CheckCircle2, AlertTriangle, X, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'incomplete', label: 'In progress' },
  { key: 'at_risk', label: 'At risk' },
  { key: 'met', label: 'Completed' },
] as const;

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  met: { label: 'Met', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  on_track: { label: 'On track', cls: 'bg-merit-blue-50 text-merit-blue-700 dark:bg-merit-blue-900/30 dark:text-merit-blue-300' },
  at_risk: { label: 'At risk', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  no_goal: { label: 'No goal', cls: 'bg-muted text-muted-foreground' },
};

export default function RosterPage() {
  const [students, setStudents] = useState<RosterStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [showImport, setShowImport] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chapterApi.getRoster({ search, filter });
      setStudents(res.data.students);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground">{total} in your chapter</p>
        </div>
        <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-merit-blue-700">
          <Upload className="h-4 w-4" /> Import roster
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-merit-blue-500 focus:outline-none focus:ring-1 focus:ring-merit-blue-500"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Grad</th>
              <th className="px-4 py-3 font-medium">Hours</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3.5">
                    <Skeleton className="mb-1.5 h-4 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-10" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-14" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td />
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={Users}
                    title={search || filter !== 'all' ? 'No students match' : 'No students yet'}
                    description={
                      search || filter !== 'all'
                        ? 'Try a different search or filter.'
                        : 'Import your roster to invite students — they pair automatically when they sign up with their school email.'
                    }
                  />
                </td>
              </tr>
            ) : students.map((s) => {
              const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.no_goal;
              return (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/chapter/students/${s.id}`} className="block">
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.graduationYear ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {s.verifiedHours}{s.goal > 0 && <span className="text-muted-foreground"> / {s.goal}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                      {s.status === 'met' && <CheckCircle2 className="h-3 w-3" />}
                      {(s.status === 'at_risk' || s.status === 'overdue') && <AlertTriangle className="h-3 w-3" />}
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/chapter/students/${s.id}`}><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} onDone={load} />}
    </div>
  );
}

// ── CSV import modal (reuses /admin/roster/import) ──
function parseCsv(text: string): { rows: RosterImportRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], errors: ['File is empty.'] };
  const split = (line: string) => line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = header.findIndex((h) => h.includes('name'));
  const emailIdx = header.findIndex((h) => h.includes('email'));
  const gradIdx = header.findIndex((h) => h.includes('grad') || h.includes('year') || h.includes('class'));
  const errors: string[] = [];
  if (emailIdx === -1) errors.push('No "email" column found.');
  if (nameIdx === -1) errors.push('No "name" column found.');
  if (errors.length) return { rows: [], errors };
  const rows: RosterImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const c = split(lines[i]);
    const email = (c[emailIdx] ?? '').trim();
    if (!email) continue;
    const grad = gradIdx >= 0 ? (c[gradIdx] ?? '').trim() : '';
    rows.push({ name: (c[nameIdx] ?? '').trim() || email.split('@')[0], email, graduationYear: /^\d{4}$/.test(grad) ? Number(grad) : null });
  }
  return { rows, errors };
}

function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [rows, setRows] = useState<RosterImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [result, setResult] = useState<RosterImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handle(text: string) {
    setResult(null); setError(null);
    const { rows, errors } = parseCsv(text);
    setRows(rows); setParseErrors(errors);
  }

  async function submit() {
    if (!rows.length) return;
    setBusy(true); setError(null);
    try {
      const res = await adminApi.importRoster(rows);
      setResult(res.data);
      setRows([]);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Import students</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          CSV with columns <code>name</code>, <code>email</code>, optional <code>graduation year</code>.
          Each student gets an invite and is auto-joined when they sign up.
        </p>
        <div className="mb-3 flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
            <Upload className="h-4 w-4" /> Choose file
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const r = new FileReader(); r.onload = () => handle(String(r.result ?? '')); r.readAsText(f);
            }} />
          </label>
          <span className="text-xs text-muted-foreground">or paste</span>
        </div>
        <textarea
          onChange={(e) => handle(e.target.value)}
          placeholder={'name,email,graduation year\nJane Doe,jane@school.org,2026'}
          className="h-28 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
        />
        {parseErrors.length > 0 && (
          <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-2.5 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
            {parseErrors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {result ? (
          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
            <p className="font-medium text-green-600 dark:text-green-400">Imported {result.created} student{result.created === 1 ? '' : 's'}.</p>
            {result.skippedExisting > 0 && <p className="text-muted-foreground">{result.skippedExisting} already a member or invited.</p>}
            {result.errors.length > 0 && <p className="text-amber-600 dark:text-amber-400">{result.errors.length} couldn’t be imported.</p>}
            <button onClick={onClose} className="mt-3 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background">Done</button>
          </div>
        ) : rows.length > 0 && (
          <button onClick={submit} disabled={busy} className="mt-4 w-full rounded-lg bg-merit-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60">
            {busy ? 'Importing…' : `Import ${rows.length} students`}
          </button>
        )}
      </div>
    </div>
  );
}
