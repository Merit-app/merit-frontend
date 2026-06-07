'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useMeritStore } from '@/lib/store';
import { orgInvitesApi, ApiError } from '@/lib/api';

type Status = 'loading' | 'ready' | 'expired' | 'accepted' | 'error';

function JoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const isAuthed = useMeritStore((s) => s.isAuthed);
  const accessToken = useMeritStore((s) => s.accessToken);
  const expiresAt = useMeritStore((s) => s.expiresAt);

  // isAuthed persists to localStorage but the access token does NOT — so a fresh
  // tab (e.g. from an email link) can have isAuthed=true with no usable token.
  // Gate on a live, unexpired token instead, or the accept POST 401s.
  const hasValidToken = isAuthed && accessToken != null && expiresAt != null && expiresAt * 1000 > Date.now();

  const [invite, setInvite] = useState<any>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    orgInvitesApi
      .getByToken(token)
      .then((res) => {
        const data = res.data;
        if (data.expired) setStatus('expired');
        else if (data.alreadyAccepted) setStatus('accepted');
        else { setInvite(data); setStatus('ready'); }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    if (!hasValidToken) {
      router.push(`/login?redirect=${encodeURIComponent(`/org/join?token=${token}`)}`);
      return;
    }
    setIsAccepting(true);
    try {
      await orgInvitesApi.accept(token);
      setStatus('accepted');
      toast.success(`You now have access to ${invite?.organizations?.name}! Sign in to your org dashboard.`);
      // The org dashboard uses a separate org session — send them to org login to
      // establish it (their student login here doesn't populate the org store).
      router.push('/org/login');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to accept invite';
      toast.error(msg);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <a href="/org" className="text-2xl font-bold text-white mb-8">merit.</a>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-400">Loading invitation...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="font-semibold text-white">Invalid invitation</p>
            <p className="text-gray-400 text-sm">This link is invalid or has already been used.</p>
            <Link href="/org/login" className="text-sm text-gray-400 hover:text-white">
              Go to org login →
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-400" />
            </div>
            <p className="font-semibold text-white">Invitation expired</p>
            <p className="text-gray-400 text-sm">Ask your coordinator to send a new one.</p>
          </div>
        )}

        {status === 'accepted' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <p className="font-semibold text-white">Already accepted</p>
            <Link
              href="/org/login"
              className="bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Sign in →
            </Link>
          </div>
        )}

        {status === 'ready' && invite && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
              {invite.organizations?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={invite.organizations.logo_url}
                  alt={invite.organizations.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <p className="text-gray-400 text-sm">You&apos;ve been invited to join</p>
              <p className="text-xl font-bold text-white mt-1">{invite.organizations?.name}</p>
              <p className="text-gray-400 text-sm mt-1 capitalize">
                Role: <span className="text-white">{invite.role}</span>
              </p>
            </div>

            {hasValidToken ? (
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isAccepting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAccepting ? 'Accepting...' : 'Accept invitation →'}
              </button>
            ) : (
              <div className="w-full space-y-3">
                <p className="text-gray-500 text-sm">Sign in or create an account to accept</p>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/org/join?token=${token}`)}`}
                  className="block w-full bg-white text-gray-900 font-semibold py-3 rounded-xl text-sm text-center hover:bg-gray-100 transition-colors"
                >
                  Sign in to Merit
                </Link>
                <Link
                  href={`/signup?redirect=${encodeURIComponent(`/org/join?token=${token}`)}`}
                  className="block w-full bg-gray-800 text-white font-medium py-3 rounded-xl text-sm text-center hover:bg-gray-700 transition-colors"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrgJoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinForm />
    </Suspense>
  );
}
