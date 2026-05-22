'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMeritStore } from '@/lib/store';
import { authApi, mapUser, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  school: z.string().min(1, 'School name is required.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  parentEmail: z.string().email('Enter a valid parent email.').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export default function SignupPage() {
  const router = useRouter();
  const login = useMeritStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const dobValue = useWatch({ control, name: 'dateOfBirth' });
  const age = calcAge(dobValue);
  const isMinor = age !== null && age >= 13 && age < 18;
  const underThirteen = age !== null && age < 13;

  async function onSubmit(data: FormData) {
    if (underThirteen) {
      setServerError('Users must be 13 or older to create an account.');
      return;
    }
    if (isMinor && !data.parentEmail) {
      setServerError('A parent or guardian email is required for users under 18.');
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      // 1. Create account
      await authApi.signup({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
        dateOfBirth: data.dateOfBirth,
        school: data.school,
        goalProgram: 'NHS',
        goalHours: 75,
        parentEmail: isMinor ? (data.parentEmail || undefined) : undefined,
      });

      // 2. Auto-login to get tokens
      const loginRes = await authApi.login(data.email, data.password);
      const { user: rawUser, session } = loginRes.data;
      login(mapUser(rawUser), {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      });

      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'email_taken') {
          setServerError('An account with this email already exists.');
        } else if (err.code === 'weak_password') {
          setServerError('Password is too weak. Try something harder to guess.');
        } else if (err.code === 'age_restricted') {
          setServerError('Users must be 13 or older to create an account.');
        } else if (err.code === 'parental_email_required') {
          setServerError('A parent or guardian email is required for users under 18.');
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
          <p className="mt-1 text-small text-ink-500">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div className="rounded-lg bg-danger/8 border border-danger/20 px-3 py-2.5">
                <p className="text-[13px] text-danger">{serverError}</p>
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-[13px] font-medium text-ink-900">
                  First name
                </Label>
                <Input
                  id="firstName"
                  placeholder="Kai"
                  {...register('firstName')}
                  className={cn(errors.firstName && 'border-danger')}
                />
                {errors.firstName && (
                  <p className="text-[12px] text-danger">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-[13px] font-medium text-ink-900">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Johnson"
                  {...register('lastName')}
                  className={cn(errors.lastName && 'border-danger')}
                />
                {errors.lastName && (
                  <p className="text-[12px] text-danger">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* School */}
            <div className="space-y-1.5">
              <Label htmlFor="school" className="text-[13px] font-medium text-ink-900">
                School
              </Label>
              <Input
                id="school"
                placeholder="Lord Byng Secondary"
                {...register('school')}
                className={cn(errors.school && 'border-danger')}
              />
              {errors.school && (
                <p className="text-[13px] text-danger">{errors.school.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="text-[13px] font-medium text-ink-900">
                Date of birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('dateOfBirth')}
                className={cn(errors.dateOfBirth && 'border-danger')}
              />
              {errors.dateOfBirth && (
                <p className="text-[13px] text-danger">{errors.dateOfBirth.message}</p>
              )}
              {underThirteen && (
                <p className="text-[13px] text-danger">You must be at least 13 to create an account.</p>
              )}
            </div>

            {/* Parent email for minors */}
            {isMinor && (
              <div className="space-y-1.5">
                <Label htmlFor="parentEmail" className="text-[13px] font-medium text-ink-900">
                  Parent or guardian email
                </Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  {...register('parentEmail')}
                  className={cn(errors.parentEmail && 'border-danger')}
                />
                <p className="text-[12px] text-ink-500">
                  Required for users under 18. They'll receive a consent link.
                </p>
                {errors.parentEmail && (
                  <p className="text-[12px] text-danger">{errors.parentEmail.message}</p>
                )}
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
                placeholder="kai@student.vsb.bc.ca"
                autoComplete="email"
                {...register('email')}
                className={cn(errors.email && 'border-danger')}
              />
              {errors.email && (
                <p className="text-[13px] text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-ink-900">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="8+ characters"
                autoComplete="new-password"
                {...register('password')}
                className={cn(errors.password && 'border-danger')}
              />
              {errors.password && (
                <p className="text-[13px] text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || underThirteen}
              className="w-full mt-1 bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-small text-ink-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
