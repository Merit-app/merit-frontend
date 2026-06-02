'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgsApi, orgReportsApi, orgEventsApi, orgVolunteersApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import {
  Users, Clock, CheckCircle2, AlertCircle,
  Calendar, ArrowRight, Download, Plus,
} from 'lucide-react';
import Link from 'next/link';

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

export default function OrgOverviewPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();

  const { data: dashboard } = useQuery({
    queryKey: ['org-dashboard', orgId],
    queryFn: () => orgsApi.dashboard(orgId),
  });

  const { data: eventsRes } = useQuery({
    queryKey: ['org-events-upcoming', orgId],
    queryFn: () => orgEventsApi.list(orgId, { upcoming: true }),
  });

  const verifySession = useMutation({
    mutationFn: (sessionId: string) => orgVolunteersApi.verify(orgId, sessionId),
    onSuccess: () => {
      toast.success('Session verified');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to verify'),
  });

  const disputeSession = useMutation({
    mutationFn: (sessionId: string) => orgVolunteersApi.dispute(orgId, sessionId),
    onSuccess: () => {
      toast.success('Session disputed');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    },
    onError: () => toast.error('Failed to dispute'),
  });

  const handleGrantReport = async () => {
    try {
      const from = `${new Date().getFullYear()}-01-01`;
      const to = new Date().toISOString().split('T')[0];
      const blob = await orgReportsApi.grantReport(orgId, from, to);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grant-report-${to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Grant report downloaded');
    } catch {
      toast.error('Failed to generate report');
    }
  };

  const dash = (dashboard as any)?.data;
  const stats = dash?.stats;
  const recentSessions: any[] = dash?.recentSessions ?? [];
  const pendingSessions = recentSessions.filter((s) => s.status === 'pending');
  const events: any[] = (eventsRes as any)?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Your organization at a glance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGrantReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Grant report
          </button>
          <Link
            href={`/org/${orgId}/events/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total volunteers', value: stats?.totalStudents ?? 0, Icon: Users, color: 'text-blue-400', highlight: false },
          { label: 'Verified hours', value: `${stats?.totalHours ?? 0}h`, Icon: Clock, color: 'text-green-400', highlight: false },
          { label: 'Verified sessions', value: stats?.verifiedSessions ?? 0, Icon: CheckCircle2, color: 'text-emerald-400', highlight: false },
          { label: 'Pending sessions', value: stats?.pendingSessions ?? 0, Icon: AlertCircle, color: 'text-amber-400', highlight: (stats?.pendingSessions ?? 0) > 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-5 space-y-3 ${
              stat.highlight ? 'bg-amber-500/5 border-amber-500/20' : 'bg-gray-900 border-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <stat.Icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-gray-400 text-xs">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending verifications */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <div>
              <h3 className="font-semibold text-white">Pending verifications</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sessions waiting for your review</p>
            </div>
            <Link href={`/org/${orgId}/volunteers`} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingSessions.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500/30 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">All caught up! No pending sessions.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {pendingSessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                    {session.users?.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{session.users?.name ?? 'Student'}</p>
                    <p className="text-gray-500 text-xs truncate">{session.activity} · {fmtDate(session.date)}</p>
                  </div>
                  <span className="text-white text-sm font-bold shrink-0">{session.hours}h</span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => verifySession.mutate(session.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 font-medium hover:bg-green-500/20 transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => disputeSession.mutate(session.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Dispute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming events */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <div>
              <h3 className="font-semibold text-white">Upcoming events</h3>
              <p className="text-xs text-gray-400 mt-0.5">Scheduled shifts</p>
            </div>
            <Link href={`/org/${orgId}/events`} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!events.length ? (
            <div className="p-8 text-center">
              <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-4">No upcoming events</p>
              <Link
                href={`/org/${orgId}/events/new`}
                className="text-xs bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create your first event →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {events.slice(0, 4).map((event: any) => (
                <Link
                  key={event.id}
                  href={`/org/${orgId}/events/${event.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(event.start_time).toLocaleDateString('en-CA', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-white font-bold text-sm">{new Date(event.start_time).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{event.title}</p>
                    <p className="text-gray-500 text-xs">{event.signup_count ?? 0} signed up</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    event.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {event.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
