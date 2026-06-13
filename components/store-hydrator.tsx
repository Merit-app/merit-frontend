'use client';

import { useEffect } from 'react';
import { useMeritStore } from '@/lib/store';
import { useHydrationStore } from '@/lib/store';
import { usersApi, mapUser } from '@/lib/api';

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

// Throttle how often we re-pull the canonical user (plan, role, etc.) so a
// background tab regaining focus doesn't spam /users/me.
const USER_REFRESH_THROTTLE_MS = 60_000;
let lastUserRefresh = 0;

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

      // After the session is settled, pull the canonical user so a plan/role
      // change made elsewhere is reflected without a logout/login.
      if (!cancelled) void refreshUser(true);
    })();

    // Re-sync the user when the tab regains focus (throttled).
    const onFocus = () => void refreshUser();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
