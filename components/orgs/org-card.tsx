import Link from 'next/link';
import { ShieldCheck, Building2, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Organization, Session } from '@/lib/types';

interface Props {
  org: Organization;
  sessions: Session[];
}

function RegistrationPill({ status }: { status: Organization['registrationStatus'] }) {
  if (status === 'institutional') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-merit-blue-700 bg-merit-blue-50 px-2 py-0.5 rounded-full">
        <ShieldCheck size={10} />
        Partner
      </span>
    );
  }
  if (status === 'registered') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success-bg px-2 py-0.5 rounded-full">
        <CheckCircle size={10} />
        Registered nonprofit
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
      Unregistered
    </span>
  );
}

export function OrgCard({ org, sessions }: Props) {
  const orgSessions = sessions.filter((s) => s.orgSlug === org.slug);
  const totalHours = orgSessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);
  const lastVisit = orgSessions.length > 0
    ? [...orgSessions].sort((a, b) => b.date.localeCompare(a.date))[0].date
    : null;

  const hoursStr = totalHours % 1 === 0 ? `${totalHours}` : totalHours.toFixed(1);

  return (
    <Link
      href={`/organizations/${org.slug}`}
      className="group flex flex-col bg-card rounded-xl border border-border p-5 hover:border-border transition-all duration-100 hover:-translate-y-px"
    >
      {/* Name + category */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-h3 text-foreground group-hover:text-merit-blue-600 transition-colors leading-snug">
          {org.name}
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {org.category}
        </span>
        <RegistrationPill status={org.registrationStatus} />
      </div>

      {/* Stats */}
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-[12px] text-muted-foreground">
        <span><span className="font-medium text-foreground">{hoursStr} hrs</span> logged</span>
        <span>{orgSessions.length} {orgSessions.length === 1 ? 'session' : 'sessions'}</span>
        {lastVisit && (
          <span>
            Last: {format(parseISO(lastVisit + 'T00:00:00'), 'MMM d')}
          </span>
        )}
      </div>
    </Link>
  );
}
