'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  Clock,
  Building2,
  FileDown,
  Settings,
  CircleHelp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

const primaryNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hours', label: 'All sessions', icon: Clock },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/export', label: 'Export', icon: FileDown },
] as const;

const secondaryNav = [
  { href: '/settings/profile', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: CircleHelp },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-ink-50 border-r border-ink-200">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-ink-200">
        <Link href="/dashboard" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600 rounded-md">
          <span className="text-[18px] font-semibold tracking-tight text-ink-900 group-hover:text-ink-700 transition-colors">
            merit<span className="text-merit-blue-600">.</span>
          </span>
          <p className="text-micro text-ink-500 mt-0.5">Service hours · 2024–25</p>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4 overflow-y-auto">
        {/* Log hours CTA — primary */}
        <Link
          href="/log"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2.5 mb-1',
            'bg-merit-blue-600 text-white text-[13px] font-medium',
            'hover:bg-merit-blue-700 active:scale-[0.98] transition-all duration-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600 focus-visible:ring-offset-2'
          )}
        >
          <Plus size={16} strokeWidth={2.5} />
          Log hours
        </Link>

        {/* Primary nav */}
        {primaryNav.map(({ href, label, icon: Icon }) => (
          <NavItem key={href} href={href} label={label} icon={Icon} active={isActive(href)} />
        ))}

        {/* Divider */}
        <div className="mx-1 my-2 h-px bg-ink-200" />

        {/* Secondary nav */}
        {secondaryNav.map(({ href, label, icon: Icon }) => (
          <NavItem key={href} href={href} label={label} icon={Icon} active={isActive(href)} small />
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-ink-200 px-3 py-3">
        <UserMenu />
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  small?: boolean;
}

function NavItem({ href, label, icon: Icon, active, small }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-[6px] px-3 py-2 transition-colors duration-100',
        'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600 focus-visible:ring-offset-1',
        active && 'bg-ink-100 text-ink-900',
        small ? 'text-[13px]' : 'text-[13px] font-medium'
      )}
    >
      {/* Active left accent */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-merit-blue-600 rounded-full" />
      )}
      <Icon
        size={16}
        strokeWidth={active ? 2 : 1.75}
        className={cn('shrink-0', active ? 'text-merit-blue-600' : 'text-ink-500 group-hover:text-ink-700')}
      />
      {label}
    </Link>
  );
}
