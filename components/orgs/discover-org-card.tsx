'use client';

import Link from 'next/link';
import { Bookmark, CheckCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscoverOrg } from '@/lib/types';

interface Props {
  org: DiscoverOrg;
  isFollowing: boolean;
  onToggleFollow: (orgId: string) => void;
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// Deterministic flat header color from org name
const HEADER_COLORS = [
  'bg-violet-200', 'bg-blue-200', 'bg-emerald-200',
  'bg-amber-200', 'bg-rose-200', 'bg-sky-200', 'bg-indigo-200',
];
function headerColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return HEADER_COLORS[h % HEADER_COLORS.length];
}

// Deterministic avatar bg/text color
const AVATAR_COLORS = [
  { bg: 'bg-violet-600', text: 'text-white' },
  { bg: 'bg-blue-600',   text: 'text-white' },
  { bg: 'bg-emerald-600',text: 'text-white' },
  { bg: 'bg-amber-500',  text: 'text-white' },
  { bg: 'bg-rose-600',   text: 'text-white' },
  { bg: 'bg-sky-600',    text: 'text-white' },
  { bg: 'bg-indigo-600', text: 'text-white' },
];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function DiscoverOrgCard({ org, isFollowing, onToggleFollow }: Props) {
  const location = [org.city, org.state].filter(Boolean).join(', ');
  const color = avatarColor(org.name);

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white flex flex-col hover:shadow-md transition-shadow duration-150">
      {/* ── Header area ────────────────────────────────────────────────── */}
      <div className="h-24 w-full relative flex-shrink-0">
        {/* Cover image or flat color */}
        <Link href={`/organizations/${org.slug}`} className="block absolute inset-0">
          {org.coverUrl ? (
            <img src={org.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full ${headerColor(org.name)}`} />
          )}
        </Link>

        {/* Bookmark button — top-right of header */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFollow(org.id); }}
          aria-label={isFollowing ? 'Unfollow' : 'Bookmark'}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <Bookmark
            size={14}
            className={cn(
              'transition-colors',
              isFollowing ? 'fill-white text-white' : 'text-white/90',
            )}
          />
        </button>

        {/* Initials/logo circle — bottom-left, overlapping into body */}
        <div className="absolute bottom-0 left-4 translate-y-1/2">
          <Link href={`/organizations/${org.slug}`} tabIndex={-1}>
            <div className={cn(
              'w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold overflow-hidden',
              !org.logoUrl && `${color.bg} ${color.text}`,
            )}>
              {org.logoUrl ? (
                <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(org.name)
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <Link href={`/organizations/${org.slug}`} className="flex flex-col flex-1 px-4 pb-4 pt-8">
        <h3 className="text-[14px] font-bold text-ink-900 leading-snug mb-1 truncate">
          {org.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1 mb-2">
          {org.category && (
            <span className="text-[11px] font-medium text-ink-500 bg-ink-100 px-2 py-0.5 rounded-full">
              {org.category}
            </span>
          )}
          {org.isInstitutionalPartner && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-merit-blue-700 bg-merit-blue-50 px-1.5 py-0.5 rounded-full">
              <ShieldCheck size={9} /> Partner
            </span>
          )}
          {!org.isInstitutionalPartner && org.isRegisteredNonprofit && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
              <CheckCircle size={9} /> Verified
            </span>
          )}
        </div>

        {location && (
          <p className="text-[12px] text-ink-400 mb-1.5 truncate">{location}</p>
        )}

        <p className="text-[12px] text-ink-500">
          {org.studentCount > 0
            ? <><span className="font-semibold text-ink-700">{org.studentCount}</span> {org.studentCount === 1 ? 'student' : 'students'} volunteer here</>
            : <span className="text-ink-400 italic">Be the first to volunteer here</span>
          }
        </p>
      </Link>
    </div>
  );
}
