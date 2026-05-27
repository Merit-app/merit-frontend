'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Trash2, RefreshCw, Pencil, X, Link2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from './status-badge';
import { TierBadge } from './tier-badge';
import { useMeritStore } from '@/lib/store';
import { sessionsApi, mapSession, ApiError } from '@/lib/api';
import { formatLongDate, formatRelativeTime, formatPhone } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Session } from '@/lib/types';

interface Props {
  session: Session | null;
  open: boolean;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-ink-100 last:border-0">
      <span className="text-[12px] font-medium text-ink-500 shrink-0 w-36">{label}</span>
      <span className="text-[13px] text-ink-900 text-right">{value}</span>
    </div>
  );
}

const editSchema = z.object({
  activity: z.string().min(3, 'Describe the activity').max(500),
  supervisorName: z.string().min(2, 'Enter supervisor name').max(100),
  supervisorPhone: z.string().optional(),
  supervisorEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
});

type EditFormData = z.infer<typeof editSchema>;

function EditForm({
  session,
  onSaved,
  onCancel,
}: {
  session: Session;
  onSaved: (updated: Session) => void;
  onCancel: () => void;
}) {
  const updateSession = useMeritStore((s) => s.updateSession);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      activity: session.activity,
      supervisorName: session.supervisor,
      supervisorPhone: session.supervisorPhone ?? '',
      supervisorEmail: session.supervisorEmail ?? '',
    },
  });

  async function onSubmit(data: EditFormData) {
    setSaving(true);
    try {
      const raw = await sessionsApi.update(session.id, {
        activity: data.activity,
        supervisorName: data.supervisorName,
        supervisorPhone: data.supervisorPhone || undefined,
        supervisorEmail: data.supervisorEmail || undefined,
      });
      const updated = mapSession(raw.data);
      updateSession(session.id, updated);
      toast.success('Session updated.');
      onSaved(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to update. Try again.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Read-only info */}
        <div className="flex items-center gap-3 rounded-lg bg-ink-50 px-4 py-3 text-[13px]">
          <span className="text-ink-500 w-24 shrink-0">Date</span>
          <span className="text-ink-700">{formatLongDate(session.date)}</span>
          <span className="text-ink-500 ml-auto">{session.hours % 1 === 0 ? session.hours : session.hours.toFixed(1)} hrs</span>
        </div>

        {/* Activity */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Activity description</Label>
          <Textarea
            {...register('activity')}
            rows={3}
            maxLength={500}
            className={cn('resize-none', errors.activity && 'border-danger')}
          />
          {errors.activity && <p className="text-[12px] text-danger">{errors.activity.message}</p>}
        </div>

        {/* Supervisor name */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Supervisor name</Label>
          <Input
            {...register('supervisorName')}
            className={cn(errors.supervisorName && 'border-danger')}
          />
          {errors.supervisorName && <p className="text-[12px] text-danger">{errors.supervisorName.message}</p>}
        </div>

        {/* Supervisor phone */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Supervisor phone</Label>
          <Input type="tel" placeholder="+16045550100" {...register('supervisorPhone')} />
        </div>

        {/* Supervisor email */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Supervisor email</Label>
          <Input
            type="email"
            placeholder="supervisor@org.ca"
            {...register('supervisorEmail')}
            className={cn(errors.supervisorEmail && 'border-danger')}
          />
          {errors.supervisorEmail && <p className="text-[12px] text-danger">{errors.supervisorEmail.message}</p>}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-ink-200 flex items-center gap-3">
        <Button
          type="submit"
          disabled={saving || !isDirty}
          className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium text-[13px]"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-ink-600 text-[13px]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function SessionDetailSheet({ session, open, onClose }: Props) {
  const deleteSession = useMeritStore((s) => s.deleteSession);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [currentSession, setCurrentSession] = useState<Session | null>(session);
  const [deleting, setDeleting] = useState(false);
  const [resending, setResending] = useState(false);

  // Keep currentSession in sync when prop changes
  if (session && session !== currentSession && mode === 'view') {
    setCurrentSession(session);
  }

  if (!session) return null;
  const s = currentSession ?? session;

  async function handleResend() {
    setResending(true);
    try {
      await sessionsApi.resend(s.id);
      toast.success(`Verification re-sent to ${s.supervisor}.`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to resend. Try again.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setResending(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete this session at ${s.org}? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await sessionsApi.delete(s.id);
      deleteSession(s.id);
      toast.success('Session deleted.');
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to delete. Try again.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleClose() {
    setMode('view');
    onClose();
  }

  const hoursStr = s.hours % 1 === 0 ? `${s.hours}` : s.hours.toFixed(1);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-ink-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <SheetTitle className="text-h2 text-ink-900 truncate">{s.org}</SheetTitle>
              <SheetDescription className="text-small text-ink-500">
                {formatLongDate(s.date)}
              </SheetDescription>
            </div>
            {mode === 'view' && s.status !== 'verified' && (
              <button
                onClick={() => setMode('edit')}
                className="flex items-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900 border border-ink-200 hover:border-ink-300 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
            {mode === 'edit' && (
              <button
                onClick={() => setMode('view')}
                aria-label="Cancel editing"
                className="text-ink-400 hover:text-ink-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </SheetHeader>

        {mode === 'edit' ? (
          <EditForm
            session={s}
            onSaved={(updated) => { setCurrentSession(updated); setMode('view'); }}
            onCancel={() => setMode('view')}
          />
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <Row label="Date" value={formatLongDate(s.date)} />
              <Row label="Hours" value={`${hoursStr} hrs`} />
              <Row label="Activity" value={s.activity} />
              <Row label="Status" value={<StatusBadge status={s.status} />} />
              <Row label="Verification tier" value={<TierBadge tier={s.tier} />} />
              <Row label="Supervisor" value={s.supervisor} />
              <Row label="Supervisor phone" value={formatPhone(s.supervisorPhone)} />
              {s.supervisorEmail && (
                <Row label="Supervisor email" value={s.supervisorEmail} />
              )}
              {s.verifiedAt && (
                <Row label="Verified" value={formatRelativeTime(s.verifiedAt)} />
              )}
              {s.notes && (
                <Row label="Notes" value={<span className="text-warning">{s.notes}</span>} />
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {s.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={resending}
                    className="border-ink-200 text-ink-700 hover:bg-ink-50 font-medium text-[13px]"
                  >
                    <RefreshCw size={13} className={`mr-1.5 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending...' : 'Resend verification'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/hours?session=${s.id}`;
                    navigator.clipboard.writeText(url).then(() => {
                      toast.success('Link copied to clipboard.');
                    }).catch(() => {
                      toast.error('Could not copy link.');
                    });
                  }}
                  className="border-ink-200 text-ink-700 hover:bg-ink-50 font-medium text-[13px]"
                  aria-label="Copy session link"
                >
                  <Link2 size={13} className="mr-1.5" />
                  Copy link
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-danger hover:bg-danger-bg hover:text-danger font-medium text-[13px]"
              >
                <Trash2 size={13} className="mr-1.5" />
                {deleting ? 'Deleting...' : 'Delete session'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
