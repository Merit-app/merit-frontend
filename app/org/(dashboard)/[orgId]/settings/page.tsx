'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMeritStore } from '@/lib/store';
import {
  orgsApi, orgProfileApi, orgInvitesApi, orgBillingApi,
  authApi, usersApi, mapUser, ApiError,
} from '@/lib/api';
import { useOrgStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  Building2, Users, CreditCard, Lock, Loader2,
  Eye, EyeOff, X, UserPlus, Crown, Shield,
  User as UserIcon, Check, Camera, AlertCircle,
  ExternalLink, Trash2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'organization' | 'team' | 'account' | 'password' | 'billing';
type Role = 'owner' | 'admin' | 'coordinator';

const ROLE_RANK: Record<Role, number> = { coordinator: 0, admin: 1, owner: 2 };
const ROLE_LABELS: Record<Role, string> = { coordinator: 'Coordinator', admin: 'Admin', owner: 'Owner' };
const ROLE_ICONS: Record<Role, React.ElementType> = { owner: Crown, admin: Shield, coordinator: UserIcon };
const ROLE_COLORS: Record<Role, string> = { owner: 'text-amber-400', admin: 'text-blue-400', coordinator: 'text-gray-400' };

const INPUT_CLASS =
  'bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors';

// ── Main page (inner — needs useSearchParams) ─────────────────────────────────
function OrgSettingsInner() {
  const { orgId } = useParams<{ orgId: string }>();
  const searchParams = useSearchParams();
  // Use the org store for role — accurate and independent of student auth
  const orgUser = useOrgStore((s) => s.orgUser);
  const currentUser = useMeritStore((s) => s.user);
  const orgAdminOrgs = useOrgStore((s) => s.adminOrgs);
  // Role from org store (set at org login) — fallback if the API call fails
  const storeRole = orgAdminOrgs.find((o) => o.id === orgId)?.role;

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = searchParams.get('tab') as Tab | null;
    return t && ['organization', 'team', 'account', 'password', 'billing'].includes(t)
      ? t
      : 'organization';
  });

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      toast.success('Subscription activated — welcome to Pro!');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Single query for org + team data
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['org-settings', orgId],
    queryFn: async () => {
      const res = await orgsApi.dashboard(orgId);
      const d = (res as any).data;
      return {
        org: d?.org ?? null,
        admins: (d?.admins ?? []) as any[],
        userRole: (d?.userRole ?? null) as Role | null,
      };
    },
    retry: 2,
    staleTime: 30_000,
  });

  const org = orgData?.org ?? null;
  const admins = orgData?.admins ?? [];
  // Prefer fresh API role; fall back to login-time store role; last resort: coordinator
  const userRole = (orgData?.userRole ?? storeRole ?? 'coordinator') as Role;
  const canEdit = ROLE_RANK[userRole] >= ROLE_RANK['admin'];

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'account', label: 'My account', icon: UserIcon },
    { id: 'password', label: 'Password', icon: Lock },
    ...(canEdit ? [{ id: 'billing' as Tab, label: 'Billing', icon: CreditCard }] : []),
  ];

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your organization, team, and account</p>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="text-gray-500">You&apos;re a</span>
        <span className={`font-semibold ${ROLE_COLORS[userRole]}`}>{ROLE_LABELS[userRole]}</span>
        <span className="text-gray-600">of this organization.</span>
        {!canEdit && <span className="text-gray-600">Contact an admin to make org changes.</span>}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'organization' && (
          <OrganizationTab orgId={orgId} org={org} canEdit={canEdit} isOwner={userRole === 'owner'} />
        )}
        {activeTab === 'team' && (
          <TeamTab orgId={orgId} admins={admins} userRole={userRole} currentUserId={orgUser?.id ?? currentUser?.id} />
        )}
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'password' && <PasswordTab />}
        {activeTab === 'billing' && canEdit && (
          <BillingTab orgId={orgId} currentPlan={org?.org_plan} />
        )}
      </div>
    </div>
  );
}

export default function OrgSettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-gray-600 animate-spin" /></div>}>
      <OrgSettingsInner />
    </Suspense>
  );
}

