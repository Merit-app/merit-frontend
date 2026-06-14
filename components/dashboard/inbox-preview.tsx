'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notificationsApi, type NotificationItem } from '@/lib/api';
import { Bell, Megaphone, Calendar, GraduationCap, CheckCircle2, ChevronRight } from 'lucide-react';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function iconFor(type: string) {
  if (type === 'org_message' || type === 'announcement' || type === 'chapter_announcement') return Megaphone;
  if (type === 'event') return Calendar;
  if (type === 'scholarship') return GraduationCap;
  if (type === 'verification' || type === 'verified') return CheckCircle2;
  return Bell;
}

export function InboxPreview() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => notificationsApi.list(1, 5),
  });
  const items: NotificationItem[] = (data as any)?.data ?? [];

  // Keep the dashboard clean when there's nothing to show.
  if (items.length === 0) return null;

  const unread = items.filter((n) => !n.read).length;

  function open(n: NotificationItem) {
    if (!n.read) notificationsApi.markRead(n.id).catch(() => {});
    router.push(n.action_url || '/inbox');
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Inbox</h2>
          {unread > 0 && (
            <span className="rounded-full bg-merit-blue-500/15 px-2 py-0.5 text-[11px] font-bold text-merit-blue-600">
              {unread} new
            </span>
          )}
        </div>
        <Link href="/inbox" className="flex items-center gap-0.5 text-xs font-medium text-merit-blue-600 hover:text-merit-blue-700">
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        {items.slice(0, 3).map((n) => {
          const Icon = iconFor(n.type);
          return (
            <button
              key={n.id}
              onClick={() => open(n)}
              className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                n.read ? 'bg-muted text-muted-foreground' : 'bg-merit-blue-500/15 text-merit-blue-600'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-merit-blue-500" />}
                </div>
                <p className="truncate text-xs text-muted-foreground">{n.body}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
