'use client';

import { useState } from 'react';
import { Globe, Lock } from 'lucide-react';
import { profilesApi, ApiError } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  isPublic: boolean;
  username: string | null | undefined;
}

export function PrivacyToggle({ isPublic: initialPublic, username }: Props) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !isPublic;
    setSaving(true);
    try {
      await profilesApi.update({ profilePublic: next });
      setIsPublic(next);
      toast.success(next ? 'Profile is now public.' : 'Profile is now private.');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to update privacy.');
      } else {
        toast.error('Could not reach the server.');
      }
    } finally {
      setSaving(false);
    }
  }

  const profileUrl = username ? `getmerit.app/u/${username}` : null;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {isPublic ? (
            <Globe size={14} className="text-merit-blue-600 shrink-0" />
          ) : (
            <Lock size={14} className="text-ink-400 shrink-0" />
          )}
          <p className="text-[13px] font-medium text-ink-900">
            {isPublic ? 'Public profile' : 'Private profile'}
          </p>
        </div>
        <p className="text-[12px] text-ink-500 mt-0.5">
          {isPublic
            ? profileUrl
              ? `Anyone can view your profile at ${profileUrl}`
              : 'Anyone can view your profile once you set a username.'
            : 'Only you can see your profile.'}
        </p>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        disabled={saving}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${
          isPublic ? 'bg-merit-blue-600' : 'bg-ink-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            isPublic ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
