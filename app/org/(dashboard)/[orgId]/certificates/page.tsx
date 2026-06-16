'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orgVolunteersApi, orgReportsApi, orgBillingApi } from '@/lib/api';
import { toast } from 'sonner';
import { Download, Loader2, Search, Settings2 } from 'lucide-react';
import { UpgradeGate } from '@/components/org/upgrade-gate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type Volunteer = {
  student: { id: string; name: string; school?: string | null };
  verifiedHours?: number;
  sessions?: any[];
};

export default function CertificatesPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [search, setSearch] = useState('');

  // Certificate customization — coordinator name/title persist across volunteers
  // so the org doesn't retype them every time; title + message reset per cert.
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorTitle, setCoordinatorTitle] = useState('Volunteer Coordinator');
  const [certTitle, setCertTitle] = useState('Certificate of Recognition');
  const [customMessage, setCustomMessage] = useState('');

  const [target, setTarget] = useState<Volunteer | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: billingRes } = useQuery({
    queryKey: ['org-billing-plan', orgId],
    queryFn: () => orgBillingApi.get(orgId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const orgPlan = (billingRes as any)?.data?.plan ?? null;
  const isPro = orgPlan === 'pro' || orgPlan === 'enterprise';

  const { data: res } = useQuery({
    queryKey: ['org-volunteers', orgId],
    queryFn: () => orgVolunteersApi.list(orgId),
    enabled: isPro,
  });
  const rawVols = (res as any)?.data?.volunteers ?? (res as any)?.data;
  const volunteers: Volunteer[] = Array.isArray(rawVols) ? rawVols : [];

  if (orgPlan && !isPro) {
    return (
      <UpgradeGate
        orgId={orgId}
        feature="Volunteer Certificates"
        description="Issue personalized recognition letters for volunteers to use in college applications and scholarship submissions."
      />
    );
  }

  const filtered = volunteers.filter((v) =>
    !search || v.student?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openFor = (v: Volunteer) => {
    setCustomMessage(''); // start each certificate with a fresh note
    setTarget(v);
  };

  const handleGenerate = async () => {
    if (!target) return;
    if (!coordinatorName.trim()) {
      toast.error('Enter the coordinator name first');
      return;
    }
    setGenerating(true);
    try {
      const blob = await orgReportsApi.certificate(orgId, target.student.id, {
        coordinatorName: coordinatorName.trim(),
        coordinatorTitle: coordinatorTitle.trim() || undefined,
        certTitle: certTitle.trim() || undefined,
        customMessage: customMessage.trim() || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${target.student.name.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Certificate generated for ${target.student.name}`);
      setTarget(null);
    } catch {
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate personalized recognition letters for volunteers&apos; college applications
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search volunteers..."
          className="w-full bg-card border border-border text-foreground rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 transition-colors"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <p className="text-muted-foreground text-sm">{search ? 'No matching volunteers.' : 'No volunteers yet.'}</p>
          </div>
        ) : (
          filtered.map((v) => (
            <div
              key={v.student.id}
              className="bg-card border border-border rounded-2xl flex items-center gap-4 p-4"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shrink-0">
                {v.student.name?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{v.student.name}</p>
                <p className="text-muted-foreground text-xs">
                  {v.verifiedHours ?? 0}h verified · {v.sessions?.length ?? 0} sessions
                  {v.student.school ? ` · ${v.student.school}` : ''}
                </p>
              </div>
              <button
                onClick={() => openFor(v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground text-sm font-medium hover:bg-muted hover:text-foreground transition-colors shrink-0"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Create certificate
              </button>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create certificate for {target?.student.name}</DialogTitle>
            <DialogDescription>
              Customize the wording, then download a ready-to-share PDF.
              {' '}
              {target ? `${target.verifiedHours ?? 0} verified hours will be included automatically.` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Field label="Certificate title">
              <input
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                placeholder="Certificate of Recognition"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Issued by (name)">
                <input
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className={inputCls}
                />
              </Field>
              <Field label="Their title">
                <input
                  value={coordinatorTitle}
                  onChange={(e) => setCoordinatorTitle(e.target.value)}
                  placeholder="Volunteer Coordinator"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Additional comments (optional)">
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal note of recognition — this appears on the certificate."
                rows={3}
                maxLength={600}
              />
            </Field>
          </div>

          <DialogFooter>
            <button
              onClick={() => setTarget(null)}
              className="px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Generate PDF
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const inputCls =
  'w-full bg-muted border border-border text-foreground rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}
