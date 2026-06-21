'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  chapterApi, ApiError,
  type ChapterAssignmentSummary, type AssignmentDetail, type SubmissionStatus,
} from '@/lib/api';
import {
  ClipboardList, Plus, X, CalendarDays, FileText, Download, CheckCircle2,
  RotateCcw, Trash2, Clock, AlertTriangle, Users,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

const STATUS: Record<SubmissionStatus, { label: string; cls: string }> = {
  submitted: { label: 'Submitted', cls: 'bg-merit-blue-50 text-merit-blue-700 dark:bg-merit-blue-900/30 dark:text-merit-blue-300' },
  reviewed: { label: 'Reviewed', cls: 'bg-merit-blue-50 text-merit-blue-700 dark:bg-merit-blue-900/30 dark:text-merit-blue-300' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  returned: { label: 'Returned', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChapterAssignmentsPage() {
  const [items, setItems] = useState<ChapterAssignmentSummary[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(() => {
    chapterApi.listAssignments().then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Assignments</h1>
          <p className="text-sm text-muted-foreground">Post tasks for your students and collect their submissions.</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-merit-blue-700">
          <Plus className="h-4 w-4" /> New assignment
        </button>
      </div>

      {items === null ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border">
          <EmptyState icon={ClipboardList} title="No assignments yet" description="Create one to give your students a task — they'll upload their files and you'll review them here." />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const overdue = a.dueDate && new Date(a.dueDate) < new Date();
            return (
              <button key={a.id} onClick={() => setOpenId(a.id)} className="block w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-merit-blue-300 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{a.title}</p>
                    {a.instructions && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{a.instructions}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {a.dueDate && <span className={`inline-flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400' : ''}`}><CalendarDays className="h-3.5 w-3.5" /> Due {fmtDate(a.dueDate)}</span>}
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {a.submissionCount}/{a.studentCount} submitted</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="tabular-nums text-lg font-semibold text-foreground">{a.submissionCount}</span>
                    <p className="text-xs text-muted-foreground">submission{a.submissionCount === 1 ? '' : 's'}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {creating && <CreateModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
      {openId && <DetailModal assignmentId={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (title.trim().length < 2) { setError('Give the assignment a title.'); return; }
    setBusy(true); setError(null);
    try {
      await chapterApi.createAssignment({ title: title.trim(), instructions: instructions.trim() || undefined, dueDate: dueDate || null });
      toast.success('Assignment posted — students notified');
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the assignment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">New assignment</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Work experience reflection (Teams for WEX)"
          className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-merit-blue-500 focus:outline-none" />
        <label className="mb-1 block text-sm font-medium text-foreground">Instructions <span className="text-muted-foreground">(optional)</span></label>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What should students do and submit?"
          className="mb-3 h-28 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-merit-blue-500 focus:outline-none" />
        <label className="mb-1 block text-sm font-medium text-foreground">Due date <span className="text-muted-foreground">(optional)</span></label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-merit-blue-500 focus:outline-none" />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button onClick={create} disabled={busy} className="mt-4 w-full rounded-lg bg-merit-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60">
          {busy ? 'Posting…' : 'Post assignment'}
        </button>
      </div>
    </div>
  );
}

function DetailModal({ assignmentId, onClose, onChanged }: { assignmentId: string; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<AssignmentDetail | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    chapterApi.getAssignmentDetail(assignmentId).then((r) => setDetail(r.data)).catch(() => onClose());
  }, [assignmentId, onClose]);
  useEffect(() => { load(); }, [load]);

  async function review(submissionId: string, status: SubmissionStatus) {
    setBusyId(submissionId);
    try {
      await chapterApi.reviewSubmission(submissionId, status);
      load();
      onChanged();
    } catch {
      toast.error('Could not update');
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    try {
      await chapterApi.deleteAssignment(assignmentId);
      toast.success('Assignment deleted');
      onChanged();
      onClose();
    } catch {
      toast.error('Could not delete');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        {!detail ? (
          <div className="space-y-3"><Skeleton className="h-6 w-48" /><Skeleton className="h-24 w-full" /></div>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{detail.assignment.title}</h2>
                {detail.assignment.dueDate && <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Due {fmtDate(detail.assignment.dueDate)}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setConfirmDelete(true)} aria-label="Delete assignment" className="text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
            </div>

            {detail.assignment.instructions && <p className="mb-4 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{detail.assignment.instructions}</p>}

            <h3 className="mb-2 text-sm font-semibold text-foreground">Submissions ({detail.submissions.length})</h3>
            {detail.submissions.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <ul className="space-y-3">
                {detail.submissions.map((s) => (
                  <li key={s.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{s.student.name}</p>
                        <p className="text-xs text-muted-foreground">{s.student.email}{s.student.graduationYear ? ` · ${s.student.graduationYear}` : ''} · submitted {fmtDate(s.submittedAt)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span>
                    </div>

                    {s.note && <p className="mt-2 text-sm text-muted-foreground">“{s.note}”</p>}

                    <ul className="mt-2 flex flex-wrap gap-2">
                      {s.files.map((f) => (
                        <li key={f.id}>
                          <a href={f.url ?? '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-merit-blue-300 hover:text-merit-blue-700">
                            <FileText className="h-3.5 w-3.5" /> <span className="max-w-[180px] truncate">{f.name}</span> <Download className="h-3 w-3 text-muted-foreground" />
                          </a>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => review(s.id, 'approved')} disabled={busyId === s.id || s.status === 'approved'}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => review(s.id, 'returned')} disabled={busyId === s.id || s.status === 'returned'}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
                        <RotateCcw className="h-3.5 w-3.5" /> Return for resubmit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {detail.notSubmitted.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Hasn&apos;t submitted ({detail.notSubmitted.length})
                </h3>
                <p className="text-sm text-muted-foreground">{detail.notSubmitted.map((u) => u.name).join(', ')}</p>
              </div>
            )}
          </>
        )}

        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Delete this assignment?"
          description="This removes the assignment and all student submissions and files. This can't be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={remove}
        />
      </div>
    </div>
  );
}
