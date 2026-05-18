'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { TierBadge } from './tier-badge';
import { useMeritStore } from '@/lib/store';
import { formatLongDate, formatRelativeTime, formatPhone } from '@/lib/utils';
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

export function SessionDetailSheet({ session, open, onClose }: Props) {
  const updateSession = useMeritStore((s) => s.updateSession);
  const deleteSession = useMeritStore((s) => s.deleteSession);
  const [deleting, setDeleting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!session) return null;

  async function handleResend() {
    setResending(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`Verification re-sent to ${session!.supervisor}.`);
    setResending(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete this session at ${session!.org}? This can't be undone.`)) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    deleteSession(session!.id);
    toast.success('Session deleted.');
    setDeleting(false);
    onClose();
  }

  const hoursStr = session.hours % 1 === 0 ? `${session.hours}` : session.hours.toFixed(1);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-ink-200">
          <SheetTitle className="text-h2 text-ink-900">{session.org}</SheetTitle>
          <SheetDescription className="text-small text-ink-500">
            {formatLongDate(session.date)}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Row label="Date" value={formatLongDate(session.date)} />
          <Row label="Hours" value={`${hoursStr} hrs`} />
          <Row label="Activity" value={session.activity} />
          <Row label="Status" value={<StatusBadge status={session.status} />} />
          <Row label="Verification tier" value={<TierBadge tier={session.tier} />} />
          <Row label="Supervisor" value={session.supervisor} />
          <Row label="Supervisor phone" value={formatPhone(session.supervisorPhone)} />
          {session.supervisorEmail && (
            <Row label="Supervisor email" value={session.supervisorEmail} />
          )}
          {session.verifiedAt && (
            <Row label="Verified" value={formatRelativeTime(session.verifiedAt)} />
          )}
          {session.notes && (
            <Row label="Notes" value={<span className="text-warning">{session.notes}</span>} />
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-between gap-3">
          {session.status === 'pending' && (
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
          <div className="flex-1" />
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
      </SheetContent>
    </Sheet>
  );
}
