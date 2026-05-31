'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Lock, Download, FileText, Zap } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MeritPdfDocument } from '@/lib/pdf-template';
import { useMeritStore } from '@/lib/store';
import { usePlan } from '@/lib/hooks/use-plan';
import { cn } from '@/lib/utils';

const VERIFY_BASE_URL = 'https://meritco.app/verify';

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

  const hasVerified = filteredSessions.some((s) => s.status === 'verified');

  // Generate QR codes for all filtered sessions
  useEffect(() => {
    if (!includeVerify) { setQrCodes({}); return; }
    let cancelled = false;
    const map: Record<string, string> = {};
    Promise.all(
      filteredSessions.map((session) =>
        QRCode.toDataURL(`${VERIFY_BASE_URL}/${session.id}`, {
          width: 120,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
          type: 'image/png',
        }).then((url) => { map[session.id] = url; })
          .catch(() => { /* skip if generation fails */ })
      )
    ).then(() => { if (!cancelled) setQrCodes({ ...map }); });
    return () => { cancelled = true; };
  }, [filteredSessions, includeVerify]);

  const dateRangeLabel =
    dateRange === 'all' ? 'All time' :
    dateRange === 'school-year' ? 'This school year' : 'Custom range';

  const pdfDoc = (
    <MeritPdfDocument
      user={user}
      sessions={filteredSessions}
      includeStats={includeStats}
      includeSupervisor={includeVerify}
      dateRange={dateRangeLabel}
      qrCodes={qrCodes}
    />
  );

  const fileName = `merit-${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}-${new Date().getFullYear()}.pdf`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── LEFT: Options panel ───────────────────────────────────────────── */}
      <div className="w-full lg:w-72 lg:shrink-0 space-y-5">

        {/* What to include */}
        <div className="bg-white rounded-xl border border-ink-200 p-5 space-y-3">
          <p className="text-h3 text-ink-900">What to include</p>
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
                className="h-4 w-4 rounded border-ink-200 accent-merit-blue-600"
              />
              <span className="text-[13px] text-ink-700">{label}</span>
            </label>
          ))}
        </div>

        {/* Date range */}
        <div className="bg-white rounded-xl border border-ink-200 p-5 space-y-2.5">
          <p className="text-h3 text-ink-900">Time range</p>
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
              <span className="text-[13px] text-ink-700">{label}</span>
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
        <div className="bg-white rounded-xl border border-ink-200 p-5 space-y-2.5">
          <p className="text-h3 text-ink-900">Template</p>
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
                      : 'border-ink-200 hover:bg-ink-50',
                    locked && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <span className="text-[13px] text-ink-900">{label}</span>
                  {locked && <Lock size={12} className="text-ink-400" />}
                  {!locked && template === key && (
                    <span className="h-2 w-2 rounded-full bg-merit-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
          {!isPremium && (
            <p className="text-[11px] text-ink-500 mt-1">Modern & Advanced templates require Premium.</p>
          )}
        </div>

        {/* Format */}
        <div className="bg-white rounded-xl border border-ink-200 p-5 space-y-2.5">
          <p className="text-h3 text-ink-900">Format</p>
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
              <span className="text-[13px] text-ink-700 uppercase">{f}</span>
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
            className="w-full flex items-center justify-center gap-2 bg-ink-200 text-ink-500 text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-not-allowed"
          >
            <Download size={14} />
            Download
          </button>
        )}
        {!hasVerified && (
          <p className="text-[11px] text-ink-500 text-center -mt-3">
            You need at least one verified session to export.
          </p>
        )}
      </div>

      {/* ── RIGHT: Live PDF preview ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-h3 text-ink-900 mb-3">Preview</p>
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-xl border border-ink-200">
            <FileText size={32} className="text-ink-300 mb-3" />
            <p className="text-[14px] font-medium text-ink-900 mb-1">Nothing to preview.</p>
            <p className="text-small text-ink-500">Adjust your date range or log some sessions.</p>
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
