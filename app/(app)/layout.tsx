'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { MobileNav } from '@/components/shell/mobile-nav';
import { CommandPalette } from '@/components/shell/command-palette';
import { PageTransition } from '@/components/shell/page-transition';
import { useMeritStore } from '@/lib/store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useMeritStore((s) => s.isAuthed);

  useEffect(() => {
    if (!isAuthed) {
      router.replace('/login');
    }
  }, [isAuthed, router]);

  if (!isAuthed) return null;

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />
      <CommandPalette />

      {/* Main content area */}
      <div className="flex flex-col flex-1 md:ml-60 min-h-screen overflow-hidden">
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
