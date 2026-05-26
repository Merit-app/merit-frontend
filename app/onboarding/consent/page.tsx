'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMeritStore, useHydrationStore } from '@/lib/store';
import { authApi, mapUser } from '@/lib/api';

export default function ConsentPage() {
  const router = useRouter();
  const hydrated = useHydrationStore((s) => s.hydrated);
  const isAuthed = useMeritStore((s) => s.isAuthed);
  const user = useMeritStore((s) => s.user);
  const updateUser = useMeritStore((s) => s.updateUser);

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth guard — wait for hydration, then redirect if not logged in
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) {
      router.replace('/login');
      return;
    }
    // Already accepted — skip straight to dashboard
    if (user?.consentAccepted) {
      router.replace('/dashboard');
    }
  }, [hydrated, isAuthed, user?.consentAccepted]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGetStarted() {
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.acceptConsent();
      updateUser(mapUser(res.data.user));
      router.replace('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  // Show nothing until hydrated
  if (!hydrated || !isAuthed) return null;

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-[22px] font-semibold tracking-tight text-ink-900">
            merit<span className="text-merit-blue-600">.</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <h1 className="text-[17px] font-semibold text-ink-900 mb-1">
            Before you start
          </h1>
          <p className="text-[13px] text-ink-500 mb-5">
            Please read and agree to the following:
          </p>

          <ul className="space-y-3 mb-6">
            {[
              'You are 13 years of age or older.',
              'The volunteer hours you log will be real and accurate.',
              'A parent or guardian is aware that you are using this service.',
              'You agree to our Terms of Service and Privacy Policy.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={15}
                  className="text-merit-blue-600 mt-0.5 shrink-0"
                />
                <span className="text-[13px] text-ink-700 leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          {/* Confirm checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-merit-blue-600 focus:ring-merit-blue-500 accent-merit-blue-600 cursor-pointer shrink-0"
            />
            <span className="text-[13px] text-ink-700 leading-snug font-medium">
              I confirm all of the above
            </span>
          </label>

          {error && (
            <div className="mb-4 rounded-lg bg-danger/8 border border-danger/20 px-3 py-2.5">
              <p className="text-[13px] text-danger">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGetStarted}
            disabled={!confirmed || loading}
            className="w-full bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Get started'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
