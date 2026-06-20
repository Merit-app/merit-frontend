'use client';

import { useEffect } from 'react';
import { refreshSessions } from '@/components/store-hydrator';

const POLL_MS = 45_000;

/**
 * Mount on pages that display the student's hours (dashboard, hours) to keep the
 * cached sessions fresh: refetches immediately on navigation in, then polls every
 * ~45s while the tab is visible. This is what makes org-awarded / supervisor-
 * verified hours show up without a manual reload. Renders nothing.
 */
export function SessionsRefresher() {
  useEffect(() => {
    // Refresh immediately when the student navigates onto this page.
    void refreshSessions(true);

    const id = setInterval(() => {
      // Don't poll a backgrounded tab — focus/visibility handles catch-up.
      if (document.visibilityState === 'visible') void refreshSessions(true);
    }, POLL_MS);

    return () => clearInterval(id);
  }, []);

  return null;
}
