'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Defensive guard: if Supabase redirects to a public page with an auth
 * token in the URL hash (e.g. after email confirmation), strip it by
 * forwarding to /auth/callback so the token is consumed correctly.
 *
 * Place this component on any public page that could be a Supabase
 * redirect target (e.g. /u/[username]).
 */
export function StripAuthTokens() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
      // Forward the full hash to /auth/callback so Supabase can process it
      router.replace('/auth/callback' + hash);
    }
  }, [router]);

  return null;
}
