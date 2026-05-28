import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import type { SimilarOrg } from '@/lib/types';

interface Props {
  orgs: SimilarOrg[];
  loading?: boolean;
  /** Base path prefix — '/organizations' for app, '/orgs' for public */
  basePath?: string;
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function OrgSimilarCard({ orgs, loading, basePath = '/organizations' }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-ink-200 p-5">
        <h2 className="text-[15px] font-semibold text-ink-900 mb-4">You might also like</h2>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-ink-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-ink-100 rounded w-32" />
                <div className="h-2.5 bg-ink-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orgs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-5">
      <h2 className="text-[15px] font-semibold text-ink-900 mb-4">You might also like</h2>

      <div className="space-y-3">
        {orgs.map((org) => (
          <Link
            key={org.id}
            href={`${basePath}/${org.slug}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-merit-blue-100 flex items-center justify-center text-[12px] font-bold text-merit-blue-700 shrink-0 overflow-hidden">
              {org.logoUrl ? (
                <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                getInitials(org.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink-900 group-hover:text-merit-blue-600 transition-colors truncate">
                {org.name}
              </p>
              <p className="text-[11px] text-ink-400 truncate">
                {org.studentCount > 0 ? `${org.studentCount} student${org.studentCount !== 1 ? 's' : ''}` : 'No activity yet'}
                {org.city ? ` · ${org.city}` : ''}
              </p>
            </div>
            {org.isRegisteredNonprofit && (
              <CheckCircle size={13} className="text-green-500 shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
