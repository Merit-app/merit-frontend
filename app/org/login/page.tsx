'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { useMeritStore } from '@/lib/store';
import { orgAuthApi, mapUser, ApiError } from '@/lib/api';

export default function OrgLoginPage() {
  const router = useRouter();
  const login = useMeritStore((s) => s.login);
  const setAdminOrgs = useMeritStore((s) => s.setAdminOrgs);
  const setCurrentOrgId = useMeritStore((s) => s.setCurrentOrgId);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await orgAuthApi.login(email, password);
      const { user: rawUser, orgs, defaultOrgId, accessToken, refreshToken, expiresAt } = res.data;

      // Map raw user → typed User, store alongside tokens
      login(mapUser(rawUser), {
        accessToken,
        refreshToken,
        expiresAt: expiresAt ?? Math.floor(Date.now() / 1000) + 3600,
      });

      // Store org context — normalise logo_url → logoUrl
      const mappedOrgs = (orgs ?? []).map((o: any) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        logoUrl: o.logo_url ?? undefined,
        role: o.role,
      }));
      setAdminOrgs(mappedOrgs);
      setCurrentOrgId(defaultOrgId ?? mappedOrgs[0]?.id);

      toast.success('Welcome back!');
      router.push(`/org/${defaultOrgId ?? mappedOrgs[0]?.id}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError('Invalid email or password.');
        } else if (err.status === 403) {
          setServerError(
            'No organization access found. Ask your coordinator to invite you, or claim your org page.',
          );
        } else {
          setServerError(err.message || 'Something went wrong. Try again.');
        }
      } else {
        setServerError('Could not reach the server. Check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <a href="/org" className="text-2xl font-bold text-white">merit.</a>
        <p className="text-gray-500 text-sm mt-1">Organization dashboard</p>
      </div>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8">
        {/* Cross-promotion to student login */}
        <Link
          href="/login"
          className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors mb-6 border border-white/10"
        >
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Tracking your own volunteer hours?</p>
            <p className="text-xs text-gray-500">Student sign in</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <h1 className="text-xl font-bold text-white mb-6">Sign in to your organization</h1>

        {serverError && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.org"
              autoFocus
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800 space-y-2 text-sm text-center">
          <p className="text-gray-500">
            Don&apos;t have access?{' '}
            <Link href="/org/join" className="text-gray-300 hover:text-white">
              Accept an invitation
            </Link>
          </p>
          <p className="text-gray-600">
            <Link href="/login" className="hover:text-gray-400">
              Student sign in →
            </Link>
          </p>
          <p className="text-gray-600">
            <Link href="/forgot-password" className="hover:text-gray-400">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
