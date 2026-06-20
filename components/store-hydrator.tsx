'use client';

import { useEffect } from 'react';
import { useMeritStore } from '@/lib/store';
import { useHydrationStore } from '@/lib/store';
import { usersApi, sessionsApi, mapUser, mapSession } from '@/lib/api';

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

// Throttle how often we re-pull the canonical user (plan, role, etc.) so a
// background tab regaining focus doesn't spam /users/me.
const USER_REFRESH_THROTTLE_MS = 60_000;
let lastUserRefresh = 0;

// Throttle session re-pulls (shorter than user — hours change more often, and
// this is what makes org-awarded / supervisor-verified hours appear without a
// hard reload).
const SESSIONS_REFRESH_THROTTLE_MS = 30_000;
let lastSessionsRefresh = 0;

/**
 * Pull the fresh user from the server and merge it into the store. This is what
 * keeps `plan` (and other server-owned fields) from going stale after, e.g., an
 * upgrade in another session — previously the persisted plan only updated on a
 * full logout/login.
 */
async function refreshUser(force = false) {
  const { isAuthed, accessToken, updateUser } = useMeritStore.getState();
  if (!isAuthed || !accessToken) return;
  if (!force && Date.now() - lastUserRefresh < USER_REFRESH_THROTTLE_MS) return;
  lastUserRefresh = Date.now();
  try {
    const res = await usersApi.me();
    if (res?.data?.user) updateUser(mapUser(res.data.user));
  } catch {
    // Non-fatal — keep the cached user.
  }
}

/**
 * Re-pull the student's sessions and replace the cached list. The student is NOT
 * the actor when an org awards hours or a supervisor verifies via SMS, so nothing
 * else invalidates their cache — without this, those hours only appear after a
 * hard reload. Called on boot, on window-focus (throttled), and polled by
 * <SessionsRefresher/> on the dashboard/hours pages.
 */
export async function refreshSessions(force = false) {
  const { isAuthed, accessToken, setSessions } = useMeritStore.getState();
  if (!isAuthed || !accessToken) return;
  if (!force && Date.now() - lastSessionsRefresh < SESSIONS_REFRESH_THROTTLE_MS) return;
  lastSessionsRefresh = Date.now();
  try {
    const res = await sessionsApi.list({ perPage: 200 });
    if (res?.data) setSessions(res.data.map(mapSession));
  } catch {
    // Non-fatal — keep the cached sessions.
  }
}

/**
 * Rehydrates the Zustand persist store from localStorage on the client, then
 * exchanges the persisted refresh token for a fresh access token before the app
 * layout checks auth state. This keeps the user signed in across page reloads,
 * idle periods, and navigation between the student and org dashboards.
 */
export function StoreHydrator() {
  const setHydrated = useHydrationStore((s) => s.setHydrated);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Rehydrate is synchronous for localStorage.
      useMeritStore.persist.rehydrate();

      const { refreshToken, expiresAt, accessToken, setTokens, logout } = useMeritStore.getState();

      // If we have a refresh token but the access token is missing or close to
      // expiry, mint a fresh one now so the layout guards see a valid session.
      const needsRefresh =
        !!refreshToken &&
        (!accessToken || expiresAt == null || expiresAt * 1000 < Date.now() + 60_000);

      if (needsRefresh) {
        try {
          const res = await fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (res.ok) {
            const d = await res.json();
            const s = d?.data;
            if (s?.accessToken) setTokens(s.accessToken, s.refreshToken ?? refreshToken, s.expiresAt);
          } else if (res.status === 401) {
            // Refresh token is genuinely invalid/revoked — clear the dead session.
            logout();
          }
          // Other errors (network/5xx): keep the session; request() will retry later.
        } catch {
          // Network error on boot — don't nuke the session; let request() recover.
        }
      }

      if (!cancelled) setHydrated();

      // After the session is settled, pull the canonical user + sessions so a
      // plan/role change or org-awarded/verified hours are reflected without a
      // logout/login or hard reload.
      if (!cancelled) void refreshUser(true);
      if (!cancelled) void refreshSessions(true);
    })();

    // Re-sync the user + sessions when the tab regains focus (throttled).
    const onFocus = () => {
      void refreshUser();
      void refreshSessions();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
