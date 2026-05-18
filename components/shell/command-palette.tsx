'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutDashboard,
  Clock,
  Building2,
  FileDown,
  Settings,
  User,
  Bell,
  CreditCard,
  Puzzle,
  Shield,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { useMeritStore } from '@/lib/store';
import { formatSessionDate, formatHours } from '@/lib/utils';

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandPalette();
  const sessions = useMeritStore((s) => s.sessions);
  const organizations = useMeritStore((s) => s.organizations);

  // Global keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        close();
        router.push('/log');
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggle, close, router]);

  function runCommand(fn: () => void) {
    close();
    fn();
  }

  const recentSessions = sessions.slice(0, 5);

  return (
    <CommandDialog open={isOpen} onOpenChange={(v) => !v && close()}>
      <CommandInput placeholder="Search or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick actions */}
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/log'))}>
            <Plus size={15} className="mr-2 text-merit-blue-600" />
            Log new session
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/export'))}>
            <FileDown size={15} className="mr-2 text-ink-500" />
            Export PDF
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard size={15} className="mr-2 text-ink-500" />
            Go to dashboard
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard size={15} className="mr-2 text-ink-500" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/hours'))}>
            <Clock size={15} className="mr-2 text-ink-500" />
            All sessions
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/organizations'))}>
            <Building2 size={15} className="mr-2 text-ink-500" />
            Organizations
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/export'))}>
            <FileDown size={15} className="mr-2 text-ink-500" />
            Export
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/settings/profile'))}>
            <User size={15} className="mr-2 text-ink-500" />
            Profile settings
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings/notifications'))}>
            <Bell size={15} className="mr-2 text-ink-500" />
            Notifications
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings/billing'))}>
            <CreditCard size={15} className="mr-2 text-ink-500" />
            Plan & billing
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings/integrations'))}>
            <Puzzle size={15} className="mr-2 text-ink-500" />
            Integrations
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings/account'))}>
            <Shield size={15} className="mr-2 text-ink-500" />
            Account
          </CommandItem>
        </CommandGroup>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent sessions">
              {recentSessions.map((s) => (
                <CommandItem
                  key={s.id}
                  onSelect={() => runCommand(() => router.push(`/hours?session=${s.id}`))}
                >
                  <Clock size={15} className="mr-2 text-ink-500" />
                  <span className="truncate">{s.org}</span>
                  <span className="ml-auto text-ink-400 text-[12px] shrink-0 pl-2">
                    {formatSessionDate(s.date)} · {formatHours(s.hours)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Organizations */}
        {organizations.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Organizations">
              {organizations.slice(0, 5).map((org) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => runCommand(() => router.push(`/organizations/${org.slug}`))}
                >
                  <Building2 size={15} className="mr-2 text-ink-500" />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
