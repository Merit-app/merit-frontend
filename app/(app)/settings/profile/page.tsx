'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
import { usersApi, authApi, mapUser, ApiError, profilesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { UsernameEditor } from './_components/username-editor';
import { PrivacyToggle } from './_components/privacy-toggle';
import { TopBadgesPicker } from './_components/top-badges-picker';

const GOAL_PRESETS: Record<string, number> = {
  NHS: 75,
  'IB CAS': 150,
  Graduation: 40,
  Scholarship: 50,
};

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  school: z.string().min(1, 'Required'),
  grade: z.number().min(9).max(12),
  graduationYear: z.number().min(2025).max(2035),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  goalProgram: z.string().optional(),
  goalHours: z.number().min(1).max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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
      goalProgram: user.goalProgram ?? '',
      goalHours: user.nhsGoalHours > 0 ? user.nhsGoalHours : undefined,
    },
  });

  const profileFields = [
    !!user.firstName && !!user.lastName,
    !!user.school,
    !!user.grade,
    !!user.graduationYear,
    !!user.goalProgram,
    !!user.nhsGoalHours,
    !!user.phone,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  function handleProgramChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const program = e.target.value;
    setValue('goalProgram', program, { shouldDirty: true });
    if (program && GOAL_PRESETS[program] !== undefined) {
      setValue('goalHours', GOAL_PRESETS[program], { shouldDirty: true });
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const res = await usersApi.update({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email !== user.email ? data.email : undefined,
        school: data.school,
        grade: data.grade,
        graduationYear: data.graduationYear,
        phone: data.phone || undefined,
        goalProgram: data.goalProgram || undefined,
        goalHours: data.goalHours && !isNaN(data.goalHours) ? data.goalHours : undefined,
      });
      updateUser(mapUser(res.data.user));
      toast.success('Profile saved.');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to save. Try again.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Profile</h2>
        <p className="text-small text-ink-500 mt-1">Your personal details and school information.</p>
      </div>

      {/* Avatar upload */}
      <AvatarUpload />


      <div className="rounded-2xl bg-ink-50 border border-ink-200 p-4 mb-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <p className="text-[13px] font-semibold text-ink-900">Profile {profileCompletion}% complete</p>
            <p className="text-[12px] text-ink-500">Complete your profile to get the most accurate graduation planning and goal guidance.</p>
          </div>
          <span className="text-[12px] font-medium text-merit-blue-600">{profileCompletion}%</span>
        </div>
        <div className="h-2 rounded-full bg-ink-200 overflow-hidden">
          <div className="h-full bg-merit-blue-600 transition-all" style={{ width: `${profileCompletion}%` }} />
        </div>
      </div>

      <Separator className="mb-8 bg-ink-200" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
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
            <Input type="number" min={9} max={12} {...register('grade', { valueAsNumber: true })} />
            {errors.grade && <p className="text-[12px] text-danger">{errors.grade.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-ink-900">Graduation year</Label>
            <select
              {...register('graduationYear', { valueAsNumber: true })}
              className="flex h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-[14px] text-ink-900 focus:outline-none hover:border-ink-300 transition-colors appearance-none"
            >
              <option value="">Select year</option>
              {[2025, 2026, 2027, 2028, 2029].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.graduationYear && <p className="text-[12px] text-danger">{errors.graduationYear.message}</p>}
          </div>
        </div>

        <Separator className="bg-ink-200" />

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Email</Label>
          <Input
            type="email"
            {...register('email')}
            className={cn(errors.email && 'border-danger')}
          />
          <p className="text-[12px] text-ink-500">
            Changing your email requires re-verification.
          </p>
          {errors.email && <p className="text-[12px] text-danger">{errors.email.message}</p>}
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
          <Input type="tel" placeholder="+16045550194" {...register('phone')} />
          <p className="text-[12px] text-ink-500">
            E.164 format (e.g. +16045550194). Used for account recovery and SMS verification.
          </p>
        </div>

        <Separator className="bg-ink-200" />

        {/* Service goal */}
        <div className="space-y-4">
          <div>
            <p className="text-[13px] font-semibold text-ink-900">Service goal</p>
            <p className="text-[12px] text-ink-500 mt-0.5">
              Set the program and total hours you're working toward.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-ink-900">Program</Label>
              <select
                {...register('goalProgram')}
                onChange={handleProgramChange}
                className="flex h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-[14px] text-ink-900 focus:outline-none hover:border-ink-300 transition-colors appearance-none"
              >
                <option value="">Select program</option>
                <option value="NHS">NHS (75 hrs)</option>
                <option value="IB CAS">IB CAS (150 hrs)</option>
                <option value="Graduation">Graduation (40 hrs)</option>
                <option value="Scholarship">Scholarship (50 hrs)</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-ink-900">Goal hours</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                placeholder="e.g. 75"
                {...register('goalHours', { valueAsNumber: true })}
              />
            </div>
          </div>
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

      <Separator className="my-8 bg-ink-200" />

      <PublicProfileSection />

      <Separator className="my-8 bg-ink-200" />

      <ChangePasswordSection />
    </div>
  );
}

// ── Avatar upload section ──────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FFE4E6', text: '#9F1239' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#E0E7FF', text: '#3730A3' },
];
function getAvatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function AvatarUpload() {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(user.avatarUrl ?? null);

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const color = getAvatarColor(fullName);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      // Avatar upload requires the Supabase storage bucket "avatars" to be created.
      // Show a friendly message until the bucket is configured.
      toast.info('Avatar upload coming soon — the storage bucket needs to be enabled in the Supabase dashboard first.');
      setPreview(null);
    } catch {
      toast.error('Upload failed. Try again.');
      setPreview(user.avatarUrl ?? null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleRemove() {
    try {
      const res = await usersApi.update({ avatarUrl: null } as any);
      updateUser(mapUser(res.data.user));
      setPreview(null);
      toast.success('Photo removed.');
    } catch {
      toast.error('Failed to remove photo.');
    }
  }

  return (
    <div className="flex items-center gap-5 mb-6">
      {/* Circle */}
      <div className="relative shrink-0">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-[26px] font-semibold overflow-hidden"
          style={preview ? {} : { background: color.bg, color: color.text }}
        >
          {preview ? (
            <img src={preview} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors disabled:opacity-50"
        >
          <Camera size={14} />
          Change photo
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-[12px] text-ink-400 hover:text-danger transition-colors"
          >
            <X size={12} />
            Remove photo
          </button>
        )}
        <p className="text-[11px] text-ink-400">JPG, PNG or WebP · max 5 MB</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function PublicProfileSection() {
  const user = useMeritStore((s) => s.user);
  const [profile, setProfile] = useState<{
    profilePublic: boolean;
    bio: string | null;
    topBadgeIds: string[];
  } | null>(null);
  const [bio, setBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  useEffect(() => {
    profilesApi.me().then((res) => {
      const p = res.data.profile;
      setProfile({
        profilePublic: p.profilePublic ?? true,
        bio: p.bio ?? null,
        topBadgeIds: p.topBadgeIds ?? [],
      });
      setBio(p.bio ?? '');
    }).catch(() => {
      setProfile({ profilePublic: true, bio: null, topBadgeIds: [] });
    });
  }, []);

  async function saveBio() {
    setSavingBio(true);
    setBioError(null);
    try {
      await profilesApi.update({ bio: bio.trim() || undefined });
      toast.success('Bio saved.');
    } catch (err) {
      if (err instanceof ApiError) {
        setBioError(err.message || 'Failed to save bio.');
      } else {
        setBioError('Could not reach the server.');
      }
    } finally {
      setSavingBio(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-ink-900">Public profile</h3>
        <p className="text-[12px] text-ink-500 mt-0.5">
          Control how you appear on Merit&apos;s public directory.
        </p>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Privacy toggle */}
        {profile && (
          <PrivacyToggle
            isPublic={profile.profilePublic}
            username={user.username}
          />
        )}

        <Separator className="bg-ink-200" />

        {/* Username */}
        <UsernameEditor />

        <Separator className="bg-ink-200" />

        {/* Bio */}
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-ink-900">Bio</Label>
          <p className="text-[12px] text-ink-500">
            A short description shown on your public profile. Max 200 characters.
          </p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            rows={3}
            placeholder="Tell the world what you're passionate about…"
            className="flex w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none hover:border-ink-300 resize-none transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-ink-400">{bio.length}/200</span>
            {bioError && <p className="text-[12px] text-danger">{bioError}</p>}
            <button
              type="button"
              onClick={saveBio}
              disabled={savingBio}
              className={cn(
                'px-3 py-1.5 rounded-lg bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[12px] font-medium transition-all',
                savingBio && 'opacity-60 cursor-not-allowed',
              )}
            >
              {savingBio ? 'Saving…' : 'Save bio'}
            </button>
          </div>
        </div>

        <Separator className="bg-ink-200" />

        {/* Pinned badges */}
        <div>
          <p className="text-[13px] font-medium text-ink-900 mb-1">Pinned badges</p>
          {profile && <TopBadgesPicker initialTopBadgeIds={profile.topBadgeIds} />}
        </div>
      </div>
    </div>
  );
}

function ChangePasswordSection() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const pwSchema = z.object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  }).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

  type PwForm = z.infer<typeof pwSchema>;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  });

  async function onSubmit(data: PwForm) {
    setSaving(true);
    setServerError(null);
    setSuccess(false);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
      toast.success('Password changed.');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message || 'Failed to change password. Try again.');
      } else {
        setServerError('Could not reach the server.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-ink-900">Change password</h3>
        <p className="text-[12px] text-ink-500 mt-0.5">You'll remain signed in after changing your password.</p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-danger/8 border border-danger/20 px-3 py-2.5">
          <p className="text-[13px] text-danger">{serverError}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-success/8 border border-success/20 px-3 py-2.5">
          <p className="text-[13px] text-success">Password updated successfully.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Current password</Label>
          <PasswordInput type="password" {...register('currentPassword')} className={cn(errors.currentPassword && 'border-danger')} />
          {errors.currentPassword && <p className="text-[12px] text-danger">{errors.currentPassword.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">New password</Label>
          <PasswordInput placeholder="8+ characters" {...register('newPassword')} className={cn(errors.newPassword && 'border-danger')} />
          {errors.newPassword && <p className="text-[12px] text-danger">{errors.newPassword.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Confirm new password</Label>
          <PasswordInput {...register('confirmPassword')} className={cn(errors.confirmPassword && 'border-danger')} />
          {errors.confirmPassword && <p className="text-[12px] text-danger">{errors.confirmPassword.message}</p>}
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium"
        >
          {saving ? 'Saving...' : 'Change password'}
        </Button>
      </form>
    </div>
  );
}
