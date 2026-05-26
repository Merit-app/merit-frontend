import { Globe, CheckCircle, Building2 } from 'lucide-react';

interface Props {
  name: string;
  description: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  ein: string | null;
  isRegisteredNonprofit: boolean;
  isInstitutionalPartner: boolean;
  claimed: boolean;
  isRecruiting: boolean;
}

export function OrgHero({
  name,
  description,
  category,
  city,
  state,
  website,
  ein,
  isRegisteredNonprofit,
  isInstitutionalPartner,
  claimed,
  isRecruiting,
}: Props) {
  const location = [city, state].filter(Boolean).join(', ');
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const websiteHost = website
    ? (() => { try { return new URL(website).hostname.replace(/^www\./, ''); } catch { return website; } })()
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-start gap-5 pb-6 border-b border-ink-200">
      {/* Org avatar */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 bg-merit-blue-100 text-merit-blue-700"
      >
        {initials || <Building2 size={24} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-ink-900 leading-tight">{name}</h1>

          {isInstitutionalPartner && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
              <CheckCircle size={10} />
              Institutional Partner
            </span>
          )}
          {!isInstitutionalPartner && isRegisteredNonprofit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <CheckCircle size={10} />
              Registered Nonprofit
            </span>
          )}
          {isRecruiting && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Recruiting
            </span>
          )}
        </div>

        {category && (
          <p className="text-sm text-ink-500 mb-0.5">{category}</p>
        )}

        {location && (
          <p className="text-sm text-ink-600 mb-0.5">{location}</p>
        )}

        {websiteHost && (
          <a
            href={website!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
          >
            <Globe size={12} />
            {websiteHost}
          </a>
        )}

        {ein && (
          <p className="text-[11px] text-ink-400 mt-1">EIN: {ein}</p>
        )}

        {description && (
          <p className="text-sm text-ink-600 mt-3 leading-relaxed max-w-lg">{description}</p>
        )}
      </div>
    </div>
  );
}
