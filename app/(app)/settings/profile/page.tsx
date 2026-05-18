'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  school: z.string().min(1, 'Required'),
  grade: z.number().min(9).max(12),
  graduationYear: z.number().min(2025).max(2030),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      school: user.school,
      grade: user.grade,
      graduationYear: user.graduationYear,
      email: user.email,
      phone: user.phone ?? '',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateUser(data);
    setSaving(false);
    toast.success('Profile saved.');
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Profile</h2>
        <p className="text-small text-ink-500 mt-1">Your personal details and school information.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-semibold shrink-0"
          style={{ background: '#DBEAFE', color: '#1D4ED8' }}
        >
          {initials}
        </span>
        <div>
          <p className="text-[13px] font-medium text-ink-900">{user.firstName} {user.lastName}</p>
          <p className="text-small text-ink-500">{user.school} · Grade {user.grade}</p>
        </div>
      </div>

      <Separator className="mb-8 bg-ink-200" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">First name</Label>
            <Input {...register('firstName')} className={cn(errors.firstName && 'border-danger')} />
            {errors.firstName && <p className="text-[12px] text-danger">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Last name</Label>
            <Input {...register('lastName')} className={cn(errors.lastName && 'border-danger')} />
            {errors.lastName && <p className="text-[12px] text-danger">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* School */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">School</Label>
          <Input {...register('school')} className={cn(errors.school && 'border-danger')} />
          {errors.school && <p className="text-[13px] text-danger">{errors.school.message}</p>}
        </div>

        {/* Grade + grad year */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Grade</Label>
            <Input type="number" min={9} max={12} {...register('grade')} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Graduation year</Label>
            <Input type="number" min={2025} max={2030} {...register('graduationYear')} />
          </div>
        </div>

        <Separator className="bg-ink-200" />

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Email</Label>
          <Input type="email" {...register('email')} className={cn(errors.email && 'border-danger')} />
          {errors.email && <p className="text-[13px] text-danger">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-[13px] font-medium text-ink-900">Phone number</Label>
            {user.phoneVerified && (
              <span className="text-[11px] font-medium text-success bg-success-bg px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
          <Input type="tel" placeholder="(604) 555-0194" {...register('phone')} />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={!isDirty || saving}
            className={cn(
              'bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium transition-all',
              (!isDirty || saving) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
