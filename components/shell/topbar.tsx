'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import Link from 'next/link';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { UserMenu } from './user-menu';
import { SidebarNav } from './sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/log': 'Log hours',
  '/hours': 'All sessions',
  '/organizations': 'Organizations',
  '/export': 'Export',
  '/settings/profile': 'Settings',
  '/settings/notifications': 'Settings',
  '/settings/billing': 'Settings',
  '/settings/integrations': 'Settings',
  '/settings/account': 'Settings',
  '/help': 'Help',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return val;
  }
  return 'Merit';
}

export function Topbar() {
  const pathname = usePathname();
  const { open } = useCommandPalette();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = getPageTitle(pathname);

  // Close the mobile sheet whenever navigation changes the route.
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <>
      {/* Topbar: left-0 on mobile, left-60 on md */}
      <header className="fixed top-0 left-0 md:left-60 right-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        {/* Left: hamburger on mobile, title on desktop */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-h2 text-foreground">{title}</h1>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Search — hidden on mobile, shown on sm+ */}
          <button
            onClick={open}
            className={cn(
              'hidden sm:flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5',
              'text-[13px] text-muted-foreground hover:border-border hover:text-foreground',
              'transition-colors duration-100 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600'
            )}
            title="Search (Cmd+K)"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline ml-1 text-[11px] text-muted-foreground font-medium bg-muted px-1 rounded">⌘K</kbd>
          </button>

          {/* Theme toggle */}
          <ThemeToggle variant="topbar" />

          {/* Notifications */}
          <NotificationBell iconSize={16} />
        </div>
      </header>

      {/* Mobile sidebar sheet — slides from left, mirrors the desktop sidebar nav */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-background flex flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center px-5 border-b border-border shrink-0">
            <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
              <span className="text-[18px] font-semibold tracking-tight text-foreground">
                merit<span className="text-merit-blue-600">.</span>
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Service hours · 2024–25</p>
            </Link>
          </div>

          {/* Full nav — identical to the desktop sidebar */}
          <SidebarNav />

          {/* User menu at bottom */}
          <div className="border-t border-border px-3 py-3 shrink-0">
            <UserMenu />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
