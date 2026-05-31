'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { MobileNav } from '@/components/shell/mobile-nav';
import { CommandPalette } from '@/components/shell/command-palette';
import { PageTransition } from '@/components/shell/page-transition';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { sessionsApi, orgsApi, usersApi, onboardingApi, mapSession, mapOrg, mapUser } from '@/lib/api';

// Note: setFollowedOrgIds pulled via store selector below
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';

const ONBOARDING_LS_KEY = 'merit_onboarding_done';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const expiresAt = useMeritStore((s) => s.expiresAt);
  const user = useMeritStore((s) => s.user);
  const setSessions = useMeritStore((s) => s.setSessions);
  const setOrganizations = useMeritStore((s) => s.setOrganizations);
  const setFollowedOrgIds = useMeritStore((s) => s.setFollowedOrgIds);
  const setIsOrgAdmin = useMeritStore((s) => s.setIsOrgAdmin);
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

    // Minors who haven't accepted the onboarding consent must complete it first
    if (user?.isMinor && user?.consentAccepted === false) {
      router.replace('/onboarding/consent');
      return;
    }

    // Load remote data once per mount
    if (loaded.current) return;
    loaded.current = true;

    async function loadData() {
      try {
        const [sessionsRes, orgsRes, userRes, followingRes, adminOrgsRes] = await Promise.allSettled([
          sessionsApi.list({ perPage: 200 }),
          orgsApi.me(),
          usersApi.me(),
          orgsApi.following(),
          orgsApi.adminMine(),
        ]);

        if (sessionsRes.status === 'fulfilled') {
          setSessions(sessionsRes.value.data.map(mapSession));
        }
        if (orgsRes.status === 'fulfilled') {
          setOrganizations(
            (orgsRes.value.data ?? []).map((o: any) => mapOrg({ ...o, is_registered_nonprofit: o.is_registered_nonprofit ?? false })),
          );
        }
        if (followingRes.status === 'fulfilled') {
          setFollowedOrgIds((followingRes.value.data ?? []).map((o: any) => o.id as string));
        }
        if (adminOrgsRes.status === 'fulfilled') {
          setIsOrgAdmin((adminOrgsRes.value.data?.length ?? 0) > 0);
        }
        if (userRes.status === 'fulfilled') {
          const mappedUser = mapUser(userRes.value.data.user);
          updateUser(mappedUser);

          // Sync onboarding state to localStorage so the modal never flashes on re-login
          const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data : [];
          if (mappedUser.onboardingCompleted) {
            // DB says done — persist fast-path
            try { localStorage.setItem(ONBOARDING_LS_KEY, '1'); } catch { /* ignore */ }
          } else if (sessions.length > 0) {
            // Existing user (has logged sessions) but migration 009 defaulted flag to false.
            // Silently mark as complete so they never see the onboarding modal.
            try { localStorage.setItem(ONBOARDING_LS_KEY, '1'); } catch { /* ignore */ }
            updateUser({ onboardingCompleted: true });
            onboardingApi.complete().catch(() => {});
          }
        }
      } catch {
        // Non-fatal — store keeps whatever is in localStorage
      }
    }

    loadData();
  }, [hydrated, isAuthed, isTokenValid, user?.isMinor, user?.consentAccepted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show nothing until hydration is complete (prevents flash-redirect to /login)
  if (!hydrated) return null;
  if (!isAuthed || !isTokenValid) return null;
  if (user?.isMinor && user?.consentAccepted === false) return null;

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      <OnboardingModal />
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
