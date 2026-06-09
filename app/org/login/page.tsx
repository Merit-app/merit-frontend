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
  const setIsOrgAdmin = useMeritStore((s) => s.setIsOrgAdmin);

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

      // Normalise logo_url → logoUrl
      const mappedOrgs = (orgs ?? []).map((o: any) => ({
        id: o.id,
        name: o.name,
        slug: o.slug ?? o.id,
        logoUrl: o.logo_url ?? undefined,
        role: o.role as 'owner' | 'admin' | 'coordinator',
      }));

      // One unified Merit session — same store the student side uses.
      const u = rawUser ?? { id: '', name: email.split('@')[0], email, plan: 'free' };
      login(mapUser(u), {
        accessToken,
        refreshToken,
        expiresAt: expiresAt ?? Math.floor(Date.now() / 1000) + 3600,
      });
      setAdminOrgs(mappedOrgs);
      setIsOrgAdmin(mappedOrgs.length > 0);
      const landingOrg = defaultOrgId ?? mappedOrgs[0]?.id ?? '';
      setCurrentOrgId(landingOrg);

      toast.success('Welcome back!');
      router.push(`/org/${landingOrg}/dashboard`);
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <a href="/org" className="text-2xl font-bold text-foreground">merit.</a>
        <p className="text-muted-foreground text-sm mt-1">Organization dashboard</p>
      </div>

      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8">
        {/* Cross-promotion to student login */}
        <Link
          href="/login"
          className="group flex items-center gap-3 p-3 rounded-xl bg-card/5 hover:bg-card/10 transition-colors mb-6 border border-white/10"
        >
          <div className="w-9 h-9 rounded-lg bg-card/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Tracking your own volunteer hours?</p>
            <p className="text-xs text-muted-foreground">Student sign in</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <h1 className="text-xl font-bold text-foreground mb-6">Sign in to your organization</h1>

        {serverError && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-danger">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.org"
              autoFocus
              required
              className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-ring transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-foreground text-background font-semibold py-3 rounded-xl text-sm hover:bg-muted disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm text-center">
          <p className="text-muted-foreground">
            Don&apos;t have access?{' '}
            <Link href="/org/join" className="text-muted-foreground hover:text-foreground">
              Accept an invitation
            </Link>
          </p>
          <p className="text-muted-foreground">
            <Link href="/login" className="hover:text-muted-foreground">
              Student sign in →
            </Link>
          </p>
          <p className="text-muted-foreground">
            <Link href="/org/forgot-password" className="hover:text-muted-foreground">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
