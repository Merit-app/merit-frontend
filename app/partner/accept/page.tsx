'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { partnerApi, orgsApi, ApiError } from '@/lib/api';
import { useMeritStore } from '@/lib/store';
import { CheckCircle2, AlertCircle, Gift } from 'lucide-react';

function AcceptInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const accessToken = useMeritStore((s) => s.accessToken);

  const [state, setState] = useState<'loading' | 'choose' | 'done' | 'error' | 'no-org'>('loading');
  const [invite, setInvite] = useState<{ orgName: string; chapterName: string; status: string } | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [orgId, setOrgId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setState('error'); setMessage('This partner link is missing its token.'); return; }
    if (!accessToken) { router.replace(`/login?redirect=${encodeURIComponent(`/partner/accept?token=${token}`)}`); return; }
    (async () => {
      try {
        const inv = await partnerApi.getInvite(token);
        setInvite(inv.data);
        if (inv.data.status === 'active') { setState('done'); setMessage('This partnership is already active.'); return; }
        const mine = await orgsApi.adminMine();
        const list = (mine.data ?? []) as any[];
        setOrgs(list);
        if (list.length === 0) { setState('no-org'); return; }
        setOrgId(list[0].id);
        setState('choose');
      } catch (err) {
        setState('error');
        setMessage(err instanceof ApiError ? err.message : 'This partner link is invalid.');
      }
    })();
  }, [token, accessToken, router]);

  async function accept() {
    if (!token || !orgId) return;
    setBusy(true);
    try {
      await partnerApi.accept(token, orgId);
      setState('done'); setMessage('');
    } catch (err) {
      setState('error');
      setMessage(err instanceof ApiError ? err.message : 'Failed to accept.');
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        {state === 'loading' && <p className="text-muted-foreground">Loading…</p>}

        {state === 'choose' && invite && (
          <>
            <Gift className="mx-auto h-12 w-12 text-merit-blue-600" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Partner with {invite.chapterName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Link your organization to claim a free <strong>Pro</strong> plan and post opportunities to their students.
            </p>
            <label className="mt-5 block text-left text-xs font-medium text-muted-foreground">Organization to link</label>
            <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <button onClick={accept} disabled={busy} className="mt-5 w-full rounded-lg bg-merit-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60">
              {busy ? 'Linking…' : 'Accept & claim free Pro'}
            </button>
          </>
        )}

        {state === 'no-org' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Create your organization first</h1>
            <p className="mt-2 text-sm text-muted-foreground">You need an organization on Merit before you can accept this partnership.</p>
            <Link href="/org/create" className="mt-5 inline-block rounded-lg bg-merit-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700">Create organization</Link>
          </>
        )}

        {state === 'done' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">You&apos;re partnered! 🎉</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message || 'Your organization now has free Pro and is linked to the chapter.'}</p>
            <Link href="/org" className="mt-5 inline-block rounded-lg bg-merit-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700">Go to your org dashboard</Link>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Couldn&apos;t accept</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link href="/dashboard" className="mt-5 inline-block text-sm text-merit-blue-600 hover:underline">Back to dashboard</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PartnerAcceptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading…</div>}>
      <AcceptInner />
    </Suspense>
  );
}
