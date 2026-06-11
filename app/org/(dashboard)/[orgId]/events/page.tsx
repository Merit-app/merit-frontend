'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orgEventsApi, orgBillingApi } from '@/lib/api';
import { Calendar, Plus, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { UpgradeGate } from '@/components/org/upgrade-gate';

function EventCard({ event, orgId }: { event: any; orgId: string }) {
  return (
    <Link
      href={`/org/${orgId}/events/${event.id}`}
      className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-colors block"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-semibold text-foreground">{event.title}</p>
          {event.location && <p className="text-muted-foreground text-sm mt-0.5">📍 {event.location}</p>}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
          event.status === 'published'  ? 'bg-green-500/10 text-success'  :
          event.status === 'completed'  ? 'bg-muted text-muted-foreground'       :
          event.status === 'cancelled'  ? 'bg-red-500/10 text-danger'      :
                                          'bg-amber-500/10 text-warning'
        }`}>
          {event.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(event.start_time).toLocaleDateString('en-CA', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {event.signup_count ?? 0}
          {event.max_volunteers ? ` / ${event.max_volunteers}` : ''} volunteers
        </div>
        {event.hours_value && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {event.hours_value}h
          </div>
        )}
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const { orgId } = useParams<{ orgId: string }>();

  const { data: billingRes } = useQuery({
    queryKey: ['org-billing-plan', orgId],
    queryFn: () => orgBillingApi.get(orgId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const orgPlan = (billingRes as any)?.data?.plan ?? null;
  const isPro = orgPlan === 'pro' || orgPlan === 'enterprise';

  const { data: res, isLoading } = useQuery({
    queryKey: ['org-events', orgId],
    queryFn: () => orgEventsApi.list(orgId),
    enabled: isPro,
  });
  const events: any[] = (res as any)?.data ?? [];

  const upcoming = events.filter(
    (e) => new Date(e.start_time) > new Date() && e.status !== 'cancelled' && e.status !== 'completed',
  );
  const past = events.filter(
    (e) => new Date(e.start_time) <= new Date() || e.status === 'completed' || e.status === 'cancelled',
  );

  // Show upgrade gate for Basic plan (only after billing data resolves)
  if (orgPlan && !isPro) {
    return (
      <UpgradeGate
        orgId={orgId}
        feature="Events & Shifts"
        description="Create volunteer shifts, auto-text all volunteers when you publish, and check in arrivals on the day. Hours log automatically when complete."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">Volunteer shifts and opportunities</p>
        </div>
        <Link
          href={`/org/${orgId}/events/new`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create event
        </Link>
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />
        ))
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <Calendar className="w-8 h-8 text-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">No upcoming events</p>
                <Link
                  href={`/org/${orgId}/events/new`}
                  className="text-sm bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  Create your first event →
                </Link>
              </div>
            ) : (
              upcoming.map((e) => <EventCard key={e.id} event={e} orgId={orgId} />)
            )}
          </div>

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Past ({past.length})
              </h2>
              {past.map((e) => <EventCard key={e.id} event={e} orgId={orgId} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
