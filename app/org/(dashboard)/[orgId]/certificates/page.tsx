'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orgVolunteersApi, orgReportsApi, orgBillingApi } from '@/lib/api';
import { toast } from 'sonner';
import { Download, Loader2, Search } from 'lucide-react';
import { UpgradeGate } from '@/components/org/upgrade-gate';

export default function CertificatesPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [search, setSearch] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);

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
  const volunteers: any[] = Array.isArray(rawVols) ? rawVols : [];

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

  const handleCertificate = async (userId: string, name: string) => {
    if (!coordinatorName.trim()) {
      toast.error('Enter your name as coordinator first');
      return;
    }
    setGenerating(userId);
    try {
      const blob = await orgReportsApi.certificate(orgId, userId, coordinatorName.trim());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${name.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Certificate generated for ${name}`);
    } catch {
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(null);
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

      <div className="bg-card border border-border rounded-2xl p-5">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Your name (appears as coordinator on certificates)
        </label>
        <input
          value={coordinatorName}
          onChange={(e) => setCoordinatorName(e.target.value)}
          placeholder="e.g. Jane Smith"
          className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-border transition-colors"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search volunteers..."
          className="w-full bg-card border border-border text-foreground rounded-xl pl-10 pr-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <p className="text-muted-foreground text-sm">{search ? 'No matching volunteers.' : 'No volunteers yet.'}</p>
          </div>
        ) : (
          filtered.map((v: any) => (
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
                  {v.verifiedHours}h verified · {v.sessions?.length ?? 0} sessions
                  {v.student.school ? ` · ${v.student.school}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleCertificate(v.student.id, v.student.name)}
                disabled={generating === v.student.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors shrink-0"
              >
                {generating === v.student.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Certificate
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
