'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentEventsApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import {
  Calendar, Clock, MapPin, Users, CheckCircle2, Loader2, Building2, Tag, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

function fmtRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const date = s.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  const st = s.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  const et = e.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  return { date, time: `${st} – ${et}` };
}

export default function StudentEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const qc = useQueryClient();

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['student-event', eventId],
    queryFn: () => studentEventsApi.get(eventId),
    retry: false,
  });
  const event: any = (res as any)?.data;

  const signup = useMutation({
    mutationFn: () => studentEventsApi.signup(eventId),
    onSuccess: (r) => {
      const waitlisted = (r as any)?.data?.isWaitlisted;
      toast.success(waitlisted ? "You're on the waitlist — we'll text you if a spot opens." : "You're signed up! 🎉");
      qc.invalidateQueries({ queryKey: ['student-event', eventId] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not sign you up'),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Calendar className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Event not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">This event may have been removed or the link is incorrect.</p>
        <Link href="/dashboard" className="mt-6 inline-block text-sm text-merit-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { date, time } = fmtRange(event.startTime, event.endTime);
  const isSignedUp = event.mySignupStatus === 'signed_up' || event.mySignupStatus === 'checked_in';
  const isWaitlisted = event.mySignupStatus === 'waitlisted';
  const isFull = event.spotsLeft === 0 && !isSignedUp && !isWaitlisted;
  const isOpen = event.status === 'published';

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {event.orgSlug ? (
            <Link href={`/organizations/${event.orgSlug}`} className="hover:text-foreground hover:underline">
              {event.orgName}
            </Link>
          ) : event.orgName}
        </div>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{event.title}</h1>
        {event.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
        )}

        <div className="mt-5 grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" /> {date}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" /> {time}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {event.locationUrl ? (
                <a href={event.locationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground hover:underline">
                  {event.location} <ExternalLink className="h-3 w-3" />
                </a>
              ) : event.location}
            </div>
          )}
          {event.program && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4 shrink-0" /> {event.program}
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            {event.signupCount} signed up{event.maxVolunteers ? ` / ${event.maxVolunteers}` : ''}
          </div>
          {event.hoursValue && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" /> {event.hoursValue}h of service
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      {isSignedUp ? (
        <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
          <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
          <div>
            <p className="font-semibold text-foreground">You&apos;re signed up</p>
            <p className="text-sm text-muted-foreground">See you on {date}. We&apos;ll send a reminder.</p>
          </div>
        </div>
      ) : isWaitlisted ? (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <Clock className="h-6 w-6 text-warning shrink-0" />
          <div>
            <p className="font-semibold text-foreground">You&apos;re on the waitlist</p>
            <p className="text-sm text-muted-foreground">This event is full — we&apos;ll notify you if a spot opens.</p>
          </div>
        </div>
      ) : !isOpen ? (
        <div className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
          This event isn&apos;t open for signups{event.status === 'completed' ? ' — it has already happened.' : '.'}
        </div>
      ) : (
        <button
          onClick={() => signup.mutate()}
          disabled={signup.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.99]"
        >
          {signup.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          {isFull ? 'Join the waitlist' : 'Yes, I want to participate'}
        </button>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Logging hours through {event.orgName}? They&apos;ll be verified automatically when you check in.
      </p>
    </div>
  );
}
