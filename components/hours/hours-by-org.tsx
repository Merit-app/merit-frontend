'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Send, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatusBadge } from './status-badge';
import { useMeritStore } from '@/lib/store';
import { sessionsApi, ApiError } from '@/lib/api';
import { formatSessionDate, cn } from '@/lib/utils';
import type { Session } from '@/lib/types';

// ── Bucket predicates ─────────────────────────────────────────────────────────
// "Not sent yet" and "Awaiting reply" are both stored as status==='pending';
// verificationSent splits them. Self-tracked is status==='verified' + flag.
function isNotSent(s: Session) {
  return s.status === 'pending' && s.verificationSent === false && !s.selfReported;
}

function round1(n: number) { return Math.round(n * 10) / 10; }
function hrs(n: number) { const r = round1(n); return r % 1 === 0 ? String(r) : r.toFixed(1); }

function recipientSummary(items: Session[]): string {
  const byName = new Map<string, number>();
  for (const s of items) {
    const name = s.supervisor?.trim() || 'their supervisor';
    byName.set(name, (byName.get(name) ?? 0) + 1);
  }
  return [...byName.entries()].map(([name, n]) => (n > 1 ? `${name} (${n})` : name)).join(', ');
}

interface OrgGroup {
  key: string;
  name: string;
  sessions: Session[];
  verifiedHours: number;
  awaitingHours: number;
  notSentHours: number;
  selfTrackedHours: number;
  disputedHours: number;
  totalHours: number;
  notSent: Session[];
}

export function HoursByOrg({
  sessions,
  onOpenSession,
}: {
  sessions: Session[];
  onOpenSession?: (s: Session) => void;
}) {
  const groups = useMemo<OrgGroup[]>(() => {
    const map = new Map<string, OrgGroup>();
    for (const s of sessions) {
      const key = s.orgSlug || s.org || 'unknown';
      let g = map.get(key);
      if (!g) {
        g = {
          key,
          name: s.org || 'Unknown organization',
          sessions: [],
          verifiedHours: 0, awaitingHours: 0, notSentHours: 0,
          selfTrackedHours: 0, disputedHours: 0, totalHours: 0,
          notSent: [],
        };
        map.set(key, g);
      }
      g.sessions.push(s);
      g.totalHours += s.hours;
      if (s.selfReported) g.selfTrackedHours += s.hours;
      else if (s.status === 'verified') g.verifiedHours += s.hours;
      else if (s.status === 'disputed') g.disputedHours += s.hours;
      else if (isNotSent(s)) { g.notSentHours += s.hours; g.notSent.push(s); }
      else g.awaitingHours += s.hours; // pending + already sent
    }
    const arr = [...map.values()];
    for (const g of arr) g.sessions.sort((a, b) => b.date.localeCompare(a.date));
    // Float orgs that need action (have not-sent rows) to the top, then by hours.
    arr.sort(
      (a, b) =>
        (b.notSent.length > 0 ? 1 : 0) - (a.notSent.length > 0 ? 1 : 0) ||
        b.totalHours - a.totalHours ||
        a.name.localeCompare(b.name),
    );
    return arr;
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Building2 size={32} className="text-muted-foreground mb-3" />
        <p className="text-[15px] font-semibold text-foreground mb-1">No hours yet</p>
        <p className="text-small text-muted-foreground mb-4">
          Log your first session and your organizations will appear here.
        </p>
        <Link
          href="/log"
          className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Log a session
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <OrgCard key={g.key} group={g} onOpenSession={onOpenSession} />
      ))}
    </div>
  );
}

// ── One organization ──────────────────────────────────────────────────────────

