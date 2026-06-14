'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationItem } from '@/lib/api';
import { toast } from 'sonner';
import {
  Bell, Megaphone, Calendar, GraduationCap, CheckCircle2, Trash2, Check, Inbox as InboxIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

function iconFor(type: string) {
  if (type === 'org_message' || type === 'announcement') return Megaphone;
  if (type === 'event') return Calendar;
  if (type === 'scholarship') return GraduationCap;
  if (type === 'verification' || type === 'verified') return CheckCircle2;
  return Bell;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'event', label: 'Events' },
  { key: 'org_message', label: 'Messages' },
  { key: 'scholarship', label: 'Scholarships' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

export default function InboxPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data: res, isLoading } = useQuery({
    queryKey: ['notifications', 'inbox'],
    queryFn: () => notificationsApi.list(1, 100),
  });
  const items: NotificationItem[] = (res as any)?.data ?? [];

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const unreadCount = items.filter((n) => !n.read).length;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications', 'inbox'] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  });
  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { invalidate(); toast.success('All marked as read'); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: invalidate,
  });

  function open(n: NotificationItem) {
    if (!n.read) markRead.mutate(n.id);
    if (n.action_url) router.push(n.action_url);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <InboxIcon className="h-6 w-6" /> Inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up'} · messages, events & updates
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Check className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = f.key === 'unread' ? unreadCount : undefined;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-foreground text-background' : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}{count ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card">
            <EmptyState
              icon={InboxIcon}
              title={filter === 'all' ? 'No notifications yet' : 'Nothing here'}
              description={
                filter === 'all'
                  ? 'Announcements, event invites, and scholarship updates will show up here.'
                  : 'Try a different filter.'
              }
            />
          </div>
        ) : (
          filtered.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <div
                key={n.id}
                className={`group flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  n.read ? 'border-border bg-card' : 'border-merit-blue-500/30 bg-merit-blue-50/40 dark:bg-merit-blue-900/10'
                }`}
              >
                <button onClick={() => open(n)} className="flex flex-1 items-start gap-3 text-left min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    n.read ? 'bg-muted text-muted-foreground' : 'bg-merit-blue-500/15 text-merit-blue-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-merit-blue-500" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-3">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
                <button
                  onClick={() => remove.mutate(n.id)}
                  aria-label="Delete"
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-danger group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
