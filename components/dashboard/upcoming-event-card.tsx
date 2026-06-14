'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { studentEventsApi } from '@/lib/api';
import { Calendar, MapPin, Clock, Users, Award, ChevronRight, CalendarCheck } from 'lucide-react';

interface MyEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: string;
  endTime: string;
  maxVolunteers?: number | null;
  hoursValue?: number | null;
  orgName: string;
  myStatus: 'signed_up' | 'waitlisted' | 'checked_in';
}

function whenLabel(startIso: string, endIso: string): { day: string; time: string; relative: string } {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = start.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  const time =
    `${start.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })} – ` +
    `${end.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}`;

  const today = new Date();
  const isToday = start.toDateString() === today.toDateString();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = start.toDateString() === tomorrow.toDateString();
  const days = Math.ceil((start.getTime() - today.getTime()) / 86_400_000);
  const relative = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : days <= 7 ? `In ${days} days` : '';

  return { day, time, relative };
}

export function UpcomingEventCard() {
  const { data } = useQuery({
    queryKey: ['my-upcoming-events'],
    queryFn: () => studentEventsApi.myUpcoming(),
  });
  const events: MyEvent[] = (data as any)?.data ?? [];

  if (events.length === 0) return null;

  const [next, ...rest] = events;
  const { day, time, relative } = whenLabel(next.startTime, next.endTime);
  const isWaitlist = next.myStatus === 'waitlisted';

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-merit-blue-500/30 bg-gradient-to-br from-merit-blue-500/10 to-transparent">
      <div className="flex items-center justify-between border-b border-merit-blue-500/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-merit-blue-600" />
          <h2 className="text-sm font-semibold text-foreground">Upcoming event</h2>
          {relative && (
            <span className="rounded-full bg-merit-blue-500/15 px-2 py-0.5 text-[11px] font-bold text-merit-blue-600">
              {relative}
            </span>
          )}
        </div>
        {rest.length > 0 && (
          <Link href="/inbox" className="flex items-center gap-0.5 text-xs font-medium text-merit-blue-600 hover:text-merit-blue-700">
            +{rest.length} more <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <Link href={`/events/${next.id}`} className="block px-5 py-4 transition-colors hover:bg-merit-blue-500/5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{next.orgName}</p>
            <h3 className="mt-0.5 text-lg font-bold text-foreground">{next.title}</h3>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isWaitlist
              ? 'bg-amber-500/10 text-warning'
              : 'bg-green-500/10 text-success'
          }`}>
            {isWaitlist ? 'Waitlisted' : next.myStatus === 'checked_in' ? 'Checked in' : "You're going"}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" />{day}</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" />{time}</div>
          {next.location && (
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{next.location}</div>
          )}
          {next.hoursValue != null && (
            <div className="flex items-center gap-2"><Award className="h-4 w-4 shrink-0" />{next.hoursValue}h on completion</div>
          )}
          {next.maxVolunteers != null && (
            <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" />Up to {next.maxVolunteers} volunteers</div>
          )}
        </div>

        {next.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{next.description}</p>
        )}

        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-merit-blue-600">
          View details <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </div>
  );
}
