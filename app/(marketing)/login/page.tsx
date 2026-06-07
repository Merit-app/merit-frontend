'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useMeritStore } from '@/lib/store';
import { authApi, mapUser, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useMeritStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const passwordUpdated = params.get('message') === 'password-updated';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setServerError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      const { user: rawUser, session } = res.data;
      login(mapUser(rawUser), {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      });
      // Honor a relative ?redirect= (e.g. invite-accept flow). Only allow paths
      // that start with a single "/" to avoid open-redirect to external sites.
      const redirect = params.get('redirect');
      const dest = redirect && /^\/(?!\/)/.test(redirect) ? redirect : '/dashboard';
      router.replace(dest);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError('Incorrect email or password.');
        } else if (err.status === 423) {
          setServerError('Account temporarily locked. Try again in 15 minutes.');
        } else {
          setServerError(err.message || 'Something went wrong. Try again.');
        }
      } else {
        setServerError('Could not reach the server. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-[22px] font-semibold tracking-tight text-ink-900">
            merit<span className="text-merit-blue-600">.</span>
          </span>
          <p className="mt-1 text-small text-ink-500">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Password updated banner */}
            {passwordUpdated && (
              <div className="rounded-lg bg-success/8 border border-success/20 px-3 py-2.5">
                <p className="text-[13px] text-success">Password updated. Sign in with your new password.</p>
              </div>
            )}

            {/* Server error */}
            {serverError && (
              <div className="rounded-lg bg-danger/8 border border-danger/20 px-3 py-2.5">
                <p className="text-[13px] text-danger">{serverError}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-ink-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                {...register('email')}
                className={cn(errors.email && 'border-danger')}
              />
              {errors.email && (
                <p className="text-[13px] text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-ink-900">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                error={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[13px] text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-small text-ink-500">
          No account?{' '}
          <Link
            href="/signup"
            className="text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>

        {/* Cross-promotion to org login */}
        <div className="mt-6 pt-6 border-t border-ink-200">
          <Link
            href="/org/login"
            className="group flex items-center gap-3 p-3 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-ink-200 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-ink-700" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-ink-900">Managing a nonprofit?</p>
              <p className="text-xs text-ink-500">Sign in to your organization account</p>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-ink-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
