'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orgEventsApi, orgBillingApi } from '@/lib/api';
import { Calendar, Plus, Users, Clock, MapPin, Tag, CheckCircle2, CalendarClock, Radio } from 'lucide-react';
import Link from 'next/link';
import { UpgradeGate } from '@/components/org/upgrade-gate';
import { CountUp } from '@/components/motion';
import { Skeleton } from '@/components/ui/skeleton';

function fmtRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const date = s.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
  const st = s.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  const et = e.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  const sameDay = s.toDateString() === e.toDateString();
  return sameDay ? `${date} · ${st} – ${et}` : `${date} ${st} → ${e.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} ${et}`;
}

function statusBadge(status: string) {
  return (
    status === 'published' ? 'bg-green-500/10 text-success' :
    status === 'completed' ? 'bg-muted text-muted-foreground' :
    status === 'cancelled' ? 'bg-red-500/10 text-danger' :
                             'bg-amber-500/10 text-warning'
  );
}

function StatCard({ icon: Icon, label, value, suffix }: {
  icon: typeof Users; label: string; value: number; suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">
        <CountUp value={value} suffix={suffix} />
      </p>
    </div>
  );
}

function EventCard({ event, orgId, live }: { event: any; orgId: string; live?: boolean }) {
  const signups = event.signupCount ?? 0;
  const spotsLeft = event.spotsLeft;
  return (
    <Link
      href={`/org/${orgId}/events/${event.id}`}
      className={`block rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/20 ${
        live ? 'border-green-500/40 ring-1 ring-green-500/20' : 'border-border'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{event.title}</p>
          {event.description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
          live ? 'bg-green-500/15 text-success' : statusBadge(event.status)
        }`}>
          {live ? 'Happening now' : event.status}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {fmtRange(event.start_time, event.end_time)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        )}
        {event.program && (
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {event.program}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {signups}{event.max_volunteers ? ` / ${event.max_volunteers}` : ''} signed up
          {spotsLeft != null && spotsLeft > 0 && event.status === 'published' && (
            <span className="text-success"> · {spotsLeft} left</span>
          )}
          {spotsLeft === 0 && event.status === 'published' && (
            <span className="text-warning"> · full</span>
          )}
        </span>
        {event.hours_value && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {event.hours_value}h
          </span>
        )}
      </div>
    </Link>
  );
}

function Section({ title, count, accent, children }: {
  title: string; count: number; accent?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${
        accent ? 'text-success' : 'text-muted-foreground'
      }`}>
        {accent && <Radio className="h-3.5 w-3.5 animate-pulse" />}
        {title} ({count})
      </h2>
      {children}
    </div>
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

  const { current, upcoming, past, stats } = useMemo(() => {
    const now = Date.now();
    const current: any[] = [];
    const upcoming: any[] = [];
    const past: any[] = [];
    let totalSignups = 0;
    let completed = 0;
    let hoursOffered = 0;

    for (const e of events) {
      totalSignups += e.signupCount ?? 0;
      if (e.status === 'completed') completed += 1;
      if (e.hours_value) hoursOffered += Number(e.hours_value) || 0;

      const start = new Date(e.start_time).getTime();
      const end = new Date(e.end_time).getTime();
      const finished = e.status === 'completed' || e.status === 'cancelled';

      if (!finished && start <= now && end >= now) current.push(e);
      else if (!finished && start > now) upcoming.push(e);
      else past.push(e);
    }
    // Most recent past events first.
    past.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    return {
      current, upcoming, past,
      stats: { upcoming: upcoming.length, totalSignups, completed, hoursOffered },
    };
  }, [events]);

  if (orgPlan && !isPro) {
    return (
      <UpgradeGate
        orgId={orgId}
        feature="Events & Shifts"
        description="Create volunteer shifts, auto-notify all volunteers by text, email and in-app when you publish, and check in arrivals on the day. Hours log automatically when complete."
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

      {/* Recap stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={CalendarClock} label="Upcoming" value={stats.upcoming} />
          <StatCard icon={Users} label="Total signups" value={stats.totalSignups} />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} />
          <StatCard icon={Clock} label="Hours offered" value={stats.hoursOffered} suffix="h" />
        </div>
      ) : null}

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />
        ))
      ) : (
        <>
          {current.length > 0 && (
            <Section title="Happening now" count={current.length} accent>
              <div className="space-y-3">
                {current.map((e) => <EventCard key={e.id} event={e} orgId={orgId} live />)}
              </div>
            </Section>
          )}

          <Section title="Upcoming" count={upcoming.length}>
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
              <div className="space-y-3">
                {upcoming.map((e) => <EventCard key={e.id} event={e} orgId={orgId} />)}
              </div>
            )}
          </Section>

          {past.length > 0 && (
            <Section title="Previous events" count={past.length}>
              <div className="space-y-3">
                {past.map((e) => <EventCard key={e.id} event={e} orgId={orgId} />)}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
