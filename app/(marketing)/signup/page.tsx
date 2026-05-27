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
import { PasswordInput } from '@/components/ui/password-input';
import { useMeritStore } from '@/lib/store';
import { authApi, mapUser, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CURRENT_YEAR = new Date().getFullYear();

function getDaysInMonth(month: string, year: string): number {
  if (!month || !year) return 31;
  return new Date(parseInt(year), parseInt(month), 0).getDate();
}

const schema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  school: z.string().min(1, 'School name is required.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy.',
  }),
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

const selectClass = [
  'flex h-10 w-full rounded-lg border bg-white px-3 text-[14px] text-ink-900',
  'focus:outline-none transition-colors appearance-none',
  'border-ink-200 hover:border-ink-300',
].join(' ');

const selectErrorClass = 'border-danger';

export default function SignupPage() {
  const router = useRouter();
  const login = useMeritStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);

  // DOB dropdown state
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreedToTerms: false },
  });

  // Clamp day when month/year changes
  useEffect(() => {
    if (!dobDay) return;
    const max = getDaysInMonth(dobMonth, dobYear);
    if (parseInt(dobDay) > max) setDobDay('');
  }, [dobMonth, dobYear]);

  // Combine dropdowns → ISO date string
  useEffect(() => {
    if (dobMonth && dobDay && dobYear) {
      const iso = `${dobYear}-${dobMonth}-${dobDay.padStart(2, '0')}`;
      setValue('dateOfBirth', iso, { shouldValidate: true, shouldDirty: true });
    } else {
      setValue('dateOfBirth', '');
    }
  }, [dobMonth, dobDay, dobYear, setValue]);

  const dobValue = useWatch({ control, name: 'dateOfBirth' });
  const age = calcAge(dobValue);
  const isMinor = age !== null && age >= 13 && age < 18;
  const underThirteen = age !== null && age < 13;

  const daysInMonth = getDaysInMonth(dobMonth, dobYear);
  const dobError = !!errors.dateOfBirth;

  async function onSubmit(data: FormData) {
    if (underThirteen) {
      setServerError('Users must be 13 or older to create an account.');
      return;
    }

    setLoading(true);
    setServerError(null);
    setEmailTaken(false);

    try {
      // 1. Create account
      await authApi.signup({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
        dateOfBirth: data.dateOfBirth,
        school: data.school,
      });

      // 2. Auto-login to get tokens
      const loginRes = await authApi.login(data.email, data.password);
      const { user: rawUser, session } = loginRes.data;
      login(mapUser(rawUser), {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      });

      // 3. Minors go through one-time consent page first
      if (isMinor) {
        router.replace('/onboarding/consent');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'email_taken') {
          setEmailTaken(true);
          setServerError('An account with this email already exists.');
        } else if (err.code === 'weak_password') {
          setServerError('Password is too weak. Try something harder to guess.');
        } else if (err.code === 'age_restricted') {
          setServerError('Users must be 13 or older to create an account.');
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
                <p className="text-[13px] text-danger">
                  {serverError}
                  {emailTaken && (
                    <>
                      {' '}
                      <Link
                        href="/login"
                        className="underline font-medium hover:text-danger/80 transition-colors"
                      >
                        Sign in instead →
                      </Link>
                    </>
                  )}
                </p>
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
                  placeholder="First name"
                  autoFocus
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
                  placeholder="Last name"
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
                placeholder="Your school"
                {...register('school')}
                className={cn(errors.school && 'border-danger')}
              />
              {errors.school && (
                <p className="text-[13px] text-danger">{errors.school.message}</p>
              )}
            </div>

            {/* Date of Birth — three dropdowns */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-ink-900">
                Date of birth
              </Label>
              {/* Hidden field that react-hook-form owns */}
              <input type="hidden" {...register('dateOfBirth')} />
              <div className="grid grid-cols-3 gap-2">
                {/* Month */}
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className={cn(selectClass, dobError && !dobMonth && selectErrorClass)}
                >
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={i} value={String(i + 1).padStart(2, '0')}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Day */}
                <select
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  className={cn(selectClass, dobError && !dobDay && selectErrorClass)}
                >
                  <option value="">Day</option>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                {/* Year */}
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className={cn(selectClass, dobError && !dobYear && selectErrorClass)}
                >
                  <option value="">Year</option>
                  {Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => {
                    const y = CURRENT_YEAR - i;
                    return (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </div>
              {dobError && !dobValue && (
                <p className="text-[13px] text-danger">{errors.dateOfBirth?.message}</p>
              )}
              {underThirteen && (
                <p className="text-[13px] text-danger">
                  You must be at least 13 to create an account.
                </p>
              )}
            </div>

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
              <PasswordInput
                id="password"
                placeholder="8+ characters"
                error={!!errors.password}
                autoComplete="new-password"
                {...register('password')}
                className={cn(errors.password && 'border-danger')}
              />
              {errors.password && (
                <p className="text-[13px] text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('agreedToTerms')}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-merit-blue-600 focus:ring-merit-blue-500 accent-merit-blue-600 cursor-pointer shrink-0"
                />
                <span className="text-[13px] text-ink-600 leading-snug">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-merit-blue-600 hover:text-merit-blue-700 font-medium underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-merit-blue-600 hover:text-merit-blue-700 font-medium underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-[12px] text-danger">{errors.agreedToTerms.message}</p>
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
          <Link href="/login" className="text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
