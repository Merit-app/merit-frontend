'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Clock, Building2, MoreHorizontal, FileDown, Settings, CircleHelp, X, Award, Bookmark } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useMeritStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hours', label: 'Sessions', icon: Clock },
  { href: '/organizations', label: 'Orgs', icon: Building2 },
] as const;

const MORE_NAV = [
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/export', label: 'Export', icon: FileDown },
  { href: '/settings/profile', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: CircleHelp },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const user = useMeritStore((s) => s.user);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  const moreActive = MORE_NAV.some(({ href }) => pathname.startsWith(href));

  return (
    <>
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 items-stretch bg-white"
        style={{ borderTop: '0.5px solid var(--color-ink-200)' }}
      >
        {/* Dashboard */}
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={isActive('/dashboard')} />

        {/* Sessions */}
        <NavItem href="/hours" label="Sessions" icon={Clock} active={isActive('/hours')} />

        {/* Log — primary CTA, center */}
        <Link
          href="/log"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 focus-visible:outline-none"
          aria-label="Log hours"
        >
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              isActive('/log')
                ? 'bg-merit-blue-700'
                : 'bg-merit-blue-600 active:bg-merit-blue-700'
            )}
          >
            <Plus size={22} strokeWidth={2.5} className="text-white" />
          </span>
          <span className="text-[10px] font-semibold text-merit-blue-600">Log</span>
        </Link>

        {/* Orgs */}
        <NavItem href="/organizations" label="Orgs" icon={Building2} active={isActive('/organizations')} />

        {/* More */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none"
          aria-label="More"
        >
          <MoreHorizontal
            size={20}
            className={moreActive ? 'text-merit-blue-600' : 'text-ink-400'}
          />
          <span
            className={cn(
              'text-[11px] font-medium',
              moreActive ? 'text-merit-blue-600' : 'text-ink-400'
            )}
          >
            More
          </span>
        </button>
      </nav>

      {/* More sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-safe">
          {/* User info */}
          <div className="flex items-center gap-3 px-5 pb-4 pt-5 border-b border-ink-100">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
              style={{ background: '#DBEAFE', color: '#1D4ED8' }}
            >
              {user.firstName[0]}{user.lastName[0]}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-900 leading-none truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-ink-500 mt-0.5 capitalize">{user.plan} plan</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="py-2">
            {MORE_NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-[14px] font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'text-merit-blue-600'
                    : 'text-ink-700 hover:text-ink-900'
                )}
              >
                <Icon size={18} className={pathname.startsWith(href) ? 'text-merit-blue-600' : 'text-ink-400'} />
                {label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none"
    >
      <Icon size={20} className={active ? 'text-merit-blue-600' : 'text-ink-400'} />
      <span className={cn('text-[11px] font-medium', active ? 'text-merit-blue-600' : 'text-ink-400')}>
        {label}
      </span>
    </Link>
  );
}
