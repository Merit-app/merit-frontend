'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { orgReportsApi, orgBillingApi } from '@/lib/api';
import { toast } from 'sonner';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UpgradeGate } from '@/components/org/upgrade-gate';

const PRESETS = [
  {
    label: 'This year',
    from: `${new Date().getFullYear()}-01-01`,
    to: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last year',
    from: `${new Date().getFullYear() - 1}-01-01`,
    to: `${new Date().getFullYear() - 1}-12-31`,
  },
  {
    label: 'Last 6 months',
    from: new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last 30 days',
    from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  },
];

export default function ReportsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [from, setFrom] = useState(`${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: billingRes } = useQuery({
    queryKey: ['org-billing-plan', orgId],
    queryFn: () => orgBillingApi.get(orgId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const orgPlan = (billingRes as any)?.data?.plan ?? null;
  const isPro = orgPlan === 'pro' || orgPlan === 'enterprise';

  if (orgPlan && !isPro) {
    return (
      <UpgradeGate
        orgId={orgId}
        feature="Grant Reports"
        description="Generate professional impact PDFs for any date range. Formatted for grant committee submissions."
      />
    );
  }

  const handleGrantReport = async () => {
    setIsGenerating(true);
    try {
      const blob = await orgReportsApi.grantReport(orgId, from, to);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grant-report-${from}-to-${to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Grant report downloaded');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate impact reports for grant applications and board meetings
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-card/5 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Grant Impact Report</p>
            <p className="text-muted-foreground text-sm mt-1">
              Professional PDF showing total volunteers, hours, program breakdown, and top volunteers —
              formatted for grant submissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-border"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setFrom(p.from); setTo(p.to); }}
              className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGrantReport}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
          ) : (
            <><Download className="w-4 h-4" />Generate grant report</>
          )}
        </button>
      </div>
    </div>
  );
}
