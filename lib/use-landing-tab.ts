'use client';

import { useState, useEffect } from 'react';

export type LandingTab = 'students' | 'organizations';

/**
 * Hook that syncs the landing-page tab with the URL hash.
 * - Reads `#students` or `#organizations` on mount.
 * - Updates the hash (history.replaceState — no scroll jump) when the tab changes.
 * - Listens to `hashchange` so the back/forward buttons still work.
 */
export function useLandingTab() {
  const [tab, setTabState] = useState<LandingTab>('students');

  useEffect(() => {
    const fromHash = (): LandingTab => {
      const h = window.location.hash.replace('#', '');
      return h === 'organizations' ? 'organizations' : 'students';
    };
    setTabState(fromHash());

    const onHashChange = () => setTabState(fromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setTab = (newTab: LandingTab) => {
    setTabState(newTab);
    if (typeof window !== 'undefined') {
      // replaceState avoids polluting history and scroll-resetting
      window.history.replaceState(null, '', `#${newTab}`);
    }
  };

  return { tab, setTab };
}
