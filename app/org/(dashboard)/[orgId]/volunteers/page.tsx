'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgVolunteersApi } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Download, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Mail, Phone, GraduationCap, Users, Clock, CalendarCheck, Hourglass } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CountUp } from '@/components/motion';

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  decimals = 0,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        accent && value > 0
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent && value > 0 ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </p>
    </div>
  );
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

export default function VolunteersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: volunteersRes, isLoading } = useQuery({
    queryKey: ['org-volunteers', orgId],
    queryFn: () => orgVolunteersApi.list(orgId),
  });
  // API shape is { data: { volunteers: [...] } } — read the nested array, and
  // guard with Array.isArray so a non-array can never crash .filter().
  const rawVolunteers = (volunteersRes as any)?.data?.volunteers ?? (volunteersRes as any)?.data;
  const volunteers: any[] = Array.isArray(rawVolunteers) ? rawVolunteers : [];

  const verifySession = useMutation({
    mutationFn: (sessionId: string) => orgVolunteersApi.verify(orgId, sessionId),
    onSuccess: () => { toast.success('Verified'); qc.invalidateQueries({ queryKey: ['org-volunteers', orgId] }); },
    onError: () => toast.error('Failed to verify'),
  });

  const disputeSession = useMutation({
    mutationFn: (sessionId: string) => orgVolunteersApi.dispute(orgId, sessionId),
    onSuccess: () => { toast.success('Disputed'); qc.invalidateQueries({ queryKey: ['org-volunteers', orgId] }); },
    onError: () => toast.error('Failed to dispute'),
  });

  const handleExport = async () => {
    try {
      const blob = await orgVolunteersApi.export(orgId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volunteers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const filtered = volunteers.filter((v) =>
    !search || v.student?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Recap stats — all derived from the already-loaded volunteer list, no extra fetch.
  const stats = useMemo(() => {
    let verifiedHours = 0;
    let pending = 0;
    let totalSessions = 0;
    let activeVolunteers = 0;
    for (const v of volunteers) {
      verifiedHours += Number(v.verifiedHours) || 0;
      const sessions = Array.isArray(v.sessions) ? v.sessions : [];
      totalSessions += sessions.length;
      if (sessions.length > 0) activeVolunteers += 1;
      pending += sessions.filter((s: any) => s.status === 'pending').length;
    }
    return { verifiedHours, pending, totalSessions, activeVolunteers };
  }, [volunteers]);

  const hoursDecimals = Number.isInteger(stats.verifiedHours) ? 0 : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Volunteers</h1>
          <p className="text-muted-foreground text-sm mt-1">{volunteers.length} people have volunteered here</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground text-sm font-medium hover:bg-muted hover:text-foreground transition-colors active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
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
      ) : volunteers.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Users} label="Total volunteers" value={volunteers.length} />
          <StatCard icon={CheckCircle2} label="Verified hours" value={stats.verifiedHours} suffix="h" decimals={hoursDecimals} />
          <StatCard icon={Hourglass} label="Pending review" value={stats.pending} accent />
          <StatCard icon={CalendarCheck} label="Sessions logged" value={stats.totalSessions} />
        </div>
      ) : null}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search volunteers..."
          className="w-full bg-card border border-border text-foreground rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-colors"
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-20 shrink-0" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl">
            <EmptyState
              icon={Users}
              title={search ? 'No matching volunteers' : 'No volunteers yet'}
              description={
                search
                  ? 'Try a different name.'
                  : 'When students log hours at your organization, they show up here for you to verify.'
              }
            />
          </div>
        ) : (
          filtered.map((v: any) => (
            <div key={v.student.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === v.student.id ? null : v.student.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shrink-0">
                  {v.student.name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{v.student.name}</p>
                    {v.student.username && (
                      <a
                        href={`/u/${v.student.username}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {v.student.school}{v.student.grade ? ` · Grade ${v.student.grade}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-foreground font-bold text-sm">{v.verifiedHours}h verified</p>
                  <p className="text-muted-foreground text-xs">{v.sessions?.length ?? 0} sessions</p>
                </div>
                {expanded === v.student.id
                  ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {expanded === v.student.id && (
                <div className="border-t border-border">
                  {/* Contact info */}
                  <div className="px-4 py-3 bg-muted/30 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    {v.student.email ? (
                      <a href={`mailto:${v.student.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        {v.student.email}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" />No email</span>
                    )}
                    {v.student.phone ? (
                      <a href={`tel:${v.student.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {v.student.phone}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" />No phone</span>
                    )}
                    {(v.student.school || v.student.grade) && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                        {v.student.school}{v.student.grade ? ` · Grade ${v.student.grade}` : ''}
                      </span>
                    )}
                  </div>

                  {v.isInterested && (v.sessions ?? []).length === 0 ? (
                    <p className="px-4 py-3 text-xs text-muted-foreground border-t border-border/50">
                      Registered interest — no hours logged yet.
                    </p>
                  ) : (
                  <div className="divide-y divide-border/50 border-t border-border/50">
                  {(v.sessions ?? []).map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3 bg-card/50">
                      <span className="text-muted-foreground text-xs w-24 shrink-0">{fmtDate(s.date)}</span>
                      <span className="flex-1 text-muted-foreground text-xs truncate">{s.activity}</span>
                      <span className="text-foreground font-medium text-xs shrink-0">{s.hours}h</span>
                      {s.status === 'pending' ? (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => verifySession.mutate(s.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-success font-medium hover:bg-green-500/20 transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => disputeSession.mutate(s.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-danger font-medium hover:bg-red-500/20 transition-colors"
                          >
                            Dispute
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          s.status === 'verified' ? 'bg-green-500/10 text-success' : 'bg-red-500/10 text-danger'
                        }`}>
                          {s.status}
                        </span>
                      )}
                    </div>
                  ))}
                  </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
