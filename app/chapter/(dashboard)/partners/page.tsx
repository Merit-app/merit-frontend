'use client';

import { useCallback, useEffect, useState } from 'react';
import { chapterApi, ApiError } from '@/lib/api';
import { Building2, Plus, Trash2, CheckCircle2, Clock, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPartners((await chapterApi.getPartners()).data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function invite() {
    if (!orgName.trim() || !email.trim()) { setError('Add an org name and contact email.'); return; }
    setBusy(true); setError(null); setSent(false);
    try {
      await chapterApi.createPartner(orgName.trim(), email.trim());
      setSent(true); setOrgName(''); setEmail('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send invite.');
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Partner organizations</h1>
        <p className="text-sm text-muted-foreground">Invite orgs to partner — they get free Pro and can post opportunities to your students.</p>
      </div>

      {/* Invite */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Gift className="h-4 w-4 text-merit-blue-600" />
          <h2 className="font-medium text-foreground">Invite a partner</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization name"
            className="flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@org.com"
            className="flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <button onClick={invite} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-merit-blue-700 disabled:opacity-60">
            <Plus className="h-4 w-4" /> {busy ? 'Sending…' : 'Send invite'}
          </button>
        </div>
        {sent && <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400"><CheckCircle2 className="h-4 w-4" /> Invite sent — they&apos;ll get a link to claim free Pro.</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      {/* List */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-medium text-foreground">Your partners</h2>
        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No partners yet"
            description="Invite a local organization — they get free Merit Pro and your students get verified faster."
            className="py-8"
          />
        ) : (
          <div className="space-y-2">
            {partners.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{p.org?.name ?? p.org_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.contact_email}</p>
                </div>
                {p.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3" /> Active · {p.comp_plan}
                  </span>
                ) : p.status === 'pending' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Revoked</span>
                )}
                {p.status !== 'revoked' && (
                  <button onClick={async () => { await chapterApi.revokePartner(p.id).catch(() => {}); load(); }} className="text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
