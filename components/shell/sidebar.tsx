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
  Zap,
  X,
  ChevronUp,
  Award,
  Bookmark,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';
import { SidebarAvatar } from '@/components/profile/sidebar-avatar';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const primaryNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hours', label: 'All sessions', icon: Clock },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/export', label: 'Export', icon: FileDown },
] as const;

const secondaryNav = [
  { href: '/settings/profile', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: CircleHelp },
] as const;

const UPGRADE_PLANS = [
  {
    name: 'Pro',
    price: '$4.99',
    description: 'PDF templates, CSV export, unlimited orgs',
    href: '/settings/billing',
  },
  {
    name: 'Premium',
    price: '$9.99',
    description: 'Analytics, bulk import, API access',
    href: '/settings/billing',
  },
];

function UpgradePrompt() {
  const user = useMeritStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  if (dismissed || (user.plan && user.plan !== 'free')) return null;

  return (
    <div className="relative z-10 px-3 pb-2">
      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mx-3 mb-2 rounded-xl border border-ink-200 bg-white shadow-lg overflow-hidden z-50">
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-2.5">
              Upgrade your plan
            </p>
            <div className="space-y-2">
              {UPGRADE_PLANS.map((plan) => (
                <Link
                  key={plan.name}
                  href={plan.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 hover:bg-ink-50 transition-colors group"
                >
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-merit-blue-100 flex items-center justify-center shrink-0">
                    <Zap size={11} className="text-merit-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-ink-900">{plan.name}</span>
                      <span className="text-[12px] text-ink-500">{plan.price}/mo</span>
                    </div>
                    <p className="text-[12px] text-ink-400 mt-0.5 leading-snug">{plan.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-ink-100 px-4 py-2.5">
            <Link
              href="/settings/billing"
              onClick={() => setOpen(false)}
              className="text-[12px] text-merit-blue-600 hover:text-merit-blue-700 font-medium"
            >
              See all plans →
            </Link>
          </div>
        </div>
      )}

      {/* Pill */}
      <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2">
        <Zap size={13} className="text-merit-blue-600 shrink-0" />
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left text-[12px] font-medium text-ink-700 hover:text-ink-900 transition-colors"
        >
          Upgrade for more features
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle upgrade options"
          className="text-ink-400 hover:text-ink-600 transition-colors"
        >
          <ChevronUp
            size={13}
            className={cn('transition-transform duration-150', !open && 'rotate-180')}
          />
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="text-ink-300 hover:text-ink-500 transition-colors"
            >
              <X size={13} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Dismiss</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function OrgDashboardLink() {
  const adminOrgs = useMeritStore((s) => s.adminOrgs);
  const currentOrgId = useMeritStore((s) => s.currentOrgId);
  const pathname = usePathname();
  const orgId = currentOrgId ?? adminOrgs[0]?.id;
  if (!orgId) return null;
  const href = `/org/${orgId}/dashboard`;
  return (
    <NavItem
      href={href}
      label="Org dashboard"
      icon={Building2}
      active={pathname.startsWith('/org/')}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isOrgAdmin = useMeritStore((s) => s.isOrgAdmin);
  const hydrated = useHydrationStore((s) => s.hydrated);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60 flex-col bg-ink-50 border-r border-ink-200">
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
        {/* Profile row — top of nav */}
        <div className="mb-2">
          <SidebarAvatar />
        </div>

        <div className="mx-1 mb-2 h-px bg-ink-200" />

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

        {/* Org dashboard — only shown to org admins, links to new standalone platform */}
        {hydrated && isOrgAdmin && (
          <OrgDashboardLink />
        )}

        {/* Divider */}
        <div className="mx-1 my-2 h-px bg-ink-200" />

        {/* Secondary nav */}
        {secondaryNav.map(({ href, label, icon: Icon }) => (
          <NavItem key={href} href={href} label={label} icon={Icon} active={isActive(href)} small />
        ))}
      </nav>

      {/* Upgrade prompt (free users only) */}
      <UpgradePrompt />

      {/* User menu (settings, logout) — compact at bottom */}
      <div className="border-t border-ink-200 px-3 py-2">
        <UserMenu compact />
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
