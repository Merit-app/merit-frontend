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
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
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
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 700));
    login();
    toast.success('Welcome back, Kai.');
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
          <p className="mt-1 text-small text-ink-500">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-ink-900">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-[13px] text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
                  onClick={() => toast.info('Password reset is coming soon.')}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
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

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-ink-200" />
            <span className="text-micro text-ink-400">or</span>
            <div className="flex-1 h-px bg-ink-200" />
          </div>

          {/* Demo shortcut */}
          <Button
            variant="outline"
            className="w-full border-ink-200 text-ink-700 hover:bg-ink-50 font-medium"
            onClick={async () => {
              setLoading(true);
              await new Promise((r) => setTimeout(r, 400));
              login();
              toast.success('Signed in as Kai Johnson.');
              router.replace('/dashboard');
            }}
          >
            Continue as Kai (demo)
          </Button>
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
      </div>
    </div>
  );
}
