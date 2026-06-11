'use client';

import { useCallback, useEffect, useState } from 'react';
import { chapterApi, adminApi, ApiError } from '@/lib/api';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChapterSettingsPage() {
  const [requiredHours, setRequiredHours] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [riskWindow, setRiskWindow] = useState('60');
  const [cohortGoals, setCohortGoals] = useState<{ graduationYear: number; requiredHours: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [chap, goals] = await Promise.all([adminApi.getChapter(), chapterApi.getCohortGoals()]);
      const c = chap.data as any;
      setRequiredHours(String(c.required_hours ?? 0));
      setDeadline(c.requirement_deadline ? String(c.requirement_deadline).slice(0, 10) : '');
      setRiskWindow(String(c.risk_window_days ?? 60));
      setCohortGoals(goals.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function saveSettings() {
    setSaving(true); setSaved(false); setError(null);
    try {
      await chapterApi.updateSettings({
        requiredHours: Math.max(0, parseInt(requiredHours || '0', 10) || 0),
        requirementDeadline: deadline || null,
        riskWindowDays: Math.max(1, parseInt(riskWindow || '60', 10) || 60),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-7 w-32" />
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      {/* Requirement */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-1 font-medium text-foreground">Requirement & deadline</h2>
        <p className="mb-4 text-sm text-muted-foreground">The default goal for all students (cohort goals below override it).</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Required hours">
            <input type="number" min={0} value={requiredHours} onChange={(e) => setRequiredHours(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Deadline">
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
          </Field>
          <Field label="At-risk window (days)">
            <input type="number" min={1} value={riskWindow} onChange={(e) => setRiskWindow(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Students who haven’t met their goal within <strong>{riskWindow || 60} days</strong> of the deadline are flagged “At risk.”
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveSettings} disabled={saving} className="rounded-lg bg-merit-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-merit-blue-700 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved ✓</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </section>

      {/* Cohort goals */}
      <CohortGoals goals={cohortGoals} onChange={load} />
    </div>
  );
}

function CohortGoals({ goals, onChange }: { goals: { graduationYear: number; requiredHours: number }[]; onChange: () => void }) {
  const [year, setYear] = useState('');
  const [hours, setHours] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const y = parseInt(year, 10), h = parseInt(hours, 10);
    if (!y || isNaN(h)) { setError('Enter a valid year and hours'); return; }
    setBusy(true); setError(null);
    try {
      await chapterApi.setCohortGoal(y, Math.max(0, h));
      setYear(''); setHours('');
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed');
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-1 font-medium text-foreground">Cohort goals</h2>
      <p className="mb-4 text-sm text-muted-foreground">Set a goal for a whole graduation year at once (e.g. seniors = 40 hrs). Overrides the default above.</p>

      {goals.length > 0 && (
        <div className="mb-4 space-y-2">
          {goals.map((g) => (
            <div key={g.graduationYear} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="text-foreground">Class of {g.graduationYear}</span>
              <span className="font-medium text-foreground">{g.requiredHours} hrs</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <Field label="Grad year">
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" className={`${inputCls} w-28`} />
        </Field>
        <Field label="Required hours">
          <input type="number" min={0} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="40" className={`${inputCls} w-28`} />
        </Field>
        <button onClick={add} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60">
          <Plus className="h-4 w-4" /> {busy ? 'Saving…' : 'Set goal'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}

const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-merit-blue-500 focus:outline-none focus:ring-1 focus:ring-merit-blue-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