// ── ORGANIZATION TAB ──────────────────────────────────────────────────────────
function OrganizationTab({ orgId, org, canEdit, isOwner }: { orgId: string; org: any; canEdit: boolean; isOwner: boolean }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', description: '', website_url: '',
    contact_email: '', contact_phone: '', is_recruiting: false,
  });

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name ?? '',
        description: org.description ?? '',
        website_url: org.website_url ?? '',
        contact_email: org.contact_email ?? '',
        contact_phone: org.contact_phone ?? '',
        is_recruiting: org.is_recruiting ?? false,
      });
    }
  }, [org?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadImage = async (file: File, type: 'logo' | 'cover') => {
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    try {
      const base64 = await fileToBase64(file);
      await orgProfileApi.uploadImage(orgId, type, base64, file.type);
      toast.success(`${type === 'logo' ? 'Logo' : 'Cover'} updated`);
      qc.invalidateQueries({ queryKey: ['org-settings', orgId] });
    } catch { toast.error('Upload failed'); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await orgProfileApi.update(orgId, form);
      toast.success('Organization updated');
      setEditing(false);
      qc.invalidateQueries({ queryKey: ['org-settings', orgId] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  if (!org) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-3">
        <Building2 className="w-8 h-8 text-gray-700 mx-auto" />
        <p className="text-gray-500 text-sm">Organization data couldn&apos;t be loaded.</p>
        <button onClick={() => qc.invalidateQueries({ queryKey: ['org-settings', orgId] })} className="text-sm text-white underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="relative h-36 bg-gradient-to-r from-gray-800 to-gray-700 group">
          {org.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.cover_url} alt="Cover" className="w-full h-full object-cover" />
          )}
          {canEdit && (
            <>
              <div onClick={() => coverRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Camera className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Change cover</span>
                </div>
              </div>
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'cover'); e.target.value = ''; }} />
            </>
          )}
        </div>

        {/* Logo + org info */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border-4 border-gray-900 overflow-hidden flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {org.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={org.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  org.name?.[0]?.toUpperCase() ?? '?'
                )}
              </div>
              {canEdit && (
                <>
                  <div onClick={() => logoRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'logo'); e.target.value = ''; }} />
                </>
              )}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{org.name ?? 'Your Organization'}</h3>
              {org.category && <p className="text-gray-400 text-sm">{org.category}</p>}
              {org.city && <p className="text-gray-500 text-xs mt-0.5">{org.city}</p>}
            </div>
            {canEdit && !editing && (
              <button onClick={() => setEditing(true)} className="shrink-0 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-xl transition-colors">
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4 mt-2">
              <FormField label="Organization name">
                <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder={org.name} />
              </FormField>
              <FormField label="Description">
                <TextArea value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="What does your organization do?" rows={3} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Website">
                  <Input value={form.website_url} onChange={(v) => setForm((f) => ({ ...f, website_url: v }))} placeholder="https://yourorg.org" />
                </FormField>
                <FormField label="Contact email">
                  <Input value={form.contact_email} onChange={(v) => setForm((f) => ({ ...f, contact_email: v }))} placeholder="contact@yourorg.org" type="email" />
                </FormField>
              </div>
              <FormField label="Contact phone">
                <Input value={form.contact_phone} onChange={(v) => setForm((f) => ({ ...f, contact_phone: v }))} placeholder="+1 (604) 555-0100" />
              </FormField>
              <Toggle label="Currently accepting volunteers" description="Shows a 'Recruiting' badge on your public page" value={form.is_recruiting} onChange={(v) => setForm((f) => ({ ...f, is_recruiting: v }))} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white border border-gray-700 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-0 text-sm">
              {[
                { l: 'Description', v: org.description },
                { l: 'Website', v: org.website_url },
                { l: 'Contact email', v: org.contact_email },
                { l: 'Contact phone', v: org.contact_phone },
              ].filter((r) => r.v).map((r) => (
                <div key={r.l} className="flex gap-3 py-2 border-b border-gray-800/50 last:border-0">
                  <span className="text-gray-600 w-28 shrink-0 text-xs font-medium uppercase tracking-wide pt-0.5">{r.l}</span>
                  <span className="text-gray-300 break-all">{r.v}</span>
                </div>
              ))}
              <div className="flex gap-3 py-2">
                <span className="text-gray-600 w-28 shrink-0 text-xs font-medium uppercase tracking-wide pt-0.5">Recruiting</span>
                <span className={`text-sm font-medium ${org.is_recruiting ? 'text-green-400' : 'text-gray-500'}`}>
                  {org.is_recruiting ? 'Yes — accepting volunteers' : 'Not currently'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Public page link */}
      <a href={`/orgs/${org.slug}`} target="_blank" rel="noreferrer"
        className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors group">
        <div>
          <p className="text-white text-sm font-medium">Public page</p>
          <p className="text-gray-500 text-xs mt-0.5">meritco.app/orgs/{org.slug}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
      </a>

      {/* Danger Zone — owner only */}
      {isOwner && <DangerZone orgId={orgId} orgName={org.name ?? 'this organization'} />}
    </div>
  );
}

