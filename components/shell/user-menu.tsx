'use client';

import { useRouter } from 'next/navigation';
import { Settings, LogOut, CreditCard, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMeritStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UserMenuProps {
  /** When true, renders as a compact settings icon row instead of the full avatar trigger */
  compact?: boolean;
}

export function UserMenu({ compact }: UserMenuProps) {
  const router = useRouter();
  const user = useMeritStore((s) => s.user);
  const logout = useMeritStore((s) => s.logout);

  function handleLogout() {
    logout();
    toast.success('Signed out.');
    router.push('/login');
  }

  const trigger = compact ? (
    <button
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5',
        'text-[12px] text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600',
      )}
    >
      <Settings size={14} className="shrink-0" />
      <span>Settings &amp; more</span>
    </button>
  ) : (
    <button
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2 py-2',
        'hover:bg-ink-100 transition-colors duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600',
      )}
    >
      {/* Full avatar trigger (legacy / non-compact) */}
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
        style={{ background: '#DBEAFE', color: '#1D4ED8' }}
      >
        {`${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()}
      </span>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[13px] font-medium text-ink-900 leading-none truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-micro text-ink-500 mt-0.5 capitalize">{user.plan} plan</p>
      </div>
    </button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={4}
        className="w-52"
        style={{ boxShadow: 'var(--shadow-elevated, 0 4px 12px -2px rgb(0 0 0 / 0.04), 0 2px 4px -1px rgb(0 0 0 / 0.03))' }}
      >
        <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
          <Settings size={14} className="mr-2 text-ink-500" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings/billing')}>
          <CreditCard size={14} className="mr-2 text-ink-500" />
          Plan &amp; billing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info('Theme options coming soon.')}>
          <Palette size={14} className="mr-2 text-ink-500" />
          Theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-danger focus:text-danger focus:bg-danger-bg"
        >
          <LogOut size={14} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
