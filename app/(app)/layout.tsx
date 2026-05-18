'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { CommandPalette } from '@/components/shell/command-palette';
import { PageTransition } from '@/components/shell/page-transition';
import { useMeritStore } from '@/lib/store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthed = useMeritStore((s) => s.isAuthed);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthed) {
      router.replace('/login');
    }
  }, [isAuthed, router]);

  if (!isAuthed) return null;

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      <Sidebar />
      <CommandPalette />

      {/* Main content area */}
      <div className="flex flex-col flex-1 ml-60 min-h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto pt-14">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
