'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminApi, ApiError } from '@/lib/api';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Lead {
  id: string;
  school_name: string;
  coordinator_name: string;
  email: string;
  role: string | null;
  student_count: number | null;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminSchoolsPage() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listSchoolLeads();
      setLeads(res.data as Lead[]);
      setForbidden(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  if (forbidden) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is restricted to the Merit platform admin.</p>
      </div>
    );
  }

  const pending = leads.filter((l) => l.status === 'pending');
  const others = leads.filter((l) => l.status !== 'pending');

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-8">
      <h1 className="text-2xl font-semibold text-foreground">School leads</h1>
      <p className="text-sm text-muted-foreground">Review early-access requests and provision chapters.</p>

      <h2 className="mt-6 mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Pending ({pending.length})
      </h2>
      <div className="space-y-3">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
        {pending.map((lead) => <LeadCard key={lead.id} lead={lead} onChange={load} />)}
      </div>

      {others.length > 0 && (
        <>
          <h2 className="mt-8 mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Reviewed</h2>
          <div className="space-y-2">
            {others.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm">
                <span className="text-foreground">{lead.school_name} · {lead.email}</span>
                <Badge variant={lead.status === 'approved' ? 'default' : 'secondary'}>{lead.status}</Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LeadCard({ lead, onChange }: { lead: Lead; onChange: () => void }) {
  const [maxMembers, setMaxMembers] = useState(String(lead.student_count ?? 500));
  const [requiredHours, setRequiredHours] = useState('30');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setBusy(true); setError(null);
    try {
      await adminApi.provisionChapter({
        leadId: lead.id,
        schoolName: lead.school_name,
        coordinatorEmail: lead.email,
        coordinatorName: lead.coordinator_name,
        maxMembers: Math.max(1, parseInt(maxMembers || '500', 10) || 500),
        requiredHours: Math.max(0, parseInt(requiredHours || '0', 10) || 0),
      });
      setDone('Chapter provisioned — claim email sent to coordinator.');
      setTimeout(onChange, 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to provision.');
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true); setError(null);
    try {
      await adminApi.rejectSchoolLead(lead.id);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reject.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{lead.school_name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {lead.coordinator_name}{lead.role ? ` · ${lead.role}` : ''} · {lead.email}
          {lead.student_count != null && ` · ~${lead.student_count} students`}
        </p>
        {lead.note && <p className="mt-1 text-sm text-muted-foreground italic">“{lead.note}”</p>}
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> {done}
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <Label className="text-xs">Member cap</Label>
              <Input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} />
            </div>
            <div className="w-28">
              <Label className="text-xs">Required hrs</Label>
              <Input type="number" value={requiredHours} onChange={(e) => setRequiredHours(e.target.value)} />
            </div>
            <Button onClick={approve} disabled={busy}>{busy ? 'Working…' : 'Approve & provision'}</Button>
            <Button variant="ghost" onClick={reject} disabled={busy}>Reject</Button>
            {error && <span className="w-full text-sm text-red-600">{error}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
