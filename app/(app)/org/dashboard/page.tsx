'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMeritStore } from '@/lib/store';
import { orgsApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import {
  Users, Clock, CheckCircle2, AlertCircle, ExternalLink,
  Edit3, Download, Building2, Globe, Mail, Phone, Shield,
  BarChart3, UserPlus, Settings2, Flag, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin w-5 h-5 border-2 border-border border-t-ink-700 rounded-full" />
    </div>
  );
}

function DashSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-5 space-y-3">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-16 w-full bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

type Tab = 'overview' | 'volunteers' | 'team' | 'settings';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrgDashboardPage() {
  const user = useMeritStore((s) => s.user);
  const qc = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'coordinator' | 'admin'>('coordinator');
  const [isInviting, setIsInviting] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [description, setDescription] = useState('');

  // ── Orgs this user admins ────────────────────────────────────────────────
  const { data: adminOrgs, isLoading: loadingOrgs } = useQuery({
    queryKey: ['org-admin-list'],
    queryFn: async () => {
      const res = await orgsApi.adminMine();
      const orgs = (res as any).data as any[];
      if (orgs.length && !selectedOrgId) setSelectedOrgId(orgs[0].id);
      return orgs;
    },
  });

  const orgId = selectedOrgId ?? adminOrgs?.[0]?.id ?? null;

  // ── Dashboard data ───────────────────────────────────────────────────────
  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['org-dashboard', orgId],
    queryFn: async () => {
      const res = await orgsApi.dashboard(orgId!);
      const data = (res as any).data;
      setDescription(data.org?.description ?? '');
      return data;
    },
    enabled: !!orgId,
  });

  // ── Volunteers ───────────────────────────────────────────────────────────
  const { data: volunteersData, isLoading: loadingVolunteers } = useQuery({
    queryKey: ['org-volunteers', orgId],
    queryFn: async () => {
      const res = await orgsApi.volunteers(orgId!);
      return res.data.volunteers;
    },
    enabled: !!orgId && activeTab === 'volunteers',
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const verifySession = useMutation({
    mutationFn: (sessionId: string) => orgsApi.verifySession(orgId!, sessionId),
    onSuccess: () => {
      toast.success('Session verified');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
      qc.invalidateQueries({ queryKey: ['org-volunteers', orgId] });
    },
    onError: () => toast.error('Failed to verify'),
  });

  const disputeSession = useMutation({
    mutationFn: (sessionId: string) => orgsApi.disputeSession(orgId!, sessionId),
    onSuccess: () => {
      toast.success('Session disputed');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
      qc.invalidateQueries({ queryKey: ['org-volunteers', orgId] });
    },
    onError: () => toast.error('Failed to dispute'),
  });

  const saveDescription = useMutation({
    mutationFn: () => orgsApi.updateOrg(orgId!, { description }),
    onSuccess: () => {
      toast.success('Description saved');
      setEditingDesc(false);
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    },
    onError: () => toast.error('Failed to save'),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => orgsApi.removeTeamMember(orgId!, userId),
    onSuccess: () => {
      toast.success('Team member removed');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    },
    onError: (err: any) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to remove';
      toast.error(msg);
    },
  });

  const recruitingToggle = useMutation({
    mutationFn: (val: boolean) => orgsApi.updateOrg(orgId!, { isRecruiting: val }),
    onSuccess: () => {
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    },
    onError: () => toast.error('Failed to update'),
  });

  // ── Invite handler ───────────────────────────────────────────────────────
  async function handleInvite() {
    if (!inviteEmail.trim() || !orgId) return;
    setIsInviting(true);
    try {
      const res = await orgsApi.inviteTeamMember(orgId, inviteEmail.trim(), inviteRole);
      toast.success(`${res.data.name} added as ${inviteRole}`);
      setInviteEmail('');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Failed to invite';
      toast.error(msg);
    } finally {
      setIsInviting(false);
    }
  }

  // ── CSV export ───────────────────────────────────────────────────────────
  async function handleExport() {
    if (!orgId) return;
    try {
      const blob = await orgsApi.exportCSV(orgId);
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
  }

  // ── Loading / empty ──────────────────────────────────────────────────────
  if (loadingOrgs) return <div className="px-4 py-6 md:px-8"><DashSkeleton /></div>;

  if (!adminOrgs?.length) {
    return (
      <div className="px-4 py-6 md:px-8 flex flex-col items-center justify-center py-20 gap-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-semibold text-xl text-foreground">No organizations yet</h2>
        <p className="text-muted-foreground text-sm">
          Create a new organization or claim an existing one to access your admin dashboard.
        </p>
        <Button asChild>
          <Link href="/organizations">Find or create your org</Link>
        </Button>
      </div>
    );
  }

  const org = dashboard?.org;
  const stats = dashboard?.stats;
  const admins = dashboard?.admins ?? [];
  const recentSessions = dashboard?.recentSessions ?? [];

  const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', Icon: BarChart3 },
    { id: 'volunteers', label: 'Volunteers', Icon: Users },
    { id: 'team', label: 'Team', Icon: Shield },
    { id: 'settings', label: 'Settings', Icon: Settings2 },
  ];

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-5xl mx-auto space-y-6">

      {/* ── Org header card ────────────────────────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden bg-card">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-ink-800 to-ink-600 relative">
          {org?.cover_url && (
            <Image src={org.cover_url} alt="" fill className="object-cover" sizes="100vw" />
          )}
        </div>

        {/* Info bar */}
        <div className="px-5 pb-4 pt-3 flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl border-4 border-white bg-card shadow-sm flex items-center justify-center -mt-8 shrink-0 overflow-hidden relative">
            {org?.logo_url ? (
              <Image src={org.logo_url} alt={org.name ?? ''} fill className="object-cover" sizes="64px" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {org?.name?.[0] ?? '?'}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-foreground">{org?.name ?? '—'}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {org?.category ?? ''}
                  {org?.city ? ` · ${org.city}` : ''}
                </p>
                {org?.website_url && (
                  <a href={org.website_url} target="_blank" rel="noreferrer"
                    className="text-xs text-merit-blue-600 flex items-center gap-1 mt-1 hover:underline">
                    <Globe className="w-3 h-3" />
                    {org.website_url.replace(/https?:\/\//, '')}
                  </a>
                )}
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                {org?.slug && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orgs/${org.slug}`} target="_blank">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Public page
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Org switcher — if user admins multiple */}
        {adminOrgs.length > 1 && (
          <div className="px-5 pb-4 flex gap-2 overflow-x-auto">
            {adminOrgs.map((o: any) => (
              <button
                key={o.id}
                onClick={() => { setSelectedOrgId(o.id); setActiveTab('overview'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  orgId === o.id ? 'bg-foreground text-background' : 'bg-muted text-foreground hover:bg-muted'
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'border-ink-900 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total students', value: stats?.totalStudents ?? 0, Icon: Users, color: 'text-blue-600' },
              { label: 'Total hours', value: `${stats?.totalHours ?? 0}h`, Icon: Clock, color: 'text-green-600' },
              { label: 'Verified sessions', value: stats?.verifiedSessions ?? 0, Icon: CheckCircle2, color: 'text-emerald-600' },
              { label: 'Pending sessions', value: stats?.pendingSessions ?? 0, Icon: AlertCircle, color: 'text-amber-600' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <stat.Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent sessions with verify/dispute */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Recent sessions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Verify or dispute student-logged hours</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('volunteers')}>
                View all →
              </Button>
            </div>

            {loadingDashboard ? (
              <Spinner />
            ) : recentSessions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No sessions yet. Share your org page so students can log hours here.
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-full bg-merit-blue-100 flex items-center justify-center text-sm font-bold text-merit-blue-700 shrink-0">
                      {session.users?.name?.[0] ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.users?.name ?? 'Student'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.activity} · {fmtDate(session.date)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">{session.hours}h</span>

                    {session.status === 'pending' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm" variant="outline"
                          className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => verifySession.mutate(session.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />Verify
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => disputeSession.mutate(session.id)}
                        >
                          <Flag className="w-3 h-3 mr-1" />Dispute
                        </Button>
                      </div>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                        session.status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {session.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VOLUNTEERS ─────────────────────────────────────────────────────── */}
      {activeTab === 'volunteers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {volunteersData?.length ?? 0} students have volunteered here
            </p>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1.5" />Export CSV
            </Button>
          </div>

          {loadingVolunteers ? (
            <div className="rounded-xl border bg-card"><Spinner /></div>
          ) : !volunteersData?.length ? (
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground text-sm">
              No volunteers yet.
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden divide-y divide-ink-50">
              {volunteersData.map((v: any) => (
                <div key={v.student.id} className="p-4">
                  {/* Student row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-merit-blue-100 flex items-center justify-center font-bold text-merit-blue-700 shrink-0">
                      {v.student.name?.[0] ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-foreground">{v.student.name}</p>
                        {v.student.username && (
                          <Link href={`/u/${v.student.username}`}
                            className="text-xs text-merit-blue-600 hover:underline">
                            View profile →
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {v.student.school}
                        {v.student.grade ? ` · Grade ${v.student.grade}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-foreground">{v.verifiedHours}h verified</p>
                      <p className="text-xs text-muted-foreground">
                        {v.totalHours}h total · {v.sessions.length} sessions
                      </p>
                    </div>
                  </div>

                  {/* Sessions for this volunteer */}
                  <div className="ml-13 space-y-1.5 pl-1">
                    {v.sessions.map((s: any) => (
                      <div key={s.id}
                        className="flex items-center gap-3 text-sm bg-background rounded-lg px-3 py-2">
                        <span className="text-muted-foreground text-xs w-20 shrink-0">
                          {fmtDate(s.date)}
                        </span>
                        <span className="flex-1 text-xs text-foreground truncate">{s.activity}</span>
                        <span className="font-medium text-xs text-foreground shrink-0">{s.hours}h</span>
                        {s.status === 'pending' ? (
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => verifySession.mutate(s.id)}
                              className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-colors"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => disputeSession.mutate(s.id)}
                              className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors"
                            >
                              Dispute
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            s.status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {s.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TEAM ───────────────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Invite */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add team member
            </h3>
            <p className="text-sm text-muted-foreground">
              They need an existing Merit account. Enter their email address.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Input
                placeholder="colleague@organization.org"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
                className="flex-1 min-w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'coordinator' | 'admin')}
                className="border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-merit-blue-600"
              >
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
              <Button onClick={handleInvite} disabled={isInviting} className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white">
                {isInviting ? 'Adding...' : 'Add'}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong className="text-muted-foreground">Coordinator</strong> — view volunteers and verify sessions</p>
              <p><strong className="text-muted-foreground">Admin</strong> — full access, can add/remove team members</p>
            </div>
          </div>

          {/* Current team */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-background">
              <h3 className="font-semibold text-sm text-foreground">Current team</h3>
            </div>
            <div className="divide-y divide-ink-50">
              {admins.map((admin: any) => (
                <div key={admin.users?.email ?? admin.role}
                  className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-merit-blue-100 flex items-center justify-center text-sm font-bold text-merit-blue-700 shrink-0">
                    {admin.users?.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {admin.users?.name}
                      {admin.users?.email === user?.email && (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{admin.users?.email}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-medium capitalize text-foreground">
                    {admin.role}
                  </span>
                  {admin.users?.email !== user?.email && dashboard?.userRole !== 'coordinator' && (
                    <Button
                      variant="ghost" size="sm"
                      className="text-danger hover:text-danger hover:bg-danger/10 h-8 w-8 p-0 shrink-0"
                      onClick={() => removeMember.mutate(admin.users?.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ───────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          {/* Description */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Description</h3>
              {!editingDesc ? (
                <Button variant="ghost" size="sm" onClick={() => setEditingDesc(true)}>
                  <Edit3 className="w-4 h-4 mr-1.5" />Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingDesc(false)}>Cancel</Button>
                  <Button size="sm" onClick={() => saveDescription.mutate()} disabled={saveDescription.isPending}>
                    {saveDescription.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            {editingDesc ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg border border-border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-merit-blue-600"
                  placeholder="Describe what your organization does..."
                />
                <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {description || 'No description yet. Click Edit to add one.'}
              </p>
            )}
          </div>

          {/* Contact info */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Contact info</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { Icon: Globe, label: 'Website', value: org?.website_url },
                { Icon: Mail, label: 'Contact email', value: org?.contact_email },
                { Icon: Phone, label: 'Phone', value: org?.contact_phone },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-28 shrink-0">{label}</span>
                  <span className="truncate text-foreground">
                    {value || <span className="text-muted-foreground italic">Not set</span>}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm"
              onClick={() => toast.info('Full profile editing coming soon')}>
              Edit contact info
            </Button>
          </div>

          {/* Recruiting toggle */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Actively recruiting</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Shows a "Looking for volunteers" badge on your org page
                </p>
              </div>
              <button
                onClick={() => recruitingToggle.mutate(!org?.is_recruiting)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  org?.is_recruiting ? 'bg-success' : 'bg-muted'
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-card shadow-sm transition-transform ${
                  org?.is_recruiting ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
