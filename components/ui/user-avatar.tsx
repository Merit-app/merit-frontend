import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/** Deterministic hue from a name so the same person always gets the same color. */
function hueClass(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `avatar-hue-${h % 6}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

export interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * The one avatar used everywhere a person is shown. Renders their photo when
 * present, otherwise deterministic-colored initials (replaces the scattered
 * inline `style={{ background: '#DBEAFE' }}` fallbacks — those broke dark mode).
 */
export function UserAvatar({ name, src, size = 'md', className }: UserAvatarProps) {
  return (
    <Avatar className={cn(SIZES[size], className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback className={cn('font-semibold', hueClass(name || '?'))}>
        {initials(name || '?')}
      </AvatarFallback>
    </Avatar>
  );
}
