'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  chapterApi, ApiError,
  type MyAssignment, type MyAssignmentDetail, type SubmissionStatus, type UploadFile,
} from '@/lib/api';
import {
  ClipboardList, ArrowLeft, Upload, X, FileText, Download, CheckCircle2,
  Clock, AlertTriangle, Paperclip, Trash2, CalendarDays,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';

const STATUS: Record<SubmissionStatus | 'none', { label: string; cls: string }> = {
  none: { label: 'Not submitted', cls: 'bg-muted text-muted-foreground' },
  submitted: { label: 'Submitted', cls: 'bg-merit-blue-50 text-merit-blue-700 dark:bg-merit-blue-900/30 dark:text-merit-blue-300' },
  reviewed: { label: 'Reviewed', cls: 'bg-merit-blue-50 text-merit-blue-700 dark:bg-merit-blue-900/30 dark:text-merit-blue-300' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  returned: { label: 'Returned — resubmit', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

const MAX_FILES = 10;
const MAX_FILE_MB = 10;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(file);
  });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyAssignmentsPage() {
  const [items, setItems] = useState<MyAssignment[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(() => {
    chapterApi.myAssignments().then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-2">
      <div>
        <Link href="/my-chapter" className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> My Chapter
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Assignments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tasks from your coordinator. Attach your files and submit.</p>
      </div>

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border">
          <EmptyState icon={ClipboardList} title="No assignments yet" description="When your coordinator posts an assignment, it'll show up here." />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const st = STATUS[a.submission?.status ?? 'none'];
            const overdue = a.dueDate && new Date(a.dueDate) < new Date() && a.submission?.status !== 'approved';
            return (
              <button
                key={a.id}
                onClick={() => setOpenId(a.id)}
                className="block w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-merit-blue-300 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{a.title}</p>
                    {a.instructions && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.instructions}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {a.dueDate && (
                    <span className={`inline-flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                      <CalendarDays className="h-3.5 w-3.5" /> Due {fmtDate(a.dueDate)}{overdue ? ' · overdue' : ''}
                    </span>
                  )}
                  {a.submission && (
                    <span className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" /> {a.submission.fileCount} file{a.submission.fileCount === 1 ? '' : 's'}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {openId && (
        <SubmitModal
          assignmentId={openId}
          onClose={() => setOpenId(null)}
          onSubmitted={() => { setOpenId(null); load(); }}
        />
      )}
    </div>
  );
}

function SubmitModal({ assignmentId, onClose, onSubmitted }: { assignmentId: string; onClose: () => void; onSubmitted: () => void }) {
  const [detail, setDetail] = useState<MyAssignmentDetail | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chapterApi.myAssignment(assignmentId).then((r) => setDetail(r.data)).catch(() => setError('Could not load this assignment.'));
  }, [assignmentId]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const incoming = Array.from(list);
    const tooBig = incoming.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) { setError(`"${tooBig.name}" is larger than ${MAX_FILE_MB} MB.`); return; }
    setFiles((prev) => [...prev, ...incoming].slice(0, MAX_FILES));
  }

  async function submit() {
    if (files.length === 0) { setError('Attach at least one file.'); return; }
    setBusy(true); setError(null);
    try {
      const encoded: UploadFile[] = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          contentType: f.type || 'application/octet-stream',
          dataBase64: await fileToBase64(f),
        })),
      );
      await chapterApi.submitAssignment(assignmentId, { note: note.trim() || undefined, files: encoded });
      toast.success('Submission sent');
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Submission failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const existing = detail?.submission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">{detail?.assignment.title ?? 'Assignment'}</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        {!detail ? (
          <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-20 w-full" /></div>
        ) : (
          <>
            {detail.assignment.instructions && (
              <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">{detail.assignment.instructions}</p>
            )}
            {detail.assignment.dueDate && (
              <p className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Due {fmtDate(detail.assignment.dueDate)}
              </p>
            )}

            {/* Existing submission */}
            {existing && (
              <div className="mb-4 rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center gap-2 text-sm">
                  {existing.status === 'approved'
                    ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                    : existing.status === 'returned'
                      ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                      : <Clock className="h-4 w-4 text-merit-blue-600" />}
                  <span className="font-medium text-foreground">{STATUS[existing.status].label}</span>
                  <span className="text-xs text-muted-foreground">· submitted {fmtDate(existing.submittedAt)}</span>
                </div>
                <ul className="space-y-1">
                  {existing.files.map((f) => (
                    <li key={f.id}>
                      <a href={f.url ?? '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-merit-blue-600 hover:underline">
                        <FileText className="h-3.5 w-3.5" /> {f.name} <Download className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">Submitting again replaces these files.</p>
              </div>
            )}

            {/* New files picker */}
            <label className="mb-1 block text-sm font-medium text-foreground">{existing ? 'Replace with new files' : 'Attach files'}</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-6 text-sm text-muted-foreground hover:border-merit-blue-400 hover:text-foreground">
              <Upload className="h-4 w-4" /> Choose files (PDF, docs, images — up to {MAX_FILE_MB} MB each)
              <input type="file" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>

            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-foreground">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{f.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    </span>
                    <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for your coordinator (optional)"
              className="mt-3 h-20 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-merit-blue-500 focus:outline-none"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <button
              onClick={submit}
              disabled={busy || files.length === 0}
              className="mt-4 w-full rounded-lg bg-merit-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60"
            >
              {busy ? 'Submitting…' : existing ? 'Resubmit' : 'Submit'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
