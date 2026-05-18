'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeritStore } from '@/lib/store';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { UserMenu } from './user-menu';

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
  // exact match
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // prefix match
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return val;
  }
  return 'Merit';
}

export function Topbar() {
  const pathname = usePathname();
  const user = useMeritStore((s) => s.user);
  const { open } = useCommandPalette();

  const title = getPageTitle(pathname);

  return (
    <header className="fixed top-0 left-60 right-0 z-20 flex h-14 items-center justify-between border-b border-ink-200 bg-white px-6">
      {/* Page title */}
      <h1 className="text-h2 text-ink-900">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search → opens command palette */}
        <button
          onClick={open}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5',
            'text-[13px] text-ink-500 hover:border-ink-300 hover:text-ink-700',
            'transition-colors duration-100 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600'
          )}
          title="Search (Cmd+K)"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline ml-1 text-[11px] text-ink-400 font-medium bg-ink-100 px-1 rounded">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          className={cn(
            'relative flex h-8 w-8 items-center justify-center rounded-lg',
            'text-ink-500 hover:bg-ink-100 hover:text-ink-700',
            'transition-colors duration-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600'
          )}
          title="Notifications"
        >
          <Bell size={16} />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-merit-blue-600" />
        </button>
      </div>
    </header>
  );
}
