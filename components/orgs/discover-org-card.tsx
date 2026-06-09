'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, CheckCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscoverOrg } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { OrgCover, getOrgInitials as getInitials } from '@/components/orgs/org-cover';

interface Props {
  org: DiscoverOrg;
  isFollowing: boolean;
  onToggleFollow: (orgId: string) => void;
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
    <div className="rounded-xl border border-border overflow-hidden bg-card flex flex-col hover:shadow-md transition-shadow duration-150">
      {/* ── Header area ────────────────────────────────────────────────── */}
      <div className="h-24 w-full relative flex-shrink-0">
        {/* Cover image or flat color */}
        <Link href={`/organizations/${org.slug}`} className="block absolute inset-0">
          <OrgCover name={org.name} coverUrl={org.coverUrl} sizes="(max-width: 768px) 100vw, 350px" initialSize="sm" />
        </Link>

        {/* Bookmark button — top-right of header */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFollow(org.id); }}
              aria-label={isFollowing ? 'Unsave' : 'Save organization'}
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
          </TooltipTrigger>
          <TooltipContent>{isFollowing ? 'Unsave organization' : 'Save organization'}</TooltipContent>
        </Tooltip>

        {/* Initials/logo circle — bottom-left, overlapping into body */}
        <div className="absolute bottom-0 left-4 translate-y-1/2">
          <Link href={`/organizations/${org.slug}`} tabIndex={-1}>
            <div className={cn(
              'w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold overflow-hidden relative',
              !org.logoUrl && `${color.bg} ${color.text}`,
            )}>
              {org.logoUrl ? (
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" sizes="48px" />
              ) : (
                getInitials(org.name)
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <Link href={`/organizations/${org.slug}`} className="flex flex-col flex-1 px-4 pb-4 pt-8">
        <h3 className="text-[14px] font-bold text-foreground leading-snug mb-1 truncate">
          {org.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1 mb-2">
          {org.category && (
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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
          <p className="text-[12px] text-muted-foreground mb-1.5 truncate">{location}</p>
        )}

        <p className="text-[12px] text-muted-foreground">
          {org.studentCount > 0
            ? <><span className="font-semibold text-foreground">{org.studentCount}</span> {org.studentCount === 1 ? 'student' : 'students'} volunteer here</>
            : <span className="text-muted-foreground italic">Be the first to volunteer here</span>
          }
        </p>
      </Link>
    </div>
  );
}
