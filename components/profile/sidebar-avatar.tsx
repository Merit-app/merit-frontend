'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMeritStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Deterministic avatar color from name
const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100',   text: 'text-blue-700' },
  { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  { bg: 'bg-amber-100',  text: 'text-amber-700' },
  { bg: 'bg-rose-100',   text: 'text-rose-700' },
  { bg: 'bg-sky-100',    text: 'text-sky-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-teal-100',   text: 'text-teal-700' },
];

function getAvatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
}

export function SidebarAvatar() {
  const user = useMeritStore((s) => s.user);
  const fullName = `${user.firstName} ${user.lastName}`.trim() || 'User';
  const color = getAvatarColor(fullName);
  const initials = getInitials(user.firstName, user.lastName);
  const href = user.username ? `/u/${user.username}` : '/settings/profile';

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
    >
      {/* Avatar */}
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold overflow-hidden relative',
        !user.avatarUrl && `${color.bg} ${color.text}`,
      )}>
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={fullName} fill className="object-cover" sizes="36px" />
        ) : (
          initials
        )}
      </div>

      {/* Name + plan */}
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-medium text-foreground truncate leading-snug group-hover:text-foreground transition-colors">
          {fullName}
        </span>
        <span className="text-[11px] text-muted-foreground capitalize leading-snug">
          {user.plan} plan
        </span>
      </div>
    </Link>
  );
}
