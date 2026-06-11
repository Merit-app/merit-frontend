'use client';

import { useCallback, useEffect, useState } from 'react';
import { chapterApi, ApiError } from '@/lib/api';
import { Megaphone, Plus, Users, MapPin, Calendar, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setOpps((await chapterApi.getOpportunities()).data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">Post volunteering opportunities — students get notified instantly.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-merit-blue-700">
          <Plus className="h-4 w-4" /> Post opportunity
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full max-w-md" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      ) : opps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border">
          <EmptyState
            icon={Megaphone}
            title="No opportunities yet"
            description="Post one and every student in your chapter gets notified instantly."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {opps.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{o.title}</h3>
                  {o.orgName && <p className="text-sm text-muted-foreground">{o.orgName}</p>}
                </div>
                <button onClick={() => { chapterApi.getOpportunitySignups(o.id).then((r) => setViewing(r.data)); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                  <Users className="h-4 w-4" /> {o.signupCount}{o.slots ? `/${o.slots}` : ''}
                </button>
              </div>
              {o.description && <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>}
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {o.startsAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(o.startsAt).toLocaleString()}</span>}
                {o.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {o.location}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <PostForm onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); load(); }} />}
      {viewing && <SignupsModal data={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function PostForm({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ title: '', orgName: '', description: '', slots: '', location: '', startsAt: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const up = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    if (!f.title.trim()) { setError('Title is required.'); return; }
    setBusy(true); setError(null);
    try {
      await chapterApi.createOpportunity({
        title: f.title.trim(),
        orgName: f.orgName.trim() || undefined,
        description: f.description.trim() || undefined,
        slots: f.slots ? Number(f.slots) : null,
        location: f.location.trim() || undefined,
        startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to post.');
    } finally { setBusy(false); }
  }

  const inp = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground"><Megaphone className="h-5 w-5 text-merit-blue-600" /> Post opportunity</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <input className={inp} placeholder="Title (e.g. Beach cleanup)" value={f.title} onChange={(e) => up('title', e.target.value)} />
          <input className={inp} placeholder="Partner org (optional)" value={f.orgName} onChange={(e) => up('orgName', e.target.value)} />
          <textarea className={`${inp} h-24`} placeholder="Details" value={f.description} onChange={(e) => up('description', e.target.value)} />
          <div className="flex gap-2">
            <input className={inp} type="number" min={0} placeholder="Spaces (optional)" value={f.slots} onChange={(e) => up('slots', e.target.value)} />
            <input className={inp} placeholder="Location" value={f.location} onChange={(e) => up('location', e.target.value)} />
          </div>
          <label className="block text-xs text-muted-foreground">Date & time (optional)
            <input className={inp} type="datetime-local" value={f.startsAt} onChange={(e) => up('startsAt', e.target.value)} />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={busy} className="w-full rounded-lg bg-merit-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60">
            {busy ? 'Posting…' : 'Post & notify students'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SignupsModal({ data, onClose }: { data: { title: string; signups: any[] }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{data.title}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        {data.signups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No signups yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {data.signups.map((s) => (
              <li key={s.userId} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span><span className="text-foreground">{s.name}</span> <span className="text-muted-foreground">· {s.email}</span></span>
                {s.status === 'waitlisted' && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">waitlist</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
