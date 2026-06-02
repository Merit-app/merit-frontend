'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgsApi, orgInvitesApi, ApiError } from '@/lib/api';
import { useMeritStore } from '@/lib/store';
import { toast } from 'sonner';
import { UserPlus, X, Loader2 } from 'lucide-react';

export default function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();
  const user = useMeritStore((s) => s.user);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'coordinator' | 'admin'>('coordinator');
  const [isInviting, setIsInviting] = useState(false);

  const { data: dashRes } = useQuery({
    queryKey: ['org-dashboard', orgId],
    queryFn: () => orgsApi.dashboard(orgId),
  });
  const dashboard: any = (dashRes as any)?.data;
  const admins: any[] = dashboard?.admins ?? [];
  const org = dashboard?.org;

  const removeMember = useMutation({
    mutationFn: (userId: string) => orgsApi.removeTeamMember(orgId, userId),
    onSuccess: () => {
      toast.success('Team member removed');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to remove'),
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await orgInvitesApi.create(orgId, inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to invite');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your organization and team</p>
      </div>

      {/* Org info */}
      {org && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-white">Organization</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Name', value: org.name },
              { label: 'Category', value: org.category },
              { label: 'City', value: org.city },
              { label: 'Website', value: org.website_url },
              { label: 'Contact', value: org.contact_email },
            ]
              .filter((f) => f.value)
              .map((f) => (
                <div key={f.label} className="flex gap-4">
                  <span className="text-gray-500 w-20 shrink-0">{f.label}</span>
                  <span className="text-gray-300 truncate">{f.value}</span>
                </div>
              ))}
          </div>
          {org.slug && (
            <a
              href={`/orgs/${org.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Edit on public page →
            </a>
          )}
        </div>
      )}

      {/* Invite team member */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite team member
        </h3>
        <p className="text-gray-500 text-sm">
          They&apos;ll receive an email with a link to join your org dashboard.
        </p>
        <div className="flex gap-3 flex-wrap">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@org.com"
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            className="flex-1 min-w-0 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'coordinator' | 'admin')}
            className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 text-sm focus:outline-none"
          >
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={isInviting || !inviteEmail}
            className="px-4 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
          </button>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <span className="text-gray-400">Coordinator</span> — verify sessions, view volunteers, run events
          </p>
          <p>
            <span className="text-gray-400">Admin</span> — everything + invite/remove team members
          </p>
        </div>
      </div>

      {/* Team list */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white text-sm">Team ({admins.length})</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {admins.map((admin: any) => (
            <div key={admin.users?.id ?? admin.role} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                {admin.users?.name?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">
                  {admin.users?.name}
                  {admin.users?.email === user?.email && (
                    <span className="ml-2 text-xs text-gray-500">(you)</span>
                  )}
                </p>
                <p className="text-gray-500 text-xs truncate">{admin.users?.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 font-medium capitalize shrink-0">
                {admin.role}
              </span>
              {admin.users?.email !== user?.email && dashboard?.userRole !== 'coordinator' && (
                <button
                  onClick={() => removeMember.mutate(admin.users?.id)}
                  disabled={removeMember.isPending}
                  className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
