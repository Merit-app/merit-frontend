'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { adminApi, ApiError } from '@/lib/api';
import { useMeritStore } from '@/lib/store';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function InviteInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const accessToken = useMeritStore((s) => s.accessToken);
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('This invite link is missing its token.');
      return;
    }
    // Must be signed in to join — bounce through login and come back here.
    if (!accessToken) {
      router.replace(`/login?redirect=${encodeURIComponent(`/invite?token=${token}`)}`);
      return;
    }
    adminApi
      .acceptInvite(token)
      .then(() => setState('done'))
      .catch((err) => {
        setState('error');
        setMessage(err instanceof ApiError ? err.message : 'This invite is invalid or has expired.');
      });
  }, [token, accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        {state === 'working' && <p className="text-muted-foreground">Joining your chapter…</p>}

        {state === 'done' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">You’re in!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You’ve joined your chapter. Your verified hours will now count toward your requirement.
            </p>
            <Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-merit-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700">
              Go to dashboard
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Couldn’t join</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link href="/dashboard" className="mt-6 inline-block text-sm text-merit-blue-600 hover:underline">
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading…</div>}>
      <InviteInner />
    </Suspense>
  );
}
