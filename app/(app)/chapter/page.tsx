'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  adminApi,
  ApiError,
  type ComplianceReport,
  type RosterImportRow,
  type RosterImportResult,
} from '@/lib/api';
import { Upload, Download, CheckCircle2, AlertCircle, Users, GraduationCap } from 'lucide-react';

// ── CSV parsing ───────────────────────────────────────────────────────────────
// Accepts headers in any order; recognises name/email/grad(uation) year columns.
function parseRosterCsv(text: string): { rows: RosterImportRow[]; parseErrors: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { rows: [], parseErrors: ['File is empty.'] };

  const splitLine = (line: string): string[] => {
    // Minimal RFC-4180-ish splitter handling quoted fields.
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = header.findIndex((h) => h.includes('name'));
  const emailIdx = header.findIndex((h) => h.includes('email'));
  const gradIdx = header.findIndex((h) => h.includes('grad') || h.includes('year') || h.includes('class'));

  const parseErrors: string[] = [];
  if (emailIdx === -1) parseErrors.push('Could not find an "email" column in the header row.');
  if (nameIdx === -1) parseErrors.push('Could not find a "name" column in the header row.');
  if (parseErrors.length) return { rows: [], parseErrors };

  const rows: RosterImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const email = (cols[emailIdx] ?? '').trim();
    const name = (cols[nameIdx] ?? '').trim();
    if (!email) continue;
    const gradRaw = gradIdx >= 0 ? (cols[gradIdx] ?? '').trim() : '';
    const gradYear = gradRaw && /^\d{4}$/.test(gradRaw) ? Number(gradRaw) : null;
    rows.push({ name: name || email.split('@')[0], email, graduationYear: gradYear });
  }
  return { rows, parseErrors };
}

