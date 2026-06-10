'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { adminApi, authApi, ApiError } from '@/lib/api';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Shield,
  Settings,
  LogOut,
  GraduationCap,
  Building2,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/chapter/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/chapter/roster', label: 'Students', icon: Users },
  { href: '/chapter/messages', label: 'Messages', icon: MessageSquare },
  { href: '/chapter/team', label: 'Team & roles', icon: Shield },
  { href: '/chapter/settings', label: 'Settings', icon: Settings },
] as const;

export default function ChapterDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrationStore((s) => s.hydrated);
  const user = useMeritStore((s) => s.user);
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const accessToken = useMeritStore((s) => s.accessToken);
  const refreshToken = useMeritStore((s) => s.refreshToken);
  const expiresAt = useMeritStore((s) => s.expiresAt);

  const [chapterName, setChapterName] = useState<string>('Chapter');
  const [state, setState] = useState<'checking' | 'ok' | 'denied'>('checking');

  const isTokenValid =
    isAuthed &&
    (refreshToken != null ||
      (accessToken != null && expiresAt != null && expiresAt * 1000 > Date.now()));

  // Auth + coordinator guard
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed || !isTokenValid) {
      router.replace('/login?redirect=/chapter/overview');
      return;
    }
    adminApi
      .getChapter()
      .then((res) => {
        setChapterName((res.data as any)?.name ?? 'Chapter');
        setState('ok');
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          setState('denied');
        }
      });
  }, [hydrated, isAuthed, isTokenValid, router]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* non-fatal */ }
    useMeritStore.getState().logout();
    router.push('/login');
  };

  if (!hydrated || state === 'checking') {
    return <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;
  }

  if (state === 'denied') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold text-foreground">No chapter found</h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            This area is for chapter coordinators. If you should have access, ask your chapter&apos;s
            primary coordinator to add you.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-merit-blue-600 hover:underline">Back to student dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="px-5 h-14 border-b border-border flex items-center">
          <Link href="/chapter/overview" className="font-bold text-xl text-foreground hover:opacity-80 transition-opacity">
            merit<span className="text-merit-blue-600">.</span>
          </Link>
        </div>

        {/* Chapter identity */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-lg bg-merit-blue-50 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-merit-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-semibold text-sm truncate">{chapterName}</p>
              <p className="text-muted-foreground text-xs">Coordinator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Building2 className="w-4 h-4 shrink-0" />
            Student dashboard
          </a>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger/70 hover:text-danger hover:bg-red-400/5 transition-colors w-full">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1 border-t border-border">
            <div className="w-7 h-7 rounded-full bg-merit-blue-50 flex items-center justify-center text-xs font-bold text-merit-blue-600 shrink-0">
              {user?.firstName?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-xs font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-muted-foreground text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-8 h-14 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
