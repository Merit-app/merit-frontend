'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Lock, Download, FileText, Zap, Building2, Layers } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MeritPdfDocument, ModernPdfDocument, AdvancedPdfDocument } from '@/lib/pdf-template';
import { useMeritStore } from '@/lib/store';
import { usePlan } from '@/lib/hooks/use-plan';
import { cn } from '@/lib/utils';

const VERIFY_BASE_URL = 'https://meritco.app/verify';
const VERIFY_ORG_BASE = 'https://meritco.app/verify/org';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Template = 'classic' | 'modern' | 'nhs-formal';
type DateRange = 'all' | 'school-year' | 'custom';

const FREE_LOOKBACK_DAYS = 30;

const TEMPLATES: { key: Template; label: string; premium: boolean }[] = [
  { key: 'classic',    label: 'Classic',    premium: false },
  { key: 'modern',     label: 'Modern',     premium: true },
  { key: 'nhs-formal', label: 'Advanced', premium: true },
];

export default function PdfExportInner() {
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);
  const { isFree, isPremium } = usePlan();

  const [includeStats,  setIncludeStats]  = useState(true);
  const [includeLog,    setIncludeLog]    = useState(true);
  const [includeVerify, setIncludeVerify] = useState(true);
  const [template,      setTemplate]      = useState<Template>('classic');
  const [dateRange,     setDateRange]     = useState<DateRange>('all');
  const [format,        setFormat]        = useState<'pdf' | 'csv'>('pdf');
  const [qrCodes,       setQrCodes]       = useState<Record<string, string>>({});
  // 'all' = every org combined; otherwise an org slug/id to export on its own.
  const [selectedOrg,   setSelectedOrg]   = useState<string>('all');

  // Free plan: enforce 30-day lookback on "All time" selection
  const freeCutoff = useMemo(() => {
    if (!isFree) return null;
    const d = new Date();
    d.setDate(d.getDate() - FREE_LOOKBACK_DAYS);
    return d;
  }, [isFree]);

  const filteredSessions = useMemo(() => {
    let base = sessions;

    // Free tier: restrict to last 30 days regardless of user selection
    if (isFree && freeCutoff) {
      base = base.filter((s) => new Date(s.date) >= freeCutoff);
    } else if (dateRange === 'school-year') {
      const now = new Date();
      const cutoff = now.getMonth() >= 8
        ? new Date(now.getFullYear(), 8, 1)
        : new Date(now.getFullYear() - 1, 8, 1);
      base = base.filter((s) => new Date(s.date) >= cutoff);
    }

    return base;
  }, [sessions, dateRange, isFree, freeCutoff]);

  // Organizations the student has logged hours with (within the active date range).
  const orgOptions = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    for (const sess of filteredSessions) {
      const slug = sess.orgSlug || sess.org || 'unknown';
      const entry = map.get(slug) ?? { slug, name: sess.org || 'Unknown organization', count: 0 };
      entry.count += 1;
      map.set(slug, entry);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredSessions]);

  // If the selected org disappears (e.g. date range changed), fall back to "All".
  useEffect(() => {
    if (selectedOrg !== 'all' && !orgOptions.some((o) => o.slug === selectedOrg)) {
      setSelectedOrg('all');
    }
  }, [orgOptions, selectedOrg]);

  // Sessions that actually go into the PDF — filtered to the selected org.
  const pdfSessions = useMemo(() => {
    if (selectedOrg === 'all') return filteredSessions;
    return filteredSessions.filter((sess) => (sess.orgSlug || sess.org || 'unknown') === selectedOrg);
  }, [filteredSessions, selectedOrg]);

  const selectedOrgName = selectedOrg === 'all'
    ? null
    : orgOptions.find((o) => o.slug === selectedOrg)?.name ?? null;

  const hasVerified = pdfSessions.some((s) => s.status === 'verified');

  // One QR code per organization, keyed by org slug. For real orgs (UUID slug)
  // the QR resolves to an org-level verification page showing ALL the student's
  // hours there; self-reported custom orgs fall back to a representative session.
  useEffect(() => {
    if (!includeVerify) { setQrCodes({}); return; }
    let cancelled = false;
    const map: Record<string, string> = {};

    const targets = orgOptions.map((org) => {
      const isRealOrg = UUID_RE.test(org.slug) && !!user.id;
      if (isRealOrg) return { key: org.slug, url: `${VERIFY_ORG_BASE}/${user.id}/${org.slug}` };
      // Fallback for custom/self-reported orgs without a backing org record.
      const rep =
        filteredSessions.find((s) => (s.orgSlug || s.org || 'unknown') === org.slug && s.status === 'verified') ??
        filteredSessions.find((s) => (s.orgSlug || s.org || 'unknown') === org.slug);
      return rep ? { key: org.slug, url: `${VERIFY_BASE_URL}/${rep.id}` } : null;
    }).filter((t): t is { key: string; url: string } => t !== null);

    Promise.all(
      targets.map(({ key, url }) =>
        QRCode.toDataURL(url, {
          width: 160,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
          type: 'image/png',
        }).then((dataUrl) => { map[key] = dataUrl; })
          .catch(() => { /* skip if generation fails */ })
      )
    ).then(() => { if (!cancelled) setQrCodes({ ...map }); });
    return () => { cancelled = true; };
  }, [orgOptions, filteredSessions, includeVerify, user.id]);

  const dateRangeLabel =
    dateRange === 'all' ? 'All time' :
    dateRange === 'school-year' ? 'This school year' : 'Custom range';

  const docProps = {
    user,
    sessions: pdfSessions,
    includeStats,
    includeSupervisor: includeVerify,
    dateRange: selectedOrgName ? `${selectedOrgName} · ${dateRangeLabel}` : dateRangeLabel,
    qrCodes,
  };

  const pdfDoc =
    template === 'modern'     ? <ModernPdfDocument   {...docProps} /> :
    template === 'nhs-formal' ? <AdvancedPdfDocument {...docProps} /> :
                                <MeritPdfDocument    {...docProps} />;

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const orgFilePart = selectedOrgName ? `-${slugify(selectedOrgName)}` : '';
  const fileName = `merit-${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}${orgFilePart}-${new Date().getFullYear()}.pdf`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── LEFT: Options panel ───────────────────────────────────────────── */}
      <div className="w-full lg:w-72 lg:shrink-0 space-y-5">

        {/* Organization selector — one PDF per org, or all combined */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-2.5">
          <p className="text-h3 text-foreground">Organization</p>
          <p className="text-[11px] text-muted-foreground -mt-1.5">
            Export one organization at a time, or all of them in a single document.
          </p>

          {/* All organizations */}
          <button
            type="button"
            onClick={() => setSelectedOrg('all')}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors',
              selectedOrg === 'all'
                ? 'border-merit-blue-600 bg-merit-blue-50'
                : 'border-border hover:bg-background',
            )}
          >
            <Layers size={14} className={selectedOrg === 'all' ? 'text-merit-blue-600' : 'text-muted-foreground'} />
            <span className="flex-1 text-[13px] text-foreground">All organizations</span>
            <span className="text-[11px] text-muted-foreground">{filteredSessions.length}</span>
          </button>

          {/* Per-org */}
          {orgOptions.map((org) => (
            <button
              key={org.slug}
              type="button"
              onClick={() => setSelectedOrg(org.slug)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors',
                selectedOrg === org.slug
                  ? 'border-merit-blue-600 bg-merit-blue-50'
                  : 'border-border hover:bg-background',
              )}
            >
              <Building2 size={14} className={selectedOrg === org.slug ? 'text-merit-blue-600' : 'text-muted-foreground'} />
              <span className="flex-1 text-[13px] text-foreground truncate">{org.name}</span>
              <span className="text-[11px] text-muted-foreground shrink-0">{org.count}</span>
            </button>
          ))}

          {orgOptions.length === 0 && (
            <p className="text-[12px] text-muted-foreground">No logged organizations in this range.</p>
          )}
        </div>

        {/* What to include */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <p className="text-h3 text-foreground">What to include</p>
          {([
            { label: 'Summary stats',       value: includeStats,  set: setIncludeStats },
            { label: 'Full session log',    value: includeLog,    set: setIncludeLog },
            { label: 'Verification details',value: includeVerify, set: setIncludeVerify },
          ] as const).map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => set(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-merit-blue-600"
              />
              <span className="text-[13px] text-foreground">{label}</span>
            </label>
          ))}
        </div>

        {/* Date range */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-2.5">
          <p className="text-h3 text-foreground">Time range</p>
          {([
            { key: 'all',         label: 'All time' },
            { key: 'school-year', label: 'This school year' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="dateRange"
                value={key}
                checked={dateRange === key}
                onChange={() => setDateRange(key)}
                className="accent-merit-blue-600"
              />
              <span className="text-[13px] text-foreground">{label}</span>
            </label>
          ))}
          {/* Free-tier notice */}
          {isFree && (
            <div className="mt-2 rounded-lg border border-merit-blue-200 bg-merit-blue-50 px-3 py-2.5 flex items-start gap-2">
              <Zap size={13} className="text-merit-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-medium text-merit-blue-700">Last 30 days only</p>
                <p className="text-[11px] text-merit-blue-600 mt-0.5">
                  <Link href="/settings/billing" className="underline underline-offset-2 hover:text-merit-blue-800">
                    Upgrade to Pro
                  </Link>{' '}
                  for full history exports.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Template picker */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-2.5">
          <p className="text-h3 text-foreground">Template</p>
          <div className="space-y-2">
            {TEMPLATES.map(({ key, label, premium }) => {
              const locked = premium && !isPremium;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => !locked && setTemplate(key)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors',
                    template === key && !locked
                      ? 'border-merit-blue-600 bg-merit-blue-50'
                      : 'border-border hover:bg-background',
                    locked && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <span className="text-[13px] text-foreground">{label}</span>
                  {locked && <Lock size={12} className="text-muted-foreground" />}
                  {!locked && template === key && (
                    <span className="h-2 w-2 rounded-full bg-merit-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
          {!isPremium && (
            <p className="text-[11px] text-muted-foreground mt-1">Modern & Advanced templates require Premium.</p>
          )}
        </div>

        {/* Format */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-2.5">
          <p className="text-h3 text-foreground">Format</p>
          {(['pdf', 'csv'] as const).map((f) => (
            <label key={f} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
                className="accent-merit-blue-600"
              />
              <span className="text-[13px] text-foreground uppercase">{f}</span>
            </label>
          ))}
        </div>

        {/* Download button */}
        {hasVerified ? (
          <PDFDownloadLink document={pdfDoc} fileName={fileName}>
            {({ loading }) => (
              <button
                className="w-full flex items-center justify-center gap-2 bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-all"
              >
                <Download size={14} />
                {loading ? 'Preparing...' : 'Download'}
              </button>
            )}
          </PDFDownloadLink>
        ) : (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-not-allowed"
          >
            <Download size={14} />
            Download
          </button>
        )}
        {!hasVerified && (
          <p className="text-[11px] text-muted-foreground text-center -mt-3">
            You need at least one verified session to export.
          </p>
        )}
      </div>

      {/* ── RIGHT: Live PDF preview ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-h3 text-foreground mb-3">Preview</p>
        {pdfSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] bg-card rounded-xl border border-border">
            <FileText size={32} className="text-muted-foreground mb-3" />
            <p className="text-[14px] font-medium text-foreground mb-1">Nothing to preview.</p>
            <p className="text-small text-muted-foreground">Adjust your date range or log some sessions.</p>
          </div>
        ) : (
          <PDFViewer
            width="100%"
            height={700}
            style={{ border: 'none', borderRadius: '12px' }}
          >
            {pdfDoc}
          </PDFViewer>
        )}
      </div>
    </div>
  );
}
