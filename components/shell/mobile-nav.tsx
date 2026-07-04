'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Clock, Compass, Store, MoreHorizontal, FileDown, Settings, CircleHelp, Award, Bookmark, Trophy, Inbox, School, Users, GraduationCap } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useMeritStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/use-haptics';

const MORE_NAV = [
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/scholarships', label: 'Scholarships', icon: GraduationCap },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/export', label: 'Export', icon: FileDown },
  { href: '/settings/profile', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: CircleHelp },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [inChapter, setInChapter] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const user = useMeritStore((s) => s.user);
  const isOrgAdmin = useMeritStore((s) => s.isOrgAdmin);
  const adminOrgs = useMeritStore((s) => s.adminOrgs);
  const currentOrgId = useMeritStore((s) => s.currentOrgId);
  const orgAdminId = currentOrgId ?? adminOrgs?.[0]?.id ?? null;
  const haptic = useHaptics();

  // Probe once so chapter/school entry points appear in "More" for the right users
  // (the desktop sidebar's School/Chapter sections are hidden on mobile).
  useEffect(() => {
    let cancelled = false;
    import('@/lib/api').then(({ chapterApi, adminApi }) => {
      chapterApi.myChapter().then((r) => { if (!cancelled && r.data) setInChapter(true); }).catch(() => {});
      adminApi.getChapter().then(() => { if (!cancelled) setIsCoordinator(true); }).catch(() => {});
    });
    return () => { cancelled = true; };
  }, []);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  // Management surfaces (the org you RUN, your school/chapter) sit at the top of
  // "More", above the personal utility links. The bottom-bar "Explore" tab is the
  // public org marketplace — a different thing from "My Organization" here.
  const moreLinks = [
    ...(isOrgAdmin && orgAdminId ? [{ href: `/org/${orgAdminId}/dashboard`, label: 'My Organization', icon: Store }] : []),
    ...(inChapter ? [{ href: '/my-chapter', label: 'My School', icon: School }] : []),
    ...(isCoordinator ? [{ href: '/chapter/overview', label: 'Chapter', icon: Users }] : []),
    ...MORE_NAV,
  ];
  const moreActive = moreLinks.some(({ href }) => pathname.startsWith(href));

  return (
    <>
      <nav
        className="flex lg:hidden fixed bottom-0 left-0 right-0 z-30 bar-safe-bottom items-stretch bg-card"
        style={{ borderTop: '0.5px solid var(--color-ink-200)' }}
      >
        {/* Dashboard */}
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={isActive('/dashboard')} />

        {/* Sessions */}
        <NavItem href="/hours" label="Sessions" icon={Clock} active={isActive('/hours')} />

        {/* Log — primary CTA, center */}
        <Link
          href="/log"
          onClick={() => haptic('medium')}
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

        {/* Explore — the public org marketplace (distinct from "My Organization" in More) */}
        <NavItem href="/organizations" label="Explore" icon={Compass} active={isActive('/organizations')} />

        {/* More */}
        <button
          onClick={() => { haptic('light'); setMoreOpen(true); }}
          className="flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none"
          aria-label="More"
        >
          <MoreHorizontal
            size={20}
            className={moreActive ? 'text-merit-blue-600' : 'text-muted-foreground'}
          />
          <span
            className={cn(
              'text-[11px] font-medium',
              moreActive ? 'text-merit-blue-600' : 'text-muted-foreground'
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
          <div className="flex items-center gap-3 px-5 pb-4 pt-5 border-b border-border">
            <UserAvatar name={`${user.firstName} ${user.lastName}`.trim()} size="sm" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-none truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{user.plan} plan</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="py-2">
            {moreLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-[14px] font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'text-merit-blue-600'
                    : 'text-foreground hover:text-foreground'
                )}
              >
                <Icon size={18} className={pathname.startsWith(href) ? 'text-merit-blue-600' : 'text-muted-foreground'} />
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
  const haptic = useHaptics();
  return (
    <Link
      href={href}
      onClick={() => haptic('light')}
      className="flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none"
    >
      <Icon size={20} className={active ? 'text-merit-blue-600' : 'text-muted-foreground'} />
      <span className={cn('text-[11px] font-medium', active ? 'text-merit-blue-600' : 'text-muted-foreground')}>
        {label}
      </span>
    </Link>
  );
}