function OrgCard({ group, onOpenSession }: { group: OrgGroup; onOpenSession?: (s: Session) => void }) {
  const updateSession = useMeritStore((s) => s.updateSession);
  const [open, setOpen] = useState(group.notSent.length > 0); // auto-open actionable orgs
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSend, setPendingSend] = useState<Session[]>([]);

  const notSentIds = group.notSent.map((s) => s.id);
  const allNotSentSelected = notSentIds.length > 0 && notSentIds.every((id) => selected.has(id));
  const selectedNotSent = group.notSent.filter((s) => selected.has(s.id));

  function toggleSelectAll() {
    setSelected(allNotSentSelected ? new Set() : new Set(notSentIds));
  }
  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function askSend(items: Session[]) {
    if (items.length === 0) return;
    setPendingSend(items);
    setConfirmOpen(true);
  }

  async function doSend() {
    const items = pendingSend;
    try {
      const res = await sessionsApi.sendVerifications({ sessionIds: items.map((s) => s.id) });
      const sent = res.data.sent;
      if (sent > 0) {
        items.forEach((s) => updateSession(s.id, { verificationSent: true }));
        setSelected(new Set());
        toast.success(`${sent} verification ${sent === 1 ? 'request' : 'requests'} sent.`);
      } else {
        toast.error('Nothing was sent — check the supervisor contact details.');
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message || 'Failed to send. Try again.' : 'Could not reach the server.',
      );
      throw err; // keep the dialog open so they can retry
    }
  }

  const anyEmailOnly = pendingSend.some((s) => !s.supervisorPhone && s.supervisorEmail);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-background transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-foreground truncate">{group.name}</p>
            {group.notSent.length > 0 && (
              <span className="shrink-0 text-[10px] font-semibold text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-500/15 px-1.5 py-0.5 rounded-full">
                {group.notSent.length} not sent
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span><b className="text-foreground tabular-nums">{hrs(group.totalHours)}</b> hrs total</span>
            {group.verifiedHours > 0 && <span className="text-success">{hrs(group.verifiedHours)} verified</span>}
            {group.awaitingHours > 0 && <span className="text-warning">{hrs(group.awaitingHours)} awaiting</span>}
            {group.notSentHours > 0 && <span className="text-slate-500 dark:text-slate-400">{hrs(group.notSentHours)} not sent</span>}
            {group.selfTrackedHours > 0 && <span className="text-amber-600 dark:text-amber-400">{hrs(group.selfTrackedHours)} self-tracked</span>}
            {group.disputedHours > 0 && <span className="text-danger">{hrs(group.disputedHours)} disputed</span>}
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Not-sent action bar */}
          {group.notSent.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-500/5 border-b border-border">
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allNotSentSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border accent-merit-blue-600 cursor-pointer"
                />
                Select all not sent
              </label>
              <div className="flex-1" />
              {selectedNotSent.length > 0 && (
                <button
                  onClick={() => askSend(selectedNotSent)}
                  className="text-[12px] font-medium text-foreground border border-border hover:bg-card px-3 py-1.5 rounded-lg transition-colors"
                >
                  Send selected ({selectedNotSent.length})
                </button>
              )}
              <button
                onClick={() => askSend(group.notSent)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Send size={13} />
                Send all not sent ({group.notSent.length})
              </button>
            </div>
          )}

          {/* Session rows */}
          <div>
            {group.sessions.map((s) => {
              const selectable = isNotSent(s);
              const checked = selected.has(s.id);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-background transition-colors"
                >
                  <div className="w-4 shrink-0 flex items-center justify-center">
                    {selectable && (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRow(s.id)}
                        aria-label={`Select ${formatSessionDate(s.date)} session`}
                        className="h-4 w-4 rounded border-border accent-merit-blue-600 cursor-pointer"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSession?.(s)}
                    className="flex-1 min-w-0 flex items-center gap-3 text-left"
                  >
                    <span className="text-[12px] text-muted-foreground tabular-nums w-14 shrink-0">{formatSessionDate(s.date)}</span>
                    <span className="text-[12px] text-foreground truncate flex-1">{s.activity || '—'}</span>
                    <span className="text-[12px] font-medium text-foreground tabular-nums shrink-0">{hrs(s.hours)} hrs</span>
                    <StatusBadge status={s.status} selfReported={s.selfReported} verificationSent={s.verificationSent} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Send ${pendingSend.length} verification ${pendingSend.length === 1 ? 'request' : 'requests'}?`}
        description={
          <>
            We&apos;ll text{anyEmailOnly ? ' or email' : ''} {recipientSummary(pendingSend)} asking them to confirm these hours.
            {' '}Self-tracked hours are never included.
          </>
        }
        confirmLabel="Send"
        onConfirm={doSend}
      />
    </div>
  );
}