// ── DANGER ZONE (delete org — owner only) ─────────────────────────────────────
function DangerZone({ orgId, orgName }: { orgId: string; orgName: string }) {
  const router = useRouter();
  const orgLogout = useOrgStore((s) => s.orgLogout);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim() === orgName.trim();

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await orgsApi.deleteOrg(orgId);
      toast.success('Organization deleted');
      orgLogout();
      router.push('/org/login');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete organization');
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-red-400 font-semibold text-sm">Delete organization</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-md">
              Permanently delete <span className="text-gray-300">{orgName}</span> and all its data —
              events, messages, team, and reports. Volunteers&apos; logged hours are kept but unlinked.
              This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => { setOpen(true); setConfirmText(''); }}
            className="shrink-0 flex items-center gap-2 text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete organization
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => !deleting && setOpen(false)}>
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold">Delete {orgName}?</h3>
            </div>
            <p className="text-gray-400 text-sm">
              This permanently deletes the organization and all its data. This action
              <span className="text-red-400 font-medium"> cannot be undone</span>.
            </p>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Type <span className="text-gray-300 font-medium">{orgName}</span> to confirm
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={orgName}
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white border border-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || deleting}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── TEAM TAB ──────────────────────────────────────────────────────────────────
function TeamTab({ orgId, admins, userRole, currentUserId }: {
  orgId: string; admins: any[]; userRole: Role; currentUserId?: string;
}) {
  const qc = useQueryClient();
  const canManage = ROLE_RANK[userRole] >= ROLE_RANK['admin'];
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'coordinator' | 'admin'>('coordinator');
  const [inviting, setInviting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const invite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    try {
      await orgInvitesApi.create(orgId, email.trim(), role);
      toast.success(`Invite sent to ${email}`);
      setEmail('');
      qc.invalidateQueries({ queryKey: ['org-settings', orgId] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Invite failed');
    } finally { setInviting(false); }
  };

  const remove = async (userId: string) => {
    try {
      await orgsApi.removeTeamMember(orgId, userId);
      toast.success('Member removed');
      setConfirmRemove(null);
      qc.invalidateQueries({ queryKey: ['org-settings', orgId] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Remove failed');
    }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4" />Invite team member
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              They&apos;ll receive an email with a link to join your org dashboard.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@organization.org" onKeyDown={(e) => e.key === 'Enter' && invite()}
              className={`${INPUT_CLASS} flex-1 min-w-0`} />
            <select value={role} onChange={(e) => setRole(e.target.value as 'coordinator' | 'admin')}
              className={`${INPUT_CLASS} w-36 shrink-0`}>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={invite} disabled={inviting || !email}
              className="px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center gap-2">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
            </button>
          </div>
          <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-800">
            <p><span className="text-gray-400 font-medium">Coordinator</span> — verify sessions, view volunteers, run events</p>
            <p><span className="text-gray-400 font-medium">Admin</span> — everything + invite/remove members, manage billing</p>
            <p><span className="text-gray-400 font-medium">Owner</span> — full control including transferring ownership</p>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="font-semibold text-white text-sm">Team members ({admins.length})</h3>
        </div>
        {admins.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No team members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {admins.map((member: any) => {
              const u = member.users ?? member;
              const memberId = u?.id;
              const memberRole = member.role as Role;
              const isMe = memberId === currentUserId;
              const canRemoveThis = canManage && !isMe && ROLE_RANK[userRole] > ROLE_RANK[memberRole];
              const RoleIcon = ROLE_ICONS[memberRole] ?? UserIcon;

              return (
                <div key={memberId ?? member.role} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 shrink-0 overflow-hidden">
                    {u?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      u?.name?.[0]?.toUpperCase() ?? '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{u?.name ?? 'Unknown'}</p>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-medium uppercase tracking-wide shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs truncate">{u?.email}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${ROLE_COLORS[memberRole] ?? 'text-gray-400'}`}>
                    <RoleIcon className="w-3.5 h-3.5" />
                    {ROLE_LABELS[memberRole] ?? memberRole}
                  </span>
                  {canRemoveThis && (
                    confirmRemove === memberId ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setConfirmRemove(null)} className="text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => remove(memberId)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemove(memberId)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!canManage && (
        <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300 text-sm">
            As a Coordinator, you can view team members but cannot invite or remove anyone. Contact an Admin or Owner to make changes.
          </p>
        </div>
      )}
    </div>
  );
}

// ── ACCOUNT TAB ───────────────────────────────────────────────────────────────
function AccountTab() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);
  // Display name as one field; split back on save
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const [name, setName] = useState(fullName);
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(`${user.firstName} ${user.lastName}`.trim());
      setEmail(user.email);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasChanges = name !== fullName || email !== user?.email;

  const save = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const updates: { name?: string; email?: string } = {};
      if (name !== fullName) updates.name = name;
      if (email !== user?.email) updates.email = email;
      const res = await usersApi.update(updates);
      // Sync store with server-returned user
      const updatedUser = mapUser((res as any).data?.user);
      updateUser(updatedUser);
      toast.success(updates.email ? 'Account updated — check your new email to confirm' : 'Account updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-white">Your account</h3>
          <p className="text-gray-500 text-sm mt-1">Personal login info. Used across both student and org dashboards.</p>
        </div>
        <FormField label="Full name">
          <Input value={name} onChange={setName} placeholder="Your name" />
        </FormField>
        <FormField label="Email address">
          <Input value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          {email !== user?.email && email && (
            <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              You&apos;ll need to confirm your new email after saving.
            </p>
          )}
        </FormField>
        <div className="flex justify-end pt-2 border-t border-gray-800">
          <button onClick={save} disabled={!hasChanges || saving || !name || !email}
            className="px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PASSWORD TAB ──────────────────────────────────────────────────────────────
function PasswordTab() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = !!(current && next.length >= 8 && next === confirm);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      toast.success('Password changed');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Failed to change password');
      }
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-white">Change password</h3>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password you don&apos;t use elsewhere.</p>
        </div>
        <PwField label="Current password" value={current} onChange={setCurrent} show={showCurrent} setShow={setShowCurrent} placeholder="Enter your current password" />
        <PwField label="New password" value={next} onChange={setNext} show={showNext} setShow={setShowNext} placeholder="At least 8 characters" error={tooShort ? 'Must be at least 8 characters' : undefined} />
        <PwField label="Confirm new password" value={confirm} onChange={setConfirm} show={showConfirm} setShow={setShowConfirm} placeholder="Re-enter new password" error={mismatch ? 'Passwords do not match' : undefined} />
        <div className="flex justify-end pt-2 border-t border-gray-800">
          <button type="submit" disabled={!canSave || saving}
            className="px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </div>
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
        <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-400/80 space-y-1">
          <p>Use a unique password not used on other sites.</p>
          <p>Mix uppercase, lowercase, numbers, and symbols.</p>
          <p>Avoid using your name or email in your password.</p>
        </div>
      </div>
    </form>
  );
}

// ── BILLING TAB ───────────────────────────────────────────────────────────────
function BillingTab({ orgId, currentPlan }: { orgId: string; currentPlan?: string }) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const { data: billingRes } = useQuery({
    queryKey: ['org-billing', orgId],
    queryFn: () => orgBillingApi.get(orgId),
    retry: false,
  });
  const billing = (billingRes as any)?.data;
  const plan = billing?.plan ?? currentPlan ?? 'basic';
  const isActive = billing?.status === 'active';

  const checkout = async (p: 'pro' | 'enterprise') => {
    setLoading(p);
    try {
      const res = await orgBillingApi.createCheckout(orgId, p, billingInterval);
      const url = (res as any).data?.url;
      if (url) window.location.href = url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Checkout failed');
      setLoading(null);
    }
  };

  const portal = async () => {
    setLoading('portal');
    try {
      const res = await orgBillingApi.openPortal(orgId);
      const url = (res as any).data?.url;
      if (url) window.location.href = url;
    } catch {
      toast.error('Could not open billing portal');
      setLoading(null);
    }
  };

  const PLANS: { id: string; name: string; tag: string | null; price: { monthly: number; yearly: number }; sub: string; features: string[] }[] = [
    {
      id: 'basic', name: 'Basic', tag: null,
      price: { monthly: 0, yearly: 0 },
      sub: 'For small nonprofits getting started',
      features: ['Up to 25 volunteers', 'Verify volunteer sessions', 'View volunteer hours and history', 'Basic dashboard stats', '1 admin seat'],
    },
    {
      id: 'pro', name: 'Pro', tag: 'Most popular',
      price: { monthly: 29, yearly: 249 },
      sub: 'For active volunteer programs',
      features: ['Everything in Free', 'Unlimited volunteers', 'Events + auto SMS notification', 'Day-of check-in, hours auto-log', 'Bulk SMS to all volunteers', 'Grant impact PDF reports', 'Volunteer recognition certificates', 'Up to 5 admin seats', 'Priority support'],
    },
    {
      id: 'enterprise', name: 'Enterprise', tag: null,
      price: { monthly: 99, yearly: 849 },
      sub: 'For large organizations and federations',
      features: ['Everything in Pro', 'Unlimited admin seats', 'Multiple locations and chapters', 'Custom-branded reports', 'Volunteer leaderboard', 'CSV export of all volunteer data', 'Dedicated onboarding support', 'Priority support — 24h response', 'Early access to new features'],
    },
  ];

  return (
    <div className="space-y-6">
      {isActive && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-green-400 font-semibold text-sm capitalize">{plan} — active</p>
            {billing?.currentPeriodEnd && (
              <p className="text-gray-500 text-xs mt-0.5">
                Renews {new Date(billing.currentPeriodEnd).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                {billing.cancelAtPeriodEnd ? ' (cancels at period end)' : ''}
              </p>
            )}
          </div>
          <button onClick={portal} disabled={loading === 'portal'} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            {loading === 'portal' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Manage subscription →
          </button>
        </div>
      )}

      {!isActive && (
        <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-xl w-fit">
          {(['monthly', 'yearly'] as const).map((i) => (
            <button key={i} onClick={() => setBillingInterval(i)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${billingInterval === i ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}>
              {i === 'monthly' ? 'Monthly' : 'Yearly'}
              {i === 'yearly' && <span className="ml-1.5 text-[10px] text-green-400 font-bold">2 months free</span>}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {PLANS.map((p) => {
          const isCurrent = plan === p.id;
          const monthlyPrice = billingInterval === 'yearly' && p.id !== 'basic'
            ? Math.round(p.price.yearly / 12)
            : p.price.monthly;

          return (
            <div key={p.id} className={`rounded-2xl border p-5 flex flex-col ${
              p.id === 'pro' && !isCurrent ? 'border-white/20 bg-white/5' : 'border-gray-800 bg-gray-900'
            } ${isCurrent ? 'border-green-500/30' : ''}`}>
              {p.tag && (
                <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded-full w-fit mb-3 uppercase tracking-wide">
                  {p.tag}
                </span>
              )}
              <p className="font-bold text-white text-lg">{p.name}</p>
              <p className="text-gray-500 text-xs mt-0.5 mb-4">{p.sub}</p>
              <div className="mb-5">
                {monthlyPrice === 0 ? (
                  <p className="text-3xl font-bold text-white">Free</p>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-white">
                      ${monthlyPrice}<span className="text-base font-normal text-gray-500">/mo</span>
                    </p>
                    {billingInterval === 'yearly' && (
                      <p className="text-xs text-gray-500 mt-0.5">${p.price.yearly}/yr billed annually</p>
                    )}
                  </>
                )}
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                    <Check className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20">✓ Current plan</div>
              ) : p.id === 'basic' ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm text-gray-600 border border-gray-800">Free forever</div>
              ) : (
                <button onClick={() => checkout(p.id as 'pro' | 'enterprise')} disabled={loading === p.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    p.id === 'pro' ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}>
                  {loading === p.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading === p.id ? 'Loading...' : `Upgrade to ${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-600 text-center">14-day free trial on all paid plans. Cancel anytime. No contracts.</p>
    </div>
  );
}

// ── Shared UI primitives ──────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT_CLASS} w-full`} />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT_CLASS} w-full resize-none`} />
  );
}

function Toggle({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
      <button type="button" onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-white' : 'bg-gray-600'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-gray-900 transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </div>
  );
}

function PwField({ label, value, onChange, show, setShow, placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; setShow: (v: boolean) => void; placeholder?: string; error?: string;
}) {
  return (
    <FormField label={label}>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_CLASS} w-full pr-10 ${error ? 'border-red-500' : ''}`} />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </FormField>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
