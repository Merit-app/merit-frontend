'use client';

import { useState } from 'react';
import { schoolApi, ApiError } from '@/lib/api';
import { Users, ClipboardCheck, FileDown, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { ChapterMockup } from './chapter-mockup';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion';

const OUTCOMES = [
  { icon: Users, title: 'Provision your whole roster', body: 'Upload a CSV and invite every student at once — no one-by-one signups.' },
  { icon: ClipboardCheck, title: 'See who’s met their hours', body: 'A live dashboard shows exactly who’s on track and who’s behind, by grad year.' },
  { icon: FileDown, title: 'Export verified records', body: 'One-click CSVs of verified hours for transcripts, scholarships, and grad requirements.' },
];

export function SchoolSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    schoolName: '',
    coordinatorName: '',
    email: '',
    role: '',
    studentCount: '',
    note: '',
  });

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await schoolApi.submitLead({
        schoolName: form.schoolName.trim(),
        coordinatorName: form.coordinatorName.trim(),
        email: form.email.trim(),
        role: form.role.trim() || undefined,
        studentCount: form.studentCount ? Number(form.studentCount) : undefined,
        note: form.note.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-t border-border bg-background py-24 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-block rounded-full border border-merit-blue-200 bg-merit-blue-50 px-3 py-1 text-xs font-semibold text-merit-blue-700 dark:text-merit-blue-200">
            For schools &amp; chapters
          </span>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl leading-[1.1]">
            Every student&apos;s hours.
            <br />
            <span className="text-muted-foreground">One dashboard.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Merit gives NHS chapters, IB CAS programs, and service-learning coordinators one
            place to manage every student&apos;s verified hours — without the spreadsheets.
          </p>
        </Reveal>

        {/* Chapter dashboard mockup */}
        <ChapterMockup />

        {/* Outcomes + lead form */}
        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: pitch */}
          <div>
            <RevealGroup className="space-y-6">
              {OUTCOMES.map(({ icon: Icon, title, body }) => (
                <RevealItem key={title} className="flex gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-merit-blue-50">
                    <Icon className="h-4 w-4 text-merit-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.1}>
              <div className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-merit-blue-600" />
                Admin-controlled accounts · student consent built in · your students&apos; data stays yours.
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Already have a chapter?{' '}
                <a
                  href="/login?redirect=/chapter/overview"
                  className="inline-flex items-center gap-1 font-semibold text-merit-blue-600 hover:text-merit-blue-700 dark:text-merit-blue-400 dark:hover:text-merit-blue-200"
                >
                  Sign in to your school dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </p>
            </Reveal>
          </div>

          {/* Right: lead form */}
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">Request received!</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Thanks — we&apos;ll review your school and reach out at <strong>{form.email}</strong> to
                    get your chapter set up. Keep an eye on your inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Get early access for your school</h3>
                    <p className="text-sm text-muted-foreground">Tell us a bit about your program — we&apos;ll set you up.</p>
                  </div>

                  <Field label="School / organization name" required>
                    <input required value={form.schoolName} onChange={(e) => update('schoolName', e.target.value)}
                      className={inputCls} placeholder="e.g. Vancouver Tech NHS" />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Your name" required>
                      <input required value={form.coordinatorName} onChange={(e) => update('coordinatorName', e.target.value)}
                        className={inputCls} placeholder="Jane Smith" />
                    </Field>
                    <Field label="Your role">
                      <input value={form.role} onChange={(e) => update('role', e.target.value)}
                        className={inputCls} placeholder="NHS Advisor" />
                    </Field>
                  </div>

                  <Field label="Email" required>
                    <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                      className={inputCls} placeholder="you@school.org" />
                  </Field>

                  <Field label="Approx. number of students">
                    <input type="number" min={0} value={form.studentCount} onChange={(e) => update('studentCount', e.target.value)}
                      className={inputCls} placeholder="e.g. 200" />
                  </Field>

                  <Field label="Anything else? (optional)">
                    <textarea value={form.note} onChange={(e) => update('note', e.target.value)}
                      className={`${inputCls} h-20 resize-none`} placeholder="What are you using today?" />
                  </Field>

                  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                  <button type="submit" disabled={submitting}
                    className="w-full rounded-lg bg-merit-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-merit-blue-600/20 transition-all hover:bg-merit-blue-700 active:scale-[0.99] disabled:opacity-60">
                    {submitting ? 'Sending…' : 'Request early access'}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">No credit card. Free for pilot schools.</p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/25';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
