'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Plus, X, ChevronDown } from 'lucide-react';
import { useMeritStore } from '@/lib/store';
import { orgAuthApi, orgsApi, orgInvitesApi, authApi, mapUser, ApiError } from '@/lib/api';

const CATEGORIES = [
  'Community & Social', 'Food & Hunger', 'Education & Tutoring',
  'Environment & Nature', 'Animal Welfare', 'Health & Wellness',
  'Youth & Children', 'Arts & Culture', 'Faith & Spiritual',
  'Emergency & Crisis', 'Other',
];

const input =
  'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-white transition-colors';
const label = 'block text-sm font-medium text-gray-300 mb-1.5';

type AuthMode = 'new' | 'existing';

export default function OrgCreatePage() {
  const router = useRouter();
  const login = useMeritStore((s) => s.login);
  const user = useMeritStore((s) => s.user);
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const accessToken = useMeritStore((s) => s.accessToken);
  const expiresAt = useMeritStore((s) => s.expiresAt);
  const setAdminOrgs = useMeritStore((s) => s.setAdminOrgs);
  const setCurrentOrgId = useMeritStore((s) => s.setCurrentOrgId);
  const setIsOrgAdmin = useMeritStore((s) => s.setIsOrgAdmin);
  const logoutStore = useMeritStore((s) => s.logout);

  const loggedIn = isAuthed && accessToken != null && expiresAt != null && expiresAt * 1000 > Date.now();

  // auth
  const [mode, setMode] = useState<AuthMode>('new');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  // org
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [city, setCity] = useState('');
  // optional
  const [showMore, setShowMore] = useState(false);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  // admins
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminInput, setAdminInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwTooShort = mode === 'new' && password.length > 0 && password.length < 8;
  const mismatch = mode === 'new' && confirm.length > 0 && password !== confirm;

  const orgValid = name.trim().length >= 2 && city.trim().length >= 2;
  const authValid =
    loggedIn ||
    (mode === 'new'
      ? /\S+@\S+\.\S+/.test(email) && password.length >= 8 && password === confirm
      : /\S+@\S+\.\S+/.test(email) && password.length > 0);
  const canSubmit = orgValid && authValid && !loading;

  const addAdmin = () => {
    const e = adminInput.trim().toLowerCase();
    if (/\S+@\S+\.\S+/.test(e) && !adminEmails.includes(e) && e !== email.toLowerCase()) {
      setAdminEmails((a) => [...a, e]);
      setAdminInput('');
    }
  };

  const orgPayload = {
    name: name.trim(),
    category,
    city: city.trim(),
    websiteUrl: website.trim() || undefined,
    description: description.trim() || undefined,
    contactPhone: phone.trim() || undefined,
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      // ── Brand-new account: one-shot endpoint handles account + org + invites ──
      if (!loggedIn && mode === 'new') {
        const res = await orgAuthApi.create({ ...orgPayload, email: email.trim(), password, adminEmails: adminEmails.length ? adminEmails : undefined });
        const d = res.data;
        login(mapUser(d.user ?? { id: '', name, email, plan: 'free' }), {
          accessToken: d.accessToken ?? '',
          refreshToken: d.refreshToken ?? '',
          expiresAt: d.expiresAt ?? Math.floor(Date.now() / 1000) + 3600,
        });
        setAdminOrgs([{ id: d.org.id, name: d.org.name, slug: d.org.slug, role: 'owner' }]);
        setIsOrgAdmin(true);
        setCurrentOrgId(d.org.id);
        toast.success(d.invited?.length ? `Organization created — invited ${d.invited.length} admin(s)` : 'Organization created!');
        router.push(`/org/${d.org.id}/dashboard`);
        return;
      }

      // ── Existing account: sign in first if needed ──
      if (!loggedIn && mode === 'existing') {
        const r = await authApi.login(email.trim(), password);
        const s = r.data.session;
        login(mapUser(r.data.user), { accessToken: s.accessToken, refreshToken: s.refreshToken, expiresAt: s.expiresAt });
      }

      // ── Create the org under the (now) logged-in account ──
      const created = await orgsApi.createOrg({ ...orgPayload, contactEmail: user?.email });
      const orgId = created.data.org.id;

      // invite admins (best-effort)
      let invited = 0;
      for (const ae of adminEmails) {
        try { await orgInvitesApi.create(orgId, ae, 'admin'); invited++; } catch { /* skip */ }
      }

      // refresh org list from server so the new org shows + role is accurate
      try {
        const mine = await orgsApi.adminMine();
        setAdminOrgs((mine.data ?? []).map((o: any) => ({
          id: o.id, name: o.name, slug: o.slug ?? o.id, logoUrl: o.logo_url ?? undefined,
          role: (o.role as 'owner' | 'admin' | 'coordinator') ?? 'owner',
        })));
      } catch { /* keep going */ }
      setIsOrgAdmin(true);
      setCurrentOrgId(orgId);

      toast.success(invited ? `Organization created — invited ${invited} admin(s)` : 'Organization created!');
      router.push(`/org/${orgId}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('An account with this email already exists. Switch to "Use an existing account" and sign in.');
      } else if (err instanceof ApiError && err.status === 401) {
        setError('Incorrect email or password.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not reach the server. Try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-12 px-6">
      <div className="mb-8 text-center">
        <a href="/org" className="text-2xl font-bold text-white">merit.</a>
        <p className="text-gray-500 text-sm mt-1">Create your organization</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Account */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">Your account</h2>

          {loggedIn ? (
            <div className="flex items-center justify-between gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-gray-300 text-xs">Creating as</p>
                <p className="text-white text-sm font-medium truncate">{user?.email}</p>
              </div>
              <button type="button" onClick={() => logoutStore()} className="text-xs text-gray-400 hover:text-white shrink-0">
                Use a different account
              </button>
            </div>
          ) : (
            <>
              {/* mode toggle */}
              <div className="flex gap-1 p-1 bg-gray-800 rounded-xl">
                {([['new', 'Create new account'], ['existing', 'Use existing account']] as const).map(([m, lbl]) => (
                  <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${mode === m ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}>
                    {lbl}
                  </button>
                ))}
              </div>

              <div>
                <label className={label}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@organization.org" className={input} required />
              </div>
              <div>
                <label className={label}>Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'new' ? 'At least 8 characters' : 'Your password'} className={`${input} pr-10`} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwTooShort && <p className="text-xs text-red-400 mt-1">Must be at least 8 characters</p>}
              </div>
              {mode === 'new' && (
                <div>
                  <label className={label}>Confirm password</label>
                  <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" className={input} required />
                  {mismatch && <p className="text-xs text-red-400 mt-1">Passwords don&apos;t match</p>}
                </div>
              )}
              {mode === 'new' && (
                <p className="text-gray-500 text-xs">This Merit login works for the org and (optionally) the student side.</p>
              )}
            </>
          )}
        </div>

        {/* Organization */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">Organization details</h2>
          <div>
            <label className={label}>Organization name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vancouver Rotary Foundation" className={input} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Vancouver" className={input} required />
            </div>
          </div>

          <button type="button" onClick={() => setShowMore(!showMore)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
            {showMore ? 'Hide optional details' : 'Add more details (optional — set up later)'}
          </button>
          {showMore && (
            <div className="space-y-4 pt-1">
              <div>
                <label className={label}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does your organization do?" className={`${input} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Website</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={input} />
                </div>
                <div>
                  <label className={label}>Contact phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (604) 555-0100" className={input} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admins */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-white font-semibold text-sm">Invite admins <span className="text-gray-500 font-normal">(optional)</span></h2>
          <p className="text-gray-500 text-xs -mt-1">They&apos;ll get an email invite. New users are prompted to create a Merit account.</p>
          <div className="flex gap-2">
            <input type="email" value={adminInput} onChange={(e) => setAdminInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAdmin(); } }}
              placeholder="admin@organization.org" className={`${input} flex-1`} />
            <button type="button" onClick={addAdmin} className="px-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {adminEmails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {adminEmails.map((e) => (
                <span key={e} className="flex items-center gap-1.5 text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg">
                  {e}
                  <button type="button" onClick={() => setAdminEmails((a) => a.filter((x) => x !== e))} className="text-gray-500 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={!canSubmit}
          className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating…' : 'Create organization'}
        </button>

        {!loggedIn && (
          <p className="text-center text-sm text-gray-500">
            Just want to sign in?{' '}
            <Link href="/org/login" className="text-gray-300 hover:text-white">Org login</Link>
          </p>
        )}
      </form>
    </div>
  );
}
