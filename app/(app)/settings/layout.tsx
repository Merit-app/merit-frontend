'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/settings/profile',       label: 'Public Profile' },
  { href: '/settings/notifications',  label: 'Notifications' },
  { href: '/settings/billing',        label: 'Plan & billing' },
  { href: '/settings/integrations',   label: 'Integrations' },
  { href: '/settings/account',        label: 'Account' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
      {/* Sub-nav — horizontal scroll on mobile, vertical on md */}
      <nav className="flex md:flex-col gap-1 md:gap-0.5 md:space-y-0.5 w-full md:w-44 md:shrink-0 overflow-x-auto pb-1 md:pb-0">
        <p className="hidden md:block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pb-2">
          Settings
        </p>
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'block shrink-0 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
