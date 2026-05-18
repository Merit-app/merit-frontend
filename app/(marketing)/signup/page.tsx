'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMeritStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  school: z.string().min(1, 'School name is required.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const login = useMeritStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login();
    toast.success('Account created. Welcome to Merit.');
    router.replace('/dashboard');
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
              disabled={loading}
              className="w-full mt-1 bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100"
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
