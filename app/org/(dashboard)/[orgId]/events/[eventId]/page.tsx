'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgEventsApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import {
  Calendar, MapPin, Users, Clock, CheckCircle2,
  ArrowLeft, Send, UserCheck, Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const { orgId, eventId } = useParams<{ orgId: string; eventId: string }>();
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['org-event', orgId, eventId],
    queryFn: () => orgEventsApi.get(orgId, eventId),
  });
  const event: any = (res as any)?.data;

  const publishEvent = useMutation({
    mutationFn: () => orgEventsApi.publish(orgId, eventId),
    onSuccess: (r) => {
      toast.success(`Event published! ${(r as any)?.data?.notified ?? 0} volunteers notified.`);
      qc.invalidateQueries({ queryKey: ['org-event', orgId, eventId] });
      qc.invalidateQueries({ queryKey: ['org-events', orgId] });
    },
    onError: () => toast.error('Failed to publish'),
  });

  const checkIn = useMutation({
    mutationFn: (userId: string) => orgEventsApi.checkIn(orgId, eventId, userId),
    onSuccess: () => {
      toast.success('Checked in!');
      qc.invalidateQueries({ queryKey: ['org-event', orgId, eventId] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Check-in failed'),
  });

  const completeEvent = useMutation({
    mutationFn: () => orgEventsApi.complete(orgId, eventId),
    onSuccess: (r) => {
      toast.success(`Event completed! ${(r as any)?.data?.sessionsCreated ?? 0} sessions auto-logged.`);
      qc.invalidateQueries({ queryKey: ['org-event', orgId, eventId] });
      qc.invalidateQueries({ queryKey: ['org-events', orgId] });
    },
    onError: () => toast.error('Failed to complete event'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }
  if (!event) return <p className="text-muted-foreground">Event not found.</p>;

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const isUpcoming = startDate > new Date();
  const isToday = startDate.toDateString() === new Date().toDateString();

  const signups: any[] = event.signups ?? [];
  const confirmed = signups.filter((s) => s.status === 'signed_up');
  const checkedIn = signups.filter((s) => s.status === 'checked_in');
  const waitlisted = signups.filter((s) => s.status === 'waitlisted');
  const allActive = [...confirmed, ...checkedIn];

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={`/org/${orgId}/events`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </Link>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
            {event.description && (
              <p className="text-muted-foreground text-sm mt-2">{event.description}</p>
            )}
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium shrink-0 ${
            event.status === 'published'  ? 'bg-green-500/10 text-success'  :
            event.status === 'completed'  ? 'bg-muted text-muted-foreground'       :
            event.status === 'cancelled'  ? 'bg-red-500/10 text-danger'      :
                                            'bg-amber-500/10 text-warning'
          }`}>
            {event.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            {startDate.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            {startDate.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}
            {' – '}
            {endDate.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              {event.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 shrink-0" />
            {allActive.length} signed up{event.max_volunteers ? ` / ${event.max_volunteers}` : ''}
          </div>
        </div>

        <div className="flex gap-3 mt-5 pt-5 border-t border-border">
          {event.status === 'draft' && (
            <button
              onClick={() => publishEvent.mutate()}
              disabled={publishEvent.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {publishEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish + notify volunteers
            </button>
          )}
          {event.status === 'published' && (isToday || !isUpcoming) && (
            <button
              onClick={() => {
                if (confirm(`Complete event? ${checkedIn.length} sessions will be auto-logged.`)) {
                  completeEvent.mutate();
                }
              }}
              disabled={completeEvent.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-success border border-green-500/20 text-sm font-semibold hover:bg-green-500/20 disabled:opacity-50 transition-colors"
            >
              {completeEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete event + log hours
            </button>
          )}
        </div>
      </div>

      {/* Volunteer list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Volunteers ({allActive.length})</h3>
          {isToday && event.status === 'published' && (
            <span className="text-xs text-warning font-medium bg-amber-500/10 px-2.5 py-1 rounded-full">
              Day-of check-in active
            </span>
          )}
        </div>

        {allActive.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No volunteers signed up yet</div>
        ) : (
          <div className="divide-y divide-border">
            {allActive.map((signup: any) => {
              const u = signup.users;
              const isCheckedIn = signup.status === 'checked_in';
              const showCheckIn = (isToday || !isUpcoming) && event.status === 'published';
              return (
                <div key={signup.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm shrink-0">
                    {u?.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium">{u?.name ?? 'Unknown'}</p>
                    <p className="text-muted-foreground text-xs">
                      {u?.school ?? ''}{u?.grade ? ` · Grade ${u.grade}` : ''}
                    </p>
                  </div>
                  {isCheckedIn ? (
                    <span className="flex items-center gap-1.5 text-xs text-success font-medium bg-green-500/10 px-2.5 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Checked in
                    </span>
                  ) : showCheckIn ? (
                    <button
                      onClick={() => checkIn.mutate(u?.id)}
                      disabled={checkIn.isPending}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-foreground text-background font-medium hover:opacity-90 disabled:opacity-50 transition-colors shrink-0"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Check in
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {waitlisted.length > 0 && (
          <div className="border-t border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-5 py-3">
              Waitlist ({waitlisted.length})
            </p>
            {waitlisted.map((signup: any) => (
              <div key={signup.id} className="flex items-center gap-4 px-5 py-3 opacity-60">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm shrink-0">
                  {signup.users?.name?.[0] ?? '?'}
                </div>
                <p className="text-muted-foreground text-sm">{signup.users?.name}</p>
                <span className="ml-auto text-xs text-muted-foreground">Waitlisted</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
