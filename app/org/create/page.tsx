'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Plus, X, ChevronDown } from 'lucide-react';
import { useMeritStore } from '@/lib/store';
import { orgAuthApi, mapUser, ApiError } from '@/lib/api';

const CATEGORIES = [
  'Community & Social', 'Food & Hunger', 'Education & Tutoring',
  'Environment & Nature', 'Animal Welfare', 'Health & Wellness',
  'Youth & Children', 'Arts & Culture', 'Faith & Spiritual',
  'Emergency & Crisis', 'Other',
];

const input =
  'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-white transition-colors';
const label = 'block text-sm font-medium text-gray-300 mb-1.5';

export default function OrgCreatePage() {
  const router = useRouter();
  const login = useMeritStore((s) => s.login);
  const setAdminOrgs = useMeritStore((s) => s.setAdminOrgs);
  const setCurrentOrgId = useMeritStore((s) => s.setCurrentOrgId);
  const setIsOrgAdmin = useMeritStore((s) => s.setIsOrgAdmin);

  // account
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

  const pwTooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    /\S+@\S+\.\S+/.test(email) && password.length >= 8 && password === confirm &&
    name.trim().length >= 2 && city.trim().length >= 2 && !loading;

  const addAdmin = () => {
    const e = adminInput.trim().toLowerCase();
    if (/\S+@\S+\.\S+/.test(e) && !adminEmails.includes(e) && e !== email.toLowerCase()) {
      setAdminEmails((a) => [...a, e]);
      setAdminInput('');
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orgAuthApi.create({
        email: email.trim(),
        password,
        name: name.trim(),
        category,
        city: city.trim(),
        websiteUrl: website.trim() || undefined,
        description: description.trim() || undefined,
        contactPhone: phone.trim() || undefined,
        adminEmails: adminEmails.length ? adminEmails : undefined,
      });
      const d = res.data;
      login(mapUser(d.user ?? { id: '', name, email, plan: 'free' }), {
        accessToken: d.accessToken ?? '',
        refreshToken: d.refreshToken ?? '',
        expiresAt: d.expiresAt ?? Math.floor(Date.now() / 1000) + 3600,
      });
      setAdminOrgs([{ id: d.org.id, name: d.org.name, slug: d.org.slug, role: 'owner' }]);
      setIsOrgAdmin(true);
      setCurrentOrgId(d.org.id);
      if (d.invited?.length) toast.success(`Organization created — invited ${d.invited.length} admin(s)`);
      else toast.success('Organization created!');
      router.push(`/org/${d.org.id}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('An account with this email already exists. Sign in, then create your org from the dashboard.');
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
          <p className="text-gray-500 text-xs -mt-2">This is your Merit login — works for the org and (optionally) the student side.</p>
          <div>
            <label className={label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@organization.org" className={input} required />
          </div>
          <div>
            <label className={label}>Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={`${input} pr-10`} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwTooShort && <p className="text-xs text-red-400 mt-1">Must be at least 8 characters</p>}
          </div>
          <div>
            <label className={label}>Confirm password</label>
            <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" className={input} required />
            {mismatch && <p className="text-xs text-red-400 mt-1">Passwords don&apos;t match</p>}
          </div>
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

          {/* Optional — set up later */}
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

        {/* Admins — optional */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-white font-semibold text-sm">Invite admins <span className="text-gray-500 font-normal">(optional)</span></h2>
          <p className="text-gray-500 text-xs -mt-1">They&apos;ll get an email invite. New users are prompted to create a Merit account.</p>
          <div className="flex gap-2">
            <input
              type="email" value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAdmin(); } }}
              placeholder="admin@organization.org" className={`${input} flex-1`}
            />
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

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/org/login" className="text-gray-300 hover:text-white">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
