'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMeritStore } from '@/lib/store';
import { volunteerInterestApi } from '@/lib/api';

interface Props {
  orgId: string;
  orgName: string;
  orgSlug: string;
}

export function VolunteerInterestButton({ orgId, orgName, orgSlug }: Props) {
  const router = useRouter();
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check current status once authed + mounted
  useEffect(() => {
    if (!isAuthed || checked) return;
    volunteerInterestApi
      .status(orgId)
      .then((res) => {
        setRegistered((res as any).data?.registered ?? false);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [isAuthed, orgId, checked]);

  const handleClick = async () => {
    if (!isAuthed) {
      router.push(`/signup?ref=volunteer&org=${orgId}`);
      return;
    }

    setLoading(true);
    try {
      if (registered) {
        await volunteerInterestApi.unregister(orgId);
        setRegistered(false);
        toast.success('Removed from volunteer list');
      } else {
        await volunteerInterestApi.register(orgId);
        setRegistered(true);
        toast.success(`You're on ${orgName}'s volunteer list!`, {
          description: 'They can now send you announcements and event invites.',
        });
      }
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 h-8 px-3 rounded-lg text-[12px] font-medium transition-all disabled:opacity-50 shadow-sm ${
        registered
          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          : 'bg-gray-900 text-white hover:bg-gray-700 border border-gray-700'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : registered ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Heart className="w-3.5 h-3.5" />
      )}
      {registered ? 'Volunteering here' : 'I volunteer here'}
    </button>
  );
}
