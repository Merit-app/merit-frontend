'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setServerError(null);
    try {
      await authApi.requestPasswordReset(data.email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message || 'Something went wrong. Try again.');
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
          <p className="mt-1 text-small text-ink-500">Reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          {sent ? (
            /* Success state */
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-merit-blue-50 flex items-center justify-center">
                  <MailCheck size={22} className="text-merit-blue-600" />
                </div>
              </div>
              <p className="text-[15px] font-medium text-ink-900">Check your email</p>
              <p className="text-[13px] text-ink-500 leading-relaxed">
                We sent a reset link to{' '}
                <span className="font-medium text-ink-700">{getValues('email')}</span>.
                If it doesn&apos;t arrive in a minute, check your spam folder.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-[13px] text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <div className="rounded-lg bg-danger/8 border border-danger/20 px-3 py-2.5">
                  <p className="text-[13px] text-danger">{serverError}</p>
                </div>
              )}

              <p className="text-[13px] text-ink-500 leading-relaxed">
                Enter the email address linked to your account and we&apos;ll send you a reset link.
              </p>

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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}
        </div>

        {!sent && (
          <p className="mt-5 text-center text-small text-ink-500">
            <Link
              href="/login"
              className="text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
