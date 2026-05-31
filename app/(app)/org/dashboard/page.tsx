'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { orgsApi } from '@/lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-100 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-5 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrgDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  // Get list of orgs the user admins
  const { data: adminOrgs, isLoading: loadingOrgs } = useQuery({
    queryKey: ['org-admin-list'],
    queryFn: async () => {
      const res = await orgsApi.adminMine();
      return (res as any).data as { id: string; name: string; slug: string }[];
    },
  });

  useEffect(() => {
    if (adminOrgs?.length && !selectedOrgId) {
      setSelectedOrgId(adminOrgs[0].id);
    }
  }, [adminOrgs, selectedOrgId]);

  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['org-dashboard', selectedOrgId],
    queryFn: async () => {
      const res = await orgsApi.dashboard(selectedOrgId!);
      return (res as any).data;
    },
    enabled: !!selectedOrgId,
  });

  useEffect(() => {
    if (dashboard?.org?.description != null) {
      setDescription(dashboard.org.description ?? '');
    }
  }, [dashboard]);

  const saveMutation = useMutation({
    mutationFn: () => orgsApi.updateOrg(selectedOrgId!, { description }),
    onSuccess: () => {
      toast.success('Description updated');
      setIsEditingDescription(false);
      queryClient.invalidateQueries({ queryKey: ['org-dashboard', selectedOrgId] });
    },
    onError: () => toast.error('Failed to save'),
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  if (loadingOrgs) return <div className="px-4 py-6 md:px-8"><DashboardSkeleton /></div>;

  if (!adminOrgs?.length) {
    return (
      <div className="px-4 py-6 md:px-8 flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-semibold text-lg text-ink-900">No organizations yet</h2>
        <p className="text-ink-500 text-sm max-w-sm">
          Create a new organization or claim an existing one to access your admin dashboard.
        </p>
        <Button asChild>
          <Link href="/organizations">Find or create your org</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Org Dashboard</h1>
          <p className="text-ink-500 text-sm mt-1">Manage your organization on Merit</p>
        </div>
        {dashboard?.org && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/orgs/${dashboard.org.slug}`} target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              View public page
            </Link>
          </Button>
        )}
      </div>

      {/* Org selector — if user admins multiple */}
      {adminOrgs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {adminOrgs.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrgId(org.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedOrgId === org.id
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}

      {loadingDashboard && <DashboardSkeleton />}

      {dashboard && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total students',    value: dashboard.stats.totalStudents,    icon: Users },
              { label: 'Total hours',       value: `${dashboard.stats.totalHours}h`, icon: Clock },
              { label: 'Verified sessions', value: dashboard.stats.verifiedSessions, icon: CheckCircle2 },
              { label: 'Pending sessions',  value: dashboard.stats.pendingSessions,  icon: AlertCircle },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-white p-5 space-y-2">
                <div className="flex items-center gap-2 text-ink-400">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-ink-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Description editor */}
          <div className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">Organization description</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDescription(!isEditingDescription)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditingDescription ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            {isEditingDescription ? (
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg border border-ink-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ink-400"
                  placeholder="Describe what your organization does..."
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-400">{description.length}/500</span>
                  <Button
                    size="sm"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Save description'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-500">
                {description || 'No description yet. Click Edit to add one.'}
              </p>
            )}
          </div>

          {/* Recent sessions */}
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="p-5 border-b border-ink-100">
              <h3 className="font-semibold text-ink-900">Recent volunteer sessions</h3>
              <p className="text-xs text-ink-500 mt-1">
                Students who have logged hours at your organization
              </p>
            </div>
            {dashboard.recentSessions.length === 0 ? (
              <div className="p-8 text-center text-ink-400 text-sm">
                No sessions yet. Share your org page so students can start logging hours here.
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {dashboard.recentSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center shrink-0 text-xs font-semibold text-ink-600">
                      {session.users?.name?.[0] ?? '?'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {session.users?.name ?? 'Student'}
                      </p>
                      <p className="text-xs text-ink-400 truncate">
                        {session.activity} · {formatDate(session.date)}
                      </p>
                    </div>
                    {/* Hours */}
                    <span className="text-sm font-medium text-ink-700 shrink-0">
                      {session.hours}h
                    </span>
                    {/* Status */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full shrink-0 font-medium ${
                        session.status === 'verified'
                          ? 'bg-green-50 text-green-700'
                          : session.status === 'disputed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team members */}
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="font-semibold text-ink-900">Team</h3>
            <div className="space-y-3">
              {(dashboard.admins ?? []).map((admin: any) => (
                <div key={admin.users?.email ?? admin.role} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-xs font-semibold text-ink-600">
                    {admin.users?.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">{admin.users?.name ?? '—'}</p>
                    <p className="text-xs text-ink-400 capitalize">{admin.role}</p>
                  </div>
                  {dashboard.userRole === admin.role && (
                    <span className="text-xs text-ink-400">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
