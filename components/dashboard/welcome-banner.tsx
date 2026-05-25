'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useMeritStore, useHydrationStore } from '@/lib/store';

export function WelcomeBanner() {
  const hydrated = useHydrationStore((s) => s.hydrated);
  const sessions = useMeritStore((s) => s.sessions);
  const user = useMeritStore((s) => s.user);

  // Don't render until hydrated — prevents flash on returning users
  if (!hydrated) return null;

  // Only show when the user has zero sessions logged
  if (sessions.length > 0) return null;

  return (
    <div className="bg-merit-blue-600 rounded-xl p-6 mb-6 text-white">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[16px] font-semibold leading-tight mb-1">
            Welcome to Merit{user.firstName ? `, ${user.firstName}` : ''}!
          </p>
          <p className="text-[13px] text-white/80 leading-relaxed mb-4">
            Start building your community service record. Log your first session to get your
            progress tracking underway.
          </p>
          <Link
            href="/log"
            className="inline-flex items-center gap-1.5 bg-white text-merit-blue-700 text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            Log your first session →
          </Link>
        </div>
      </div>
    </div>
  );
}
