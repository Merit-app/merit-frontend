'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Building2, CheckCircle2 } from 'lucide-react';
import { useOrgStore } from '@/lib/store';
import { orgSignupApi, ApiError } from '@/lib/api';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-white transition-colors';
const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');
  const orgName = searchParams.get('orgName');
  const inviteToken = searchParams.get('token');

  const orgLogin = useOrgStore((s) => s.orgLogin);

  const [step, setStep] = useState<'account' | 'done'>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'owner' as 'owner' | 'admin' | 'coordinator',
  });

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) { toast.error('Missing organization. Please start from the org page.'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    setIsLoading(true);
    try {
      const res = await orgSignupApi.signup({
        email: form.email,
        password: form.password,
        name: form.name,
        orgId,
        role: form.role,
        token: inviteToken ?? undefined,
      });

      const { user: rawUser, org, accessToken, refreshToken, expiresAt } = res.data;

      const u = rawUser ?? {};
      orgLogin({
        user: { id: u.id ?? '', name: u.name ?? form.name, email: u.email ?? form.email, plan: u.plan ?? 'free' },
        orgs: [{
          id: org.id,
          name: org.name,
          slug: org.slug ?? org.id,
          logoUrl: undefined,
          role: org.role as 'owner' | 'admin' | 'coordinator',
        }],
        defaultOrgId: org.id,
        accessToken: accessToken ?? '',
        refreshToken: refreshToken ?? '',
        expiresAt: expiresAt ?? Math.floor(Date.now() / 1000) + 3600,
      });

      setStep('done');
      setTimeout(() => router.push(`/org/${org.id}/dashboard`), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error('Account already exists — sign in instead.', {
            action: { label: 'Sign in', onClick: () => router.push('/org/login') },
          });
        } else {
          toast.error(err.message || 'Failed to create account');
        }
      } else {
        toast.error('Could not reach the server. Check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!orgId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center text-white space-y-4">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-gray-400">No organization selected.</p>
          <Link href="/org" className="text-white underline text-sm">Go to Merit for Organizations →</Link>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-xl font-bold text-white">Welcome to Merit!</p>
          <p className="text-gray-400 text-sm">Taking you to your dashboard...</p>
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <a href="/org" className="text-2xl font-bold text-white">merit.</a>
        <p className="text-gray-500 text-sm mt-1">Set up your organization account</p>
      </div>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
        {orgName && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold shrink-0">
              {orgName[0]}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{orgName}</p>
              <p className="text-gray-500 text-xs">Setting up admin access</p>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">This will be your login for the org dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Your full name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Jane Smith"
              required
              autoFocus
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Work email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="jane@organization.org"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                required
                className={`${inputClass} pr-10 ${
                  form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Your role</label>
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value as typeof form.role)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="owner">Owner / Executive Director</option>
              <option value="admin">Volunteer Coordinator</option>
              <option value="coordinator">Staff / Coordinator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              !form.name ||
              !form.email ||
              !form.password ||
              form.password !== form.confirmPassword
            }
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link href="/org/login" className="text-gray-300 hover:text-white">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrgSetupPage() {
  return (
    <Suspense fallback={null}>
      <SetupForm />
    </Suspense>
  );
}
