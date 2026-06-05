'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgsApi, orgInvitesApi, orgProfileApi, orgBillingApi, ApiError } from '@/lib/api';
import { useMeritStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  UserPlus, X, Loader2, ExternalLink, Camera, Edit2,
  CreditCard, CheckCircle2, Building2, Users,
} from 'lucide-react';

// ── Input class ───────────────────────────────────────────────────────────────
const inputClass =
  'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors';

// ── Org Profile Section ───────────────────────────────────────────────────────
function OrgProfileSection({
  orgId, org, dashboardUserRole,
}: { orgId: string; org: any; dashboardUserRole?: string }) {
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<'logo' | 'cover' | null>(null);
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
  }, [org]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await orgProfileApi.update(orgId, {
        name: form.name || undefined,
        description: form.description || undefined,
        website_url: form.website_url || undefined,
        contact_email: form.contact_email || undefined,
        contact_phone: form.contact_phone || undefined,
        is_recruiting: form.is_recruiting,
      });
      toast.success('Organization updated');
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (kind: 'logo' | 'cover', file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setUploadingKind(kind);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await orgProfileApi.uploadImage(orgId, kind, base64, file.type);
      toast.success(`${kind === 'logo' ? 'Logo' : 'Cover photo'} updated`);
      qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] });
    } catch { toast.error(`Failed to upload ${kind}`); }
    finally { setUploadingKind(null); }
  };

  const canEdit = dashboardUserRole !== 'coordinator';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Cover */}
      <div
        className="relative h-32 bg-gradient-to-r from-gray-800 to-gray-700 group"
        style={{ cursor: canEdit ? 'pointer' : 'default' }}
        onClick={() => canEdit && coverRef.current?.click()}
      >
        {org?.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={org.cover_url} alt="Cover" className="w-full h-full object-cover" />
        )}
        {canEdit && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {uploadingKind === 'cover' ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : (
              <><Camera className="w-4 h-4 text-white" /><span className="text-white text-sm font-medium">Change cover</span></>
            )}
          </div>
        )}
        <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload('cover', f); e.target.value = ''; }} />
      </div>

      {/* Logo + fields */}
      <div className="px-5 pt-3 pb-5">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="relative group" style={{ cursor: canEdit ? 'pointer' : 'default' }} onClick={() => canEdit && logoRef.current?.click()}>
            <div className="w-16 h-16 rounded-2xl bg-gray-800 border-4 border-gray-900 overflow-hidden flex items-center justify-center text-white font-bold text-xl">
              {org?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
              ) : (org?.name?.[0] ?? '?')}
            </div>
            {canEdit && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingKind === 'logo' ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              </div>
            )}
            <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload('logo', f); e.target.value = ''; }} />
          </div>

          {canEdit && (!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
              <Edit2 className="w-3.5 h-3.5" />Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:text-gray-300 px-3 py-1.5">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ))}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {[
              { key: 'name', label: 'Name', placeholder: 'Your organization name' },
              { key: 'website_url', label: 'Website', placeholder: 'https://yourorg.org' },
              { key: 'contact_email', label: 'Contact email', placeholder: 'contact@yourorg.org' },
              { key: 'contact_phone', label: 'Contact phone', placeholder: '+1 (604) 555-0100' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className={inputClass} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="What does your organization do?" rows={3} maxLength={1000} className={`${inputClass} resize-none`} />
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <button type="button" onClick={() => setForm((f) => ({ ...f, is_recruiting: !f.is_recruiting }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.is_recruiting ? 'bg-white' : 'bg-gray-600'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-gray-900 transition-transform ${form.is_recruiting ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              <div>
                <p className="text-white text-sm font-medium">Accepting volunteers</p>
                <p className="text-gray-500 text-xs">Show &ldquo;We&apos;re recruiting&rdquo; badge on your public page</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {[
              { label: 'Name', value: org?.name },
              { label: 'Website', value: org?.website_url },
              { label: 'Contact', value: org?.contact_email },
              { label: 'Phone', value: org?.contact_phone },
              { label: 'Description', value: org?.description },
            ].filter((f) => f.value).map((f) => (
              <div key={f.label} className="flex gap-4 py-1.5 border-b border-gray-800/50 last:border-0">
                <span className="text-gray-500 w-24 shrink-0 text-xs font-medium uppercase tracking-wide pt-0.5">{f.label}</span>
                <span className="text-gray-300 break-words text-sm">{f.value}</span>
              </div>
            ))}
            <div className="flex gap-4 py-1.5">
              <span className="text-gray-500 w-24 shrink-0 text-xs font-medium uppercase tracking-wide pt-0.5">Recruiting</span>
              <span className={`text-sm font-medium ${org?.is_recruiting ? 'text-green-400' : 'text-gray-500'}`}>
                {org?.is_recruiting ? 'Yes — accepting volunteers' : 'Not currently'}
              </span>
            </div>
          </div>
        )}

        {org?.slug && (
          <div className="mt-4 pt-3 border-t border-gray-800">
            <a href={`/orgs/${org.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
              <ExternalLink className="w-3 h-3" />meritco.app/orgs/{org.slug}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Billing Tab ───────────────────────────────────────────────────────────────
function BillingTab({ orgId }: { orgId: string }) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { data: billingRes } = useQuery({
    queryKey: ['org-billing', orgId],
    queryFn: () => orgBillingApi.get(orgId),
    retry: false,
  });
  const billing = (billingRes as any)?.data;

  const handleCheckout = async (plan: 'pro' | 'enterprise') => {
    setIsLoading(plan);
    try {
      const res = await orgBillingApi.createCheckout(orgId, plan, billingInterval);
      const url = (res as any).data?.url;
      if (url) window.location.href = url;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Already subscribed. Manage via the billing portal.');
      } else {
        toast.error('Failed to start checkout. Try again.');
      }
    } finally { setIsLoading(null); }
  };

  const handlePortal = async () => {
    setIsLoading('portal');
    try {
      const res = await orgBillingApi.openPortal(orgId);
      const url = (res as any).data?.url;
      if (url) window.location.href = url;
    } catch {
      toast.error('Failed to open billing portal.');
    } finally { setIsLoading(null); }
  };

  const currentPlan = billing?.plan ?? 'basic';
  const isActive = billing?.status === 'active' || billing?.status === 'trialing';

  const PLANS: {
    id: 'basic' | 'pro' | 'enterprise';
    name: string;
    price: { monthly: number; yearly: number };
    description: string;
    features: string[];
    highlight?: boolean;
  }[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: { monthly: 0, yearly: 0 },
      description: 'For small nonprofits getting started',
      features: [
        'Up to 50 volunteers',
        'Verify volunteer sessions',
        'View volunteer hours',
        'Basic dashboard',
        '1 admin seat',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 49, yearly: 470 },
      description: 'For active volunteer programs',
      features: [
        'Unlimited volunteers',
        'Event creation + day-of check-in',
        'Bulk SMS to all volunteers',
        'Grant impact PDF reports',
        'Volunteer certificates',
        'Up to 5 admin seats',
        'Priority support',
      ],
      highlight: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 149, yearly: 1430 },
      description: 'For large organizations and federations',
      features: [
        'Everything in Pro',
        'Multiple locations / chapters',
        'Custom branding on reports',
        'Unlimited admin seats',
        'Dedicated support',
        'Custom integrations',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active plan banner */}
      {isActive && currentPlan !== 'basic' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-green-400 font-semibold text-sm capitalize">{currentPlan} plan active</p>
            {billing?.currentPeriodEnd && (
              <p className="text-gray-500 text-xs mt-0.5">
                Renews {new Date(billing.currentPeriodEnd).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                {billing.cancelAtPeriodEnd ? ' (cancels at end of period)' : ''}
              </p>
            )}
          </div>
          <button onClick={handlePortal} disabled={isLoading === 'portal'}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            {isLoading === 'portal' && <Loader2 className="w-4 h-4 animate-spin" />}
            Manage →
          </button>
        </div>
      )}

      {/* Interval toggle */}
      {!isActive && (
        <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-xl w-fit">
          {(['monthly', 'yearly'] as const).map((i) => (
            <button key={i} onClick={() => setBillingInterval(i)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${billingInterval === i ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}>
              {i === 'monthly' ? 'Monthly' : (
                <span>Yearly<span className="ml-1.5 text-[10px] text-green-400 font-bold">2 months free</span></span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const monthlyEquiv = plan.id === 'basic' ? 0 : Math.round(plan.price.yearly / 12);
          const displayPrice = billingInterval === 'yearly' && plan.id !== 'basic' ? monthlyEquiv : plan.price.monthly;

          return (
            <div key={plan.id} className={`rounded-2xl border p-5 flex flex-col ${
              plan.highlight && !isCurrent ? 'border-white/20 bg-white/5' : 'border-gray-800 bg-gray-900'
            } ${isCurrent ? 'border-green-500/30' : ''}`}>
              {plan.highlight && (
                <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-full w-fit mb-3">
                  MOST POPULAR
                </span>
              )}
              <p className="font-bold text-white text-lg">{plan.name}</p>
              <p className="text-gray-500 text-xs mt-1 mb-4">{plan.description}</p>

              <div className="mb-4">
                {displayPrice === 0 ? (
                  <p className="text-3xl font-bold text-white">Free</p>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-white">
                      ${displayPrice}<span className="text-base font-normal text-gray-500">/mo</span>
                    </p>
                    {billingInterval === 'yearly' && (
                      <p className="text-xs text-gray-500 mt-0.5">${plan.price.yearly}/yr billed annually</p>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20">
                  ✓ Current plan
                </div>
              ) : plan.id === 'basic' ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm text-gray-600">
                  Free — no action needed
                </div>
              ) : (
                <button onClick={() => handleCheckout(plan.id as 'pro' | 'enterprise')} disabled={isLoading === plan.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    plan.highlight ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}>
                  {isLoading === plan.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isLoading === plan.id ? 'Loading...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 text-center">
        All paid plans include a 14-day free trial. Cancel anytime. No contracts.
      </p>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
type Tab = 'organization' | 'team' | 'billing';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

// ── Main settings page ────────────────────────────────────────────────────────
function OrgSettingsInner() {
  const { orgId } = useParams<{ orgId: string }>();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const user = useMeritStore((s) => s.user);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'coordinator' | 'admin'>('coordinator');
  const [isInviting, setIsInviting] = useState(false);

  // Default tab from URL param (e.g. ?tab=billing after Stripe redirect)
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : 'organization',
  );

  const { data: dashRes } = useQuery({
    queryKey: ['org-dashboard', orgId],
    queryFn: () => orgsApi.dashboard(orgId),
  });
  const dashboard: any = (dashRes as any)?.data;
  const admins: any[] = dashboard?.admins ?? [];
  const org = dashboard?.org;

  const removeMember = useMutation({
    mutationFn: (userId: string) => orgsApi.removeTeamMember(orgId, userId),
    onSuccess: () => { toast.success('Team member removed'); qc.invalidateQueries({ queryKey: ['org-dashboard', orgId] }); },
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
    } finally { setIsInviting(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your organization, team, and billing</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === id ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Organization tab */}
      {activeTab === 'organization' && (
        <>
          <OrgProfileSection orgId={orgId} org={org} dashboardUserRole={dashboard?.userRole} />
        </>
      )}

      {/* Team tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Invite */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4" />Invite team member
            </h3>
            <p className="text-gray-500 text-sm">They&apos;ll receive an email with a link to join your org dashboard.</p>
            <div className="flex gap-3 flex-wrap">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@org.com" onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                className="flex-1 min-w-0 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'coordinator' | 'admin')}
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 text-sm focus:outline-none">
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleInvite} disabled={isInviting || !inviteEmail}
                className="px-4 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center gap-2">
                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
              </button>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="text-gray-400">Coordinator</span> — verify sessions, view volunteers, run events</p>
              <p><span className="text-gray-400">Admin</span> — everything + invite/remove team members</p>
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
                      {admin.users?.email === user?.email && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{admin.users?.email}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 font-medium capitalize shrink-0">{admin.role}</span>
                  {admin.users?.email !== user?.email && dashboard?.userRole !== 'coordinator' && (
                    <button onClick={() => removeMember.mutate(admin.users?.id)} disabled={removeMember.isPending}
                      className="text-gray-600 hover:text-red-400 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Billing tab */}
      {activeTab === 'billing' && <BillingTab orgId={orgId} />}
    </div>
  );
}

export default function OrgSettingsPage() { return ( <Suspense fallback={null}><OrgSettingsInner /></Suspense> ); }
