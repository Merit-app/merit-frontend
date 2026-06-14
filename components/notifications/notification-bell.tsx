'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check } from 'lucide-react';
import { notificationsApi, type NotificationItem } from '@/lib/api';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationBell({ iconSize = 18 }: { iconSize?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    notificationsApi.unreadCount().then((r) => setUnread(r.data.count)).catch(() => {});
  }, []);

  // Poll the unread count periodically + on mount
  useEffect(() => {
    refreshCount();
    const t = setInterval(refreshCount, 60000);
    return () => clearInterval(t);
  }, [refreshCount]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const r = await notificationsApi.list(1, 20);
        setItems(r.data);
      } finally {
        setLoading(false);
      }
    }
  }

  async function openItem(n: NotificationItem) {
    if (!n.read) {
      notificationsApi.markRead(n.id).catch(() => {});
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.action_url) router.push(n.action_url);
  }

  async function markAll() {
    await notificationsApi.markAllRead().catch(() => {});
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell size={iconSize} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="inline-flex items-center gap-1 text-xs text-merit-blue-600 hover:text-merit-blue-700">
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    n.read ? '' : 'bg-merit-blue-50/40 dark:bg-merit-blue-900/10'
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{n.title}</span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-merit-blue-500" />}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => { setOpen(false); router.push('/inbox'); }}
            className="w-full border-t border-border px-4 py-2.5 text-center text-xs font-medium text-merit-blue-600 hover:bg-muted/50 hover:text-merit-blue-700 transition-colors"
          >
            View all in inbox
          </button>
        </div>
      )}
    </div>
  );
}
