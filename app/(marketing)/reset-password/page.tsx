'use client';

import type { Metadata } from 'next';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset your Merit password using the link sent to your email.',
  openGraph: {
    title: 'Reset password',
    description: 'Reset your Merit password using the link sent to your email.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app/reset-password',
  },
};

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

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? params.get('access_token') ?? '';

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // If no token present, redirect to forgot-password
  useEffect(() => {
    if (!token) {
      router.replace('/forgot-password');
    }
  }, [token, router]);

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
      router.replace('/login?message=password-updated');
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

  if (!token) return null;

  return (
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
        <Input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          autoFocus
          {...register('newPassword')}
          className={cn(errors.newPassword && 'border-danger')}
        />
        {errors.newPassword && (
          <p className="text-[13px] text-danger">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-ink-900">
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
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
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-ink-100" />}>
            <ResetPasswordForm />
          </Suspense>
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
