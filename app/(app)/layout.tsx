'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { MobileNav } from '@/components/shell/mobile-nav';
import { CommandPalette } from '@/components/shell/command-palette';
import { PageTransition } from '@/components/shell/page-transition';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { sessionsApi, orgsApi, usersApi, mapSession, mapOrg, mapUser } from '@/lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const expiresAt = useMeritStore((s) => s.expiresAt);
  const setSessions = useMeritStore((s) => s.setSessions);
  const setOrganizations = useMeritStore((s) => s.setOrganizations);
  const updateUser = useMeritStore((s) => s.updateUser);
  const logout = useMeritStore((s) => s.logout);
  const hydrated = useHydrationStore((s) => s.hydrated);

  const loaded = useRef(false);

  // Token expiry check — Supabase expiresAt is Unix seconds
  const isTokenValid = isAuthed && expiresAt != null && expiresAt * 1000 > Date.now();

  useEffect(() => {
    // Wait until the persist store has rehydrated from localStorage
    if (!hydrated) return;

    if (!isAuthed || !isTokenValid) {
      logout();
      router.replace('/login');
      return;
    }

    // Load remote data once per mount
    if (loaded.current) return;
    loaded.current = true;

    async function loadData() {
      try {
        const [sessionsRes, orgsRes, userRes] = await Promise.allSettled([
          sessionsApi.list({ perPage: 200 }),
          orgsApi.me(),
          usersApi.me(),
        ]);

        if (sessionsRes.status === 'fulfilled') {
          setSessions(sessionsRes.value.data.map(mapSession));
        }
        if (orgsRes.status === 'fulfilled') {
          setOrganizations(
            (orgsRes.value.data ?? []).map((o: any) => mapOrg({ ...o, is_registered_nonprofit: o.is_registered_nonprofit ?? false })),
          );
        }
        if (userRes.status === 'fulfilled') {
          updateUser(mapUser(userRes.value.data.user));
        }
      } catch {
        // Non-fatal — store keeps whatever is in localStorage
      }
    }

    loadData();
  }, [hydrated, isAuthed, isTokenValid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show nothing until hydration is complete (prevents flash-redirect to /login)
  if (!hydrated) return null;
  if (!isAuthed || !isTokenValid) return null;

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      <Sidebar />
      <CommandPalette />

      <div className="flex flex-col flex-1 md:ml-60 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto pt-14 pb-14 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
