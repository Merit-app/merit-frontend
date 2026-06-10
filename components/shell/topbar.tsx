'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Menu, Plus, LayoutDashboard, Clock, Building2, FileDown, Settings, CircleHelp } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import Link from 'next/link';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMeritStore } from '@/lib/store';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { UserMenu } from './user-menu';
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

const ALL_NAV = [
  { href: '/log', label: 'Log hours', icon: Plus, primary: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hours', label: 'All sessions', icon: Clock },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/export', label: 'Export', icon: FileDown },
  { href: '/settings/profile', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: CircleHelp },
] as const;

export function Topbar() {
  const pathname = usePathname();
  const { open } = useCommandPalette();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = getPageTitle(pathname);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

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

      {/* Mobile sidebar sheet — slides from left */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-background">
          {/* Logo */}
          <div className="flex h-14 items-center px-5 border-b border-border">
            <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
              <span className="text-[18px] font-semibold tracking-tight text-foreground">
                merit<span className="text-merit-blue-600">.</span>
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Service hours · 2024–25</p>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 px-3 py-4">
            {ALL_NAV.map((item) => { const { href, label, icon: Icon } = item; const primary = 'primary' in item && item.primary; return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-[6px] px-3 py-2.5 text-[13px] font-medium transition-colors',
                  primary
                    ? 'bg-merit-blue-600 text-white hover:bg-merit-blue-700 mb-1'
                    : isActive(href)
                    ? 'bg-muted text-foreground'
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {!primary && isActive(href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-merit-blue-600 rounded-full" />
                )}
                <Icon
                  size={16}
                  className={cn(
                    'shrink-0',
                    primary
                      ? 'text-white'
                      : isActive(href)
                      ? 'text-merit-blue-600'
                      : 'text-muted-foreground'
                  )}
                />
                {label}
              </Link>
            );})}
          </nav>

          {/* User menu at bottom */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border px-3 py-3">
            <UserMenu />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
