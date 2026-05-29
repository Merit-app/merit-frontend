'use client';

import { Globe, CheckCircle, ShieldCheck, Clock } from 'lucide-react';

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

// Deterministic gradient per org name
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
    <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
      {/* Cover */}
      <div className="relative h-36 sm:h-44">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${coverGradient(name)}`} />
        )}

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
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-merit-blue-700 bg-merit-blue-100 shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-ink-900 leading-tight mb-1">{name}</h1>

        {/* Category · Location */}
        {(category || location) && (
          <p className="text-sm text-ink-500 mb-2">
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
          <p className="mt-3 text-[12px] text-ink-400">
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
