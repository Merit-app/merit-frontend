'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Camera,
  X,
  Globe,
  Lock,
  Link2,
  Check,
  Award,
  Clock,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMeritStore } from '@/lib/store';
import { usersApi, authApi, mapUser, ApiError, profilesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { UsernameEditor } from './_components/username-editor';
import { TopBadgesPicker } from './_components/top-badges-picker';

// ── Constants ─────────────────────────────────────────────────────────────────

const GOAL_PRESETS: Record<string, number> = {
  NHS: 75,
  'IB CAS': 150,
  Graduation: 40,
  Scholarship: 50,
};

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

// ── Account form schema ───────────────────────────────────────────────────────

const accountSchema = z.object({
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
type AccountFormData = z.infer<typeof accountSchema>;

// ── Preview card ──────────────────────────────────────────────────────────────

interface PreviewProps {
  name: string;
  username?: string;
  avatarUrl?: string | null;
  bio: string;
  isPublic: boolean;
  verifiedHours: number;
  orgCount: number;
}

function ProfilePreviewCard({
  name,
  username,
  avatarUrl,
  bio,
  isPublic,
  verifiedHours,
  orgCount,
}: PreviewProps) {
  const [copied, setCopied] = useState(false);
  const profileUrl = username ? `meritco.app/u/${username}` : null;
  const initials = name
    .split(' ')
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
  const color = getAvatarColor(name);

  function copyLink() {
    if (!profileUrl) return;
    navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white overflow-hidden shadow-sm">
      {/* Header banner */}
      <div className="h-16 bg-gradient-to-br from-merit-blue-500 to-merit-blue-700" />

      {/* Avatar */}
      <div className="px-5 pb-4">
        <div className="flex items-end justify-between -mt-8 mb-3">
          <div
            className="w-16 h-16 rounded-full ring-4 ring-white flex items-center justify-center text-[20px] font-semibold shrink-0 overflow-hidden"
            style={avatarUrl ? {} : { background: color.bg, color: color.text }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {/* Privacy badge */}
          <span
            className={cn(
              'flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full',
              isPublic
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-ink-100 text-ink-500 border border-ink-200',
            )}
          >
            {isPublic ? <Globe size={9} /> : <Lock size={9} />}
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        {/* Name / username */}
        <p className="text-[15px] font-bold text-ink-900 leading-tight">{name || 'Your Name'}</p>
        {username ? (
          <p className="text-[12px] text-ink-400 mt-0.5">@{username}</p>
        ) : (
          <p className="text-[12px] text-ink-300 mt-0.5 italic">@username not set</p>
        )}

        {/* Bio */}
        <p className="text-[12px] text-ink-600 mt-2 leading-relaxed min-h-[32px]">
          {bio || <span className="text-ink-300 italic">No bio yet</span>}
        </p>

        <Separator className="my-3 bg-ink-100" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-ink-50 px-2 py-2.5">
            <div className="flex items-center justify-center gap-1 text-ink-400 mb-1">
              <Clock size={11} />
              <span className="text-[10px]">Verified hours</span>
            </div>
            <p className="text-[18px] font-bold text-ink-900">{verifiedHours}</p>
          </div>
          <div className="rounded-lg bg-ink-50 px-2 py-2.5">
            <div className="flex items-center justify-center gap-1 text-ink-400 mb-1">
              <Building2 size={11} />
              <span className="text-[10px]">Organizations</span>
            </div>
            <p className="text-[18px] font-bold text-ink-900">{orgCount}</p>
          </div>
        </div>

        {/* Shareable link */}
        {profileUrl && isPublic ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2">
            <Link2 size={12} className="text-ink-400 shrink-0" />
            <span className="flex-1 text-[11px] text-ink-500 truncate">{profileUrl}</span>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 text-[11px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors flex items-center gap-1"
            >
              {copied ? <Check size={11} /> : <Link2 size={11} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ) : (
          <p className="mt-3 text-[11px] text-ink-400 italic text-center">
            {!isPublic
              ? 'Make your profile public to share it.'
              : 'Set a username to get your shareable link.'}
          </p>
        )}
      </div>

      <div className="border-t border-ink-100 px-5 py-2.5 bg-ink-50/50">
        <p className="text-[10px] text-ink-400 text-center">Live preview · updates as you edit</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);
  const updateUser = useMeritStore((s) => s.updateUser);

  // Preview state (live-updated as user edits)
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(
    user.avatarUrl ?? null,
  );
  const [previewBio, setPreviewBio] = useState(user.bio ?? '');
  const [previewIsPublic, setPreviewIsPublic] = useState(user.profilePublic ?? true);

  // Profile data from API (for public profile section initial values)
  const [profileData, setProfileData] = useState<{
    profilePublic: boolean;
    bio: string;
    topBadgeIds: string[];
  } | null>(null);

  useEffect(() => {
    profilesApi.me().then((res) => {
      const p = res.data.profile;
      const pub = p.profile_public ?? p.profilePublic ?? true;
      const bio = p.bio ?? '';
      const topBadgeIds = p.top_badge_ids ?? p.topBadgeIds ?? [];
      setProfileData({ profilePublic: pub, bio, topBadgeIds });
      setPreviewBio(bio);
      setPreviewIsPublic(pub);
    }).catch(() => {
      setProfileData({ profilePublic: true, bio: '', topBadgeIds: [] });
    });
  }, []);

  // Stats from store
  const verifiedHours = sessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);
  const orgCount = new Set(sessions.map((s) => s.orgSlug).filter(Boolean)).size;

  // Preview name follows the account form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
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

  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');
  const previewName =
    `${watchedFirstName ?? ''} ${watchedLastName ?? ''}`.trim() ||
    `${user.firstName} ${user.lastName}`.trim();

  const [saving, setSaving] = useState(false);

  function handleProgramChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const program = e.target.value;
    setValue('goalProgram', program, { shouldDirty: true });
    if (program && GOAL_PRESETS[program] !== undefined) {
      setValue('goalHours', GOAL_PRESETS[program], { shouldDirty: true });
    }
  }

  async function onAccountSubmit(data: AccountFormData) {
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
      toast.success('Account info saved.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-h1 text-ink-900">Public Profile</h2>
        <p className="text-small text-ink-500 mt-1">
          Manage your account info and control how you appear publicly on Merit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-8 items-start">
        {/* ── Left: controls ── */}
        <div className="space-y-8 min-w-0">

          {/* Privacy toggle — first and most visible */}
          <PrivacyToggleSection
            initialPublic={profileData?.profilePublic ?? true}
            username={user.username}
            onToggle={setPreviewIsPublic}
          />

          <Separator className="bg-ink-200" />

          {/* Avatar */}
          <AvatarUploadSection
            previewAvatarUrl={previewAvatarUrl}
            onPreviewChange={setPreviewAvatarUrl}
          />

          <Separator className="bg-ink-200" />

          {/* Account info */}
          <section>
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold text-ink-900">Account info</h3>
              <p className="text-[12px] text-ink-500 mt-0.5">Your name, school and contact details.</p>
            </div>
            <form onSubmit={handleSubmit(onAccountSubmit)} className="space-y-4">
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

              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink-900">School</Label>
                <Input {...register('school')} className={cn(errors.school && 'border-danger')} />
                {errors.school && <p className="text-[13px] text-danger">{errors.school.message}</p>}
              </div>

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

              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink-900">Email</Label>
                <Input type="email" {...register('email')} className={cn(errors.email && 'border-danger')} />
                <p className="text-[12px] text-ink-500">Changing your email requires re-verification.</p>
                {errors.email && <p className="text-[12px] text-danger">{errors.email.message}</p>}
              </div>

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

              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">Service goal</p>
                  <p className="text-[12px] text-ink-500 mt-0.5">
                    Set the program and total hours you&apos;re working toward.
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

              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={!isDirty || saving}
                  className={cn(
                    'bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium transition-all',
                    (!isDirty || saving) && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {saving ? 'Saving...' : 'Save account info'}
                </Button>
              </div>
            </form>
          </section>

          <Separator className="bg-ink-200" />

          {/* Public profile */}
          <section>
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold text-ink-900">Public profile</h3>
              <p className="text-[12px] text-ink-500 mt-0.5">
                Customize how you appear on Merit&apos;s public directory.
              </p>
            </div>

            <div className="space-y-6">
              {/* Username */}
              <UsernameEditor />

              <Separator className="bg-ink-200" />

              {/* Bio */}
              <BioEditor
                initialBio={profileData?.bio ?? ''}
                onBioChange={setPreviewBio}
              />

              <Separator className="bg-ink-200" />

              {/* Pinned badges */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Award size={13} className="text-ink-400" />
                  <p className="text-[13px] font-medium text-ink-900">Pinned badges</p>
                </div>
                <p className="text-[12px] text-ink-500 mb-3">
                  Pin up to 3 badges to highlight on your profile.
                </p>
                {profileData && <TopBadgesPicker initialTopBadgeIds={profileData.topBadgeIds} />}
              </div>
            </div>
          </section>

          <Separator className="bg-ink-200" />

          {/* Change password */}
          <ChangePasswordSection />
        </div>

        {/* ── Right: preview ── */}
        <div className="lg:sticky lg:top-6">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide mb-3">
            Profile preview
          </p>
          <ProfilePreviewCard
            name={previewName}
            username={user.username}
            avatarUrl={previewAvatarUrl}
            bio={previewBio}
            isPublic={previewIsPublic}
            verifiedHours={verifiedHours}
            orgCount={orgCount}
          />
        </div>
      </div>
    </div>
  );
}

// ── Avatar upload section ─────────────────────────────────────────────────────

function AvatarUploadSection({
  previewAvatarUrl,
  onPreviewChange,
}: {
  previewAvatarUrl: string | null;
  onPreviewChange: (url: string | null) => void;
}) {
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

    // Show preview immediately while uploading
    const objectUrl = URL.createObjectURL(file);
    onPreviewChange(objectUrl);
    setUploading(true);

    try {
      // Convert to base64 for backend upload
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await profilesApi.uploadAvatar(base64, file.type);
      const persistedUrl = res.data.avatarUrl;
      updateUser({ avatarUrl: persistedUrl });
      onPreviewChange(persistedUrl);
      toast.success('Photo updated.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed. Try again.');
      // Revert preview on failure
      onPreviewChange(user.avatarUrl ?? null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleRemove() {
    try {
      const res = await usersApi.update({ avatarUrl: null } as any);
      updateUser(mapUser(res.data.user));
      onPreviewChange(null);
      toast.success('Photo removed.');
    } catch {
      toast.error('Failed to remove photo.');
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-[26px] font-semibold overflow-hidden"
          style={previewAvatarUrl ? {} : { background: color.bg, color: color.text }}
        >
          {previewAvatarUrl ? (
            <img src={previewAvatarUrl} alt={fullName} className="w-full h-full object-cover" />
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

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors disabled:opacity-50"
        >
          <Camera size={14} />
          {uploading ? 'Uploading…' : 'Change photo'}
        </button>
        {previewAvatarUrl && !uploading && (
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

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Privacy toggle section ────────────────────────────────────────────────────

function PrivacyToggleSection({
  initialPublic,
  username,
  onToggle,
}: {
  initialPublic: boolean;
  username?: string;
  onToggle: (isPublic: boolean) => void;
}) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync when profileData loads (async)
  useEffect(() => {
    setIsPublic(initialPublic);
  }, [initialPublic]);

  async function toggle() {
    const next = !isPublic;
    setSaving(true);
    try {
      await profilesApi.update({ profilePublic: next });
      setIsPublic(next);
      onToggle(next);
      toast.success(next ? 'Profile is now public.' : 'Profile is now private.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update privacy.');
    } finally {
      setSaving(false);
    }
  }

  function copyLink() {
    if (!username) return;
    navigator.clipboard.writeText(`https://meritco.app/u/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const profileUrl = username ? `meritco.app/u/${username}` : null;

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 transition-colors',
        isPublic
          ? 'border-green-300 bg-green-50'
          : 'border-ink-200 bg-white',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              isPublic ? 'bg-green-100' : 'bg-ink-100',
            )}
          >
            {isPublic ? (
              <Globe size={15} className="text-green-700" />
            ) : (
              <Lock size={15} className="text-ink-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className={cn('text-[14px] font-semibold', isPublic ? 'text-green-900' : 'text-ink-900')}>
              {isPublic ? 'Profile is public' : 'Profile is private'}
            </p>
            <p className={cn('text-[12px] mt-0.5', isPublic ? 'text-green-700' : 'text-ink-500')}>
              {isPublic
                ? profileUrl
                  ? `Visible at meritco.app/u/${username}`
                  : 'Visible to anyone — set a username to get your link.'
                : 'Only you can see your stats. Toggle on to share your progress.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          disabled={saving}
          onClick={toggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none disabled:opacity-60',
            isPublic ? 'bg-green-500' : 'bg-ink-300',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
              isPublic ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {/* Copy link row — only when public + username set */}
      {isPublic && profileUrl && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-white/70 px-3 py-2">
          <Link2 size={12} className="text-green-600 shrink-0" />
          <span className="flex-1 text-[12px] text-green-800 truncate font-mono">{profileUrl}</span>
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1 text-[12px] font-medium text-green-700 hover:text-green-900 transition-colors"
          >
            {copied ? <Check size={11} /> : <Link2 size={11} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Bio editor ────────────────────────────────────────────────────────────────

function BioEditor({
  initialBio,
  onBioChange,
}: {
  initialBio: string;
  onBioChange: (bio: string) => void;
}) {
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  // Sync if parent loads later
  useEffect(() => {
    setBio(initialBio);
    onBioChange(initialBio);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBio]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value.slice(0, 200);
    setBio(val);
    onBioChange(val);
  }

  async function saveBio() {
    setSaving(true);
    setBioError(null);
    try {
      await profilesApi.update({ bio: bio.trim() || undefined });
      toast.success('Bio saved.');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not reach the server.';
      setBioError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-[13px] font-medium text-ink-900">Bio</Label>
      <p className="text-[12px] text-ink-500">
        A short description shown on your public profile. Max 200 characters.
      </p>
      <textarea
        value={bio}
        onChange={handleChange}
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
          disabled={saving}
          className={cn(
            'px-3 py-1.5 rounded-lg bg-merit-blue-600 hover:bg-merit-blue-700 text-white text-[12px] font-medium transition-all',
            saving && 'opacity-60 cursor-not-allowed',
          )}
        >
          {saving ? 'Saving…' : 'Save bio'}
        </button>
      </div>
    </div>
  );
}

// ── Change password ───────────────────────────────────────────────────────────

function ChangePasswordSection() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const pwSchema = z
    .object({
      currentPassword: z.string().min(1, 'Enter your current password'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Confirm your new password'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
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
      setServerError(err instanceof ApiError ? err.message : 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-ink-900">Change password</h3>
        <p className="text-[12px] text-ink-500 mt-0.5">
          You&apos;ll remain signed in after changing your password.
        </p>
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
          <PasswordInput
            type="password"
            {...register('currentPassword')}
            className={cn(errors.currentPassword && 'border-danger')}
          />
          {errors.currentPassword && (
            <p className="text-[12px] text-danger">{errors.currentPassword.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">New password</Label>
          <PasswordInput
            placeholder="8+ characters"
            {...register('newPassword')}
            className={cn(errors.newPassword && 'border-danger')}
          />
          {errors.newPassword && (
            <p className="text-[12px] text-danger">{errors.newPassword.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-ink-900">Confirm new password</Label>
          <PasswordInput
            {...register('confirmPassword')}
            className={cn(errors.confirmPassword && 'border-danger')}
          />
          {errors.confirmPassword && (
            <p className="text-[12px] text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium"
        >
          {saving ? 'Saving...' : 'Change password'}
        </Button>
      </form>
    </section>
  );
}
