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

const GRADIENTS = [
  'from-blue-200 to-indigo-300',
  'from-violet-200 to-purple-300',
  'from-emerald-200 to-teal-300',
  'from-amber-200 to-orange-300',
  'from-rose-200 to-pink-300',
  'from-sky-200 to-cyan-300',
  'from-lime-200 to-green-300',
  'from-fuchsia-200 to-violet-300',
];
function coverGradient(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return GRADIENTS[h % GRADIENTS.length];
}

export function DiscoverOrgCard({ org, isFollowing, onToggleFollow }: Props) {
  const location = [org.city, org.state].filter(Boolean).join(', ');

  return (
    <div className="group relative bg-white rounded-xl border border-ink-200 overflow-hidden hover:border-ink-300 hover:shadow-sm transition-all duration-150">
      {/* Cover */}
      <Link href={`/organizations/${org.slug}`} className="block">
        <div className="relative h-20">
          {org.coverUrl ? (
            <img src={org.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${coverGradient(org.name)}`} />
          )}
        </div>
      </Link>

      {/* Bookmark button — top right of cover, stop propagation */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFollow(org.id); }}
        aria-label={isFollowing ? 'Unfollow' : 'Bookmark'}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
      >
        <Bookmark
          size={14}
          className={cn(
            'transition-colors',
            isFollowing ? 'fill-merit-blue-600 text-merit-blue-600' : 'text-ink-500',
          )}
        />
      </button>

      {/* Logo overlapping cover */}
      <div className="px-4">
        <Link href={`/organizations/${org.slug}`} className="block">
          <div className="-mt-5 w-10 h-10 rounded-xl bg-white border-2 border-white shadow-sm flex items-center justify-center text-[12px] font-bold text-merit-blue-700 bg-merit-blue-100 shrink-0 mb-2 overflow-hidden">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              getInitials(org.name)
            )}
          </div>
        </Link>
      </div>

      {/* Content */}
      <Link href={`/organizations/${org.slug}`} className="block px-4 pb-4">
        <h3 className="text-[14px] font-bold text-ink-900 group-hover:text-merit-blue-600 transition-colors leading-snug mb-1 truncate">
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
