'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { adminApi, ApiError } from '@/lib/api';
import { useMeritStore } from '@/lib/store';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function ClaimInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const accessToken = useMeritStore((s) => s.accessToken);
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('');
  const [chapterName, setChapterName] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('This claim link is missing its token.');
      return;
    }
    // Coordinator must sign in (with the approved email) before claiming.
    if (!accessToken) {
      router.replace(`/login?redirect=${encodeURIComponent(`/claim?token=${token}`)}`);
      return;
    }
    adminApi
      .claimChapter(token)
      .then((res) => {
        setChapterName(res.data.name);
        setState('done');
      })
      .catch((err) => {
        setState('error');
        setMessage(err instanceof ApiError ? err.message : 'This claim link is invalid or has expired.');
      });
  }, [token, accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        {state === 'working' && <p className="text-muted-foreground">Setting up your chapter…</p>}

        {state === 'done' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">{chapterName} is yours</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You’re now the coordinator. Head to the Chapter area to set your hour requirement and
              import your roster.
            </p>
            <Link href="/chapter" className="mt-6 inline-block rounded-lg bg-merit-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700">
              Open your chapter
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Couldn’t claim chapter</h1>
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

export default function ChapterClaimPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading…</div>}>
      <ClaimInner />
    </Suspense>
  );
}
