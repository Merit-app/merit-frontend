'use client';

import Image from 'next/image';
import { Globe, CheckCircle, ShieldCheck, Clock } from 'lucide-react';
import { OrgCover } from '@/components/orgs/org-cover';

interface Props {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isRegisteredNonprofit: boolean;
  isInstitutionalPartner: boolean;
  claimed: boolean;
  isRecruiting: boolean;
  // Optional auth-only slots
  actions?: React.ReactNode;
  showClaimLink?: boolean;
  onClaimClick?: () => void;
  claimStatus?: string | null;
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function OrgCoverHeader({
  id,
  name,
  category,
  city,
  state,
  website,
  logoUrl,
  coverUrl,
  isRegisteredNonprofit,
  isInstitutionalPartner,
  claimed,
  isRecruiting,
  actions,
  showClaimLink = false,
  onClaimClick,
  claimStatus,
}: Props) {
  const location = [city, state].filter(Boolean).join(', ');
  const websiteHost = website
    ? (() => { try { return new URL(website).hostname.replace(/^www\./, ''); } catch { return website; } })()
    : null;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Cover */}
      <div className="relative h-36 sm:h-44">
        <OrgCover name={name} coverUrl={coverUrl} sizes="100vw" />

        {/* Actions row in top-right of cover */}
        {actions && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Logo + info */}
      <div className="px-5 pb-5">
        {/* Logo overlapping cover */}
        <div className="relative -mt-8 mb-3 flex items-end justify-between">
          <div className="w-16 h-16 rounded-2xl bg-card border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-merit-blue-700 bg-merit-blue-100 shrink-0 overflow-hidden relative">
            {logoUrl ? (
              <Image src={logoUrl} alt={name} fill className="object-cover rounded-2xl" sizes="64px" />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-1">{name}</h1>

        {/* Category · Location */}
        {(category || location) && (
          <p className="text-sm text-muted-foreground mb-2">
            {[category, location].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {isInstitutionalPartner && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-merit-blue-700 bg-merit-blue-50 border border-merit-blue-200 px-2 py-0.5 rounded-full">
              <ShieldCheck size={10} />
              Institutional Partner
            </span>
          )}
          {!isInstitutionalPartner && isRegisteredNonprofit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <CheckCircle size={10} />
              Registered Nonprofit
            </span>
          )}
          {claimed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-merit-blue-600 bg-merit-blue-50 border border-merit-blue-200 px-2 py-0.5 rounded-full">
              <CheckCircle size={10} />
              Claimed
            </span>
          )}
          {isRecruiting && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Recruiting
            </span>
          )}
        </div>

        {/* Website */}
        {websiteHost && (
          <a
            href={website!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
          >
            <Globe size={13} />
            {websiteHost}
          </a>
        )}

        {/* Claim link / status */}
        {showClaimLink && !claimed && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Is this your organization?{' '}
            {claimStatus === 'pending' ? (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Clock size={11} /> Claim under review
              </span>
            ) : claimStatus === 'approved' ? (
              <a href="/organizations" className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle size={11} /> You manage this page
              </a>
            ) : (
              <button
                onClick={onClaimClick}
                className="text-merit-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Claim this page →
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