export default function ChapterPage() {
  const [loading, setLoading] = useState(true);
  const [notCoordinator, setNotCoordinator] = useState(false);
  const [chapter, setChapter] = useState<any>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [chap, comp] = await Promise.all([adminApi.getChapter(), adminApi.getCompliance()]);
      setChapter(chap.data);
      setReport(comp.data);
      setNotCoordinator(false);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setNotCoordinator(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading chapter…</div>;
  }

  if (notCoordinator) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">No chapter found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is for chapter coordinators (NHS, IB CAS, service-learning leads). If you
          should have access, ask your chapter&apos;s primary coordinator to add you, or contact
          support.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">{chapter?.name ?? 'Chapter'}</h1>
        <p className="text-sm text-muted-foreground">Manage your roster, requirement, and compliance.</p>
      </div>

      <Tabs defaultValue="compliance">
        <TabsList>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="roster">Import roster</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance">
          <ComplianceView report={report} onRefresh={load} />
        </TabsContent>

        <TabsContent value="roster">
          <RosterImport onImported={load} />
        </TabsContent>

        <TabsContent value="settings">
          <ChapterSettings chapter={chapter} onSaved={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Compliance dashboard ────────────────────────────────────────────────────────
function ComplianceView({ report, onRefresh }: { report: ComplianceReport | null; onRefresh: () => void }) {
  const [downloading, setDownloading] = useState(false);

  if (!report) return <p className="py-8 text-sm text-muted-foreground">No data yet.</p>;

  const pct = report.totalStudents > 0 ? Math.round((report.metCount / report.totalStudents) * 100) : 0;

  async function downloadCsv() {
    setDownloading(true);
    try {
      const blob = await adminApi.exportComplianceCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compliance.csv';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {report.requiredHours === 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            No hour requirement is set yet. Go to <strong>Settings</strong> and set the required
            hours (e.g. 30) so compliance can be tracked.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Students" value={report.totalStudents} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Met requirement" value={report.metCount} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Still behind" value={report.notMetCount} tone="warning" icon={<AlertCircle className="h-4 w-4" />} />
        <StatCard label="Required hours" value={report.requiredHours} icon={<GraduationCap className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cohort progress</CardTitle>
            <CardDescription>{pct}% of students have met the requirement.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadCsv} disabled={downloading}>
            <Download className="mr-1.5 h-4 w-4" /> {downloading ? 'Exporting…' : 'Export CSV'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={pct} />

          {report.byGradYear.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {report.byGradYear.map((g) => (
                <Badge key={String(g.graduationYear)} variant="secondary">
                  {g.graduationYear ?? 'No year'}: {g.met}/{g.total} met
                </Badge>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Grad year</th>
                  <th className="py-2 pr-4 font-medium">Verified hrs</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="py-2 pr-4">
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{s.graduationYear ?? '—'}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {s.verifiedHours}
                      {report.requiredHours > 0 && <span className="text-muted-foreground"> / {s.requiredHours}</span>}
                    </td>
                    <td className="py-2 pr-4">
                      {s.met ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Met
                        </span>
                      ) : report.requiredHours > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">{s.remaining} hrs left</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {report.students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No students yet. Import your roster to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: 'success' | 'warning';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-green-600 dark:text-green-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-foreground';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
        <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

// ── Roster import ───────────────────────────────────────────────────────────────
function RosterImport({ onImported }: { onImported: () => void }) {
  const [rows, setRows] = useState<RosterImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [result, setResult] = useState<RosterImportResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleText(text: string) {
    setResult(null);
    setError(null);
    const { rows, parseErrors } = parseRosterCsv(text);
    setRows(rows);
    setParseErrors(parseErrors);
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => handleText(String(reader.result ?? ''));
    reader.readAsText(file);
  }

  async function submit() {
    if (rows.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await adminApi.importRoster(rows);
      setResult(res.data);
      setRows([]);
      onImported();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Import students</CardTitle>
          <CardDescription>
            Upload a CSV with columns <code>name</code>, <code>email</code>, and optionally{' '}
            <code>graduation year</code>. Each student gets an invite to join your chapter. Up to
            1,000 rows per import.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
              <Upload className="h-4 w-4" /> Choose CSV file
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
            <span className="text-xs text-muted-foreground">or paste below</span>
          </div>

          <textarea
            className="h-32 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
            placeholder={'name,email,graduation year\nJane Doe,jane@school.org,2026\nJohn Roe,john@school.org,2027'}
            onChange={(e) => handleText(e.target.value)}
          />

          {parseErrors.length > 0 && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
              {parseErrors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          {rows.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              <span><strong>{rows.length}</strong> students ready to import</span>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Importing…' : `Import ${rows.length} students`}
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && (
            <div className="rounded-lg border border-border bg-card p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" /> Imported {result.created} student
                {result.created === 1 ? '' : 's'}
              </div>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {result.skippedExisting > 0 && (
                  <li>{result.skippedExisting} skipped (already a member or invited)</li>
                )}
                {result.errors.length > 0 && (
                  <li className="text-amber-600 dark:text-amber-400">
                    {result.errors.length} could not be imported:
                    <ul className="ml-4 list-disc">
                      {result.errors.slice(0, 5).map((e, i) => (
                        <li key={i}>{e.email}: {e.reason}</li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Settings: required hours ────────────────────────────────────────────────────
function ChapterSettings({ chapter, onSaved }: { chapter: any; onSaved: () => void }) {
  const [requiredHours, setRequiredHours] = useState<string>(String(chapter?.required_hours ?? 0));
  const [domain, setDomain] = useState<string>(chapter?.verified_email_domain ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await adminApi.updateChapter({
        requiredHours: Math.max(0, parseInt(requiredHours || '0', 10) || 0),
        verifiedEmailDomain: domain || undefined,
      });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Chapter settings</CardTitle>
          <CardDescription>Set the graduation/membership requirement and auto-join domain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="required-hours">Required verified hours</Label>
            <Input
              id="required-hours"
              type="number"
              min={0}
              value={requiredHours}
              onChange={(e) => setRequiredHours(e.target.value)}
              placeholder="e.g. 30"
            />
            <p className="text-xs text-muted-foreground">
              Students must reach this many <strong>org-verified</strong> hours to be marked compliant.
            </p>
          </div>

          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="domain">Verified email domain (optional)</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. students.myschool.org"
            />
            <p className="text-xs text-muted-foreground">
              Students signing up with this email domain can auto-join your chapter.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</Button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved ✓</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
