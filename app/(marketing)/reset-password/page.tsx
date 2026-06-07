'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { authApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [tokenReady, setTokenReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Supabase sends the access_token in the URL hash:
  //   /reset-password#access_token=XXX&type=recovery&...
  // Hash fragments are client-only — never in query params, never on the server.
  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading #
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
      setToken(accessToken);
      // Scrub the token from the URL bar so it's not visible / shared
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      // Fall back to query param for any custom reset links
      const qParams = new URLSearchParams(window.location.search);
      const qToken = qParams.get('token') ?? qParams.get('access_token') ?? '';
      if (qToken) {
        setToken(qToken);
      } else {
        // No token at all — send back to forgot-password
        router.replace('/forgot-password');
        return;
      }
    }

    setTokenReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    if (!token) return;
    setLoading(true);
    setServerError(null);
    try {
      await authApi.resetPassword(token, data.newPassword);
      // If this reset began on the org side, return the user to the org login.
      let dest = '/login?message=password-updated';
      try {
        if (localStorage.getItem('merit-reset-context') === 'org') {
          dest = '/org/login?message=password-updated';
        }
        localStorage.removeItem('merit-reset-context');
      } catch { /* ignore */ }
      router.replace(dest);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setServerError(err.message || 'Could not reset password. The link may have expired.');
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

  // Still resolving token from hash
  if (!tokenReady) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-[22px] font-semibold tracking-tight text-ink-900">
            merit<span className="text-merit-blue-600">.</span>
          </span>
          <p className="mt-1 text-small text-ink-500">Set a new password</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-lg bg-danger/8 border border-danger/20 px-3 py-2.5">
                <p className="text-[13px] text-danger">{serverError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-[13px] font-medium text-ink-900">
                New password
              </Label>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                error={!!errors.newPassword}
                autoComplete="new-password"
                autoFocus
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-[13px] text-danger">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-ink-900">
                Confirm new password
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={cn(errors.confirmPassword && 'border-danger')}
              />
              {errors.confirmPassword && (
                <p className="text-[13px] text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-small text-ink-500">
          <Link
            href="/login"
            className="text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
