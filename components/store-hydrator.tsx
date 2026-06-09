'use client';

import { useEffect } from 'react';
import { useMeritStore } from '@/lib/store';
import { useHydrationStore } from '@/lib/store';

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

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
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
