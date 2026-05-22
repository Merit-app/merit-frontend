'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { MobileNav } from '@/components/shell/mobile-nav';
import { CommandPalette } from '@/components/shell/command-palette';
import { PageTransition } from '@/components/shell/page-transition';
import { useMeritStore } from '@/lib/store';
import { sessionsApi, orgsApi, usersApi, mapSession, mapOrg, mapUser } from '@/lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const expiresAt = useMeritStore((s) => s.expiresAt);
  const setSessions = useMeritStore((s) => s.setSessions);
  const setOrganizations = useMeritStore((s) => s.setOrganizations);
  const updateUser = useMeritStore((s) => s.updateUser);
  const logout = useMeritStore((s) => s.logout);

  const loaded = useRef(false);

  // Token expiry check — Supabase expiresAt is Unix seconds
  const isTokenValid = isAuthed && expiresAt != null && expiresAt * 1000 > Date.now();

  useEffect(() => {
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
          // /organizations/me returns enriched data — map each entry
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
  }, [isAuthed, isTokenValid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthed || !isTokenValid) return null;

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />
      <CommandPalette />

      {/* Main content area */}
      <div className="flex flex-col flex-1 md:ml-60 overflow-hidden">
        <Topbar />
        {/* pt-14 for topbar, pb-14 md:pb-0 for mobile nav */}
        <main className="flex-1 overflow-y-auto pt-14 pb-14 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile bottom nav — hidden on md and above */}
      <MobileNav />
    </div>
  );
}
