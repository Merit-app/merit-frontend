'use client';

import { useState } from 'react';
import { schoolApi, ApiError } from '@/lib/api';
import { Users, ClipboardCheck, FileDown, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChapterMockup } from './chapter-mockup';
import { Reveal, RevealGroup, RevealItem, AnimatedProgress } from '@/components/motion';
import { Section, Eyebrow, SectionHeading, Lead, BentoCard, IconChip, cardTitleCls, cardBodyCls } from './_primitives';

/* Quiet supporting outcomes — the roster outcome is the loud anchor, built
   separately below. */
const QUIET_OUTCOMES = [
  {
    icon: Users,
    title: 'Provision your whole roster',
    body: 'Upload a CSV and invite every student at once — no one-by-one signups.',
  },
  {
    icon: FileDown,
    title: 'Export verified records',
    body: 'One-click CSVs of verified hours for transcripts, scholarships, and grad requirements.',
  },
] as const;

/* Real product states — green=met, amber=at-risk are genuine; blue=on-track is
   the same brand-blue hex, via the dark-remapped `blue-*` tokens so the pill
   stays legible when the light band flips to dark mode. */
const ROSTER_ROWS = [
  { name: 'Sarah Kim', pct: 100, status: 'met' as const },
  { name: 'Maya Thompson', pct: 64, status: 'on_track' as const },
  { name: 'Jacob Liu', pct: 28, status: 'at_risk' as const },
];

const ROSTER_STYLE = {
  met: { bar: 'bg-green-500', pill: 'bg-green-50 text-green-700', label: 'Met' },
  on_track: { bar: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700', label: 'On track' },
  at_risk: { bar: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700', label: 'At risk' },
};

/* The anchor's embedded roster — bars fill 0→value on scroll-into-view via the
   reduced-motion-safe AnimatedProgress primitive; bleeds to the card's edge. */
function RosterAnchorSlice() {
  return (
    <div className="-mx-6 -mb-6 mt-6 border-t border-border bg-background/60 px-6 py-5 sm:-mx-7 sm:-mb-7 sm:px-7">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Class of 2026 · live
      </p>
      <div className="space-y-3">
        {ROSTER_ROWS.map((r, i) => {
          const st = ROSTER_STYLE[r.status];
          return (
            <div key={r.name} className="flex items-center gap-3 text-xs">
              <span className="w-24 shrink-0 truncate font-medium text-foreground">{r.name}</span>
              <AnimatedProgress
                value={r.pct}
                delay={0.1 + i * 0.12}
                className="h-1.5 flex-1"
                barClassName={st.bar}
                aria-label={`${r.name}: ${r.pct}% of required hours`}
              />
              <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium', st.pill)}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    <Section id="schools" theme="light" className="scroll-mt-16 border-t border-border">
      {/* Section header */}
      <Reveal className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
        <Eyebrow className="mb-4">For schools &amp; chapters</Eyebrow>
        <SectionHeading className="mb-6">
          Every student&apos;s hours.
          <br />
          <span className="text-muted-foreground">One dashboard.</span>
        </SectionHeading>
        <Lead className="mx-auto max-w-xl">
          Merit gives NHS chapters, IB CAS programs, and service-learning coordinators one place to
          manage every student&apos;s verified hours — without the spreadsheets.
        </Lead>
      </Reveal>

      {/* Chapter dashboard mockup */}
      <ChapterMockup />

      {/* Outcomes + lead form */}
      <div className="mt-20 grid gap-12 sm:mt-28 lg:grid-cols-2 lg:items-start">
        {/* Left: outcome bento — the roster card is the loud anchor (light blue
            tint + embedded roster whose bars fill on scroll-in); the provision
            and export outcomes stay quiet above and below it. */}
        <div>
          <RevealGroup className="space-y-4 sm:space-y-5">
            {/* Quiet — Provision */}
            <RevealItem>
              <BentoCard interactive glow="tr">
                <div className="flex gap-3.5 p-5 sm:p-6">
                  <IconChip className="mt-0.5 shrink-0">
                    <Users className="h-4 w-4" />
                  </IconChip>
                  <div className="min-w-0">
                    <h3 className={cardTitleCls(false)}>{QUIET_OUTCOMES[0].title}</h3>
                    <p className={cardBodyCls(false)}>{QUIET_OUTCOMES[0].body}</p>
                  </div>
                </div>
              </BentoCard>
            </RevealItem>

            {/* Anchor — See who's met their hours */}
            <RevealItem>
              <BentoCard anchor>
                <div className="p-6 sm:p-7">
                  <div className="flex gap-3.5">
                    <IconChip className="mt-0.5 shrink-0">
                      <ClipboardCheck className="h-4 w-4" />
                    </IconChip>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                        See who&apos;s met their hours
                      </h3>
                      <p className={cardBodyCls(false)}>
                        <span className="font-semibold text-foreground">A live dashboard.</span> See
                        exactly who&apos;s on track and who&apos;s behind, by grad year — no
                        spreadsheets.
                      </p>
                    </div>
                  </div>
                  <RosterAnchorSlice />
                </div>
              </BentoCard>
            </RevealItem>

            {/* Quiet — Export */}
            <RevealItem>
              <BentoCard interactive glow="bl">
                <div className="flex gap-3.5 p-5 sm:p-6">
                  <IconChip className="mt-0.5 shrink-0">
                    <FileDown className="h-4 w-4" />
                  </IconChip>
                  <div className="min-w-0">
                    <h3 className={cardTitleCls(false)}>{QUIET_OUTCOMES[1].title}</h3>
                    <p className={cardBodyCls(false)}>{QUIET_OUTCOMES[1].body}</p>
                  </div>
                </div>
              </BentoCard>
            </RevealItem>
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
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
          <div className="rounded-md border border-border bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
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
                  className="w-full rounded-md bg-merit-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-merit-blue-600/20 transition-all hover:bg-merit-blue-700 active:scale-[0.99] disabled:opacity-60">
                  {submitting ? 'Sending…' : 'Request early access'}
                </button>
                <p className="text-center text-xs text-muted-foreground">No credit card. Free for pilot schools.</p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/25';

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
