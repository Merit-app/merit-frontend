'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Award, PenLine, MessageSquareText, FileCheck, ArrowRight } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingNav } from '@/components/marketing/nav';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion';

/** Founder photo with a graceful fallback until /kai.jpg is uploaded to public/. */
function FounderPhoto() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-merit-blue-50 to-merit-blue-100 dark:from-[#1c3257] dark:to-[#15233b]">
        <span className="font-semibold text-5xl text-merit-blue-600 dark:text-merit-blue-200">K</span>
      </div>
    );
  }
  return (
    <img
      src="/kai.jpg"
      alt="Kai, founder of Merit"
      className="h-full w-full object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

const PROBLEMS = [
  { icon: BookOpen, title: 'IB CAS', body: 'Creativity, Activity, Service — needs documented, credible proof.' },
  { icon: GraduationCap, title: 'College applications', body: 'Admissions officers want evidence they can actually trust.' },
  { icon: Award, title: 'Graduation & scholarships', body: 'Schools and committees require verifiable service records.' },
];

const SOLUTION = [
  { icon: PenLine, title: 'Log in seconds', body: 'What you did, when, and who can verify it. Merit does the rest.' },
  { icon: MessageSquareText, title: 'Verify by text', body: 'Your supervisor gets a text and replies YES. Hours are verified instantly.' },
  { icon: FileCheck, title: 'Export a signed PDF', body: 'A clean, official record with a QR code — ready for any application.' },
];

export function AboutView() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-160px] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-merit-blue-500/10 blur-[120px]" />
          <div className="absolute inset-0 text-foreground bg-grid-faint mask-radial-fade opacity-[0.04]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-8 text-center">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-merit-blue-600">Our story</p>
            <h1 className="text-section-title mb-4">Built by a student who needed it.</h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Merit makes it simple to track, verify, and prove your volunteer hours — the way we wish we could have.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Founder story */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <Reveal>
          <div className="grid grid-cols-1 gap-8 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 md:grid-cols-[minmax(0,320px)_1fr] md:items-center md:gap-10">
            {/* Photo */}
            <div className="relative mx-auto w-full max-w-[320px]">
              <div aria-hidden className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-merit-blue-500/20 to-indigo-500/10 blur-2xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted">
                {/* Save the photo to merit-frontend/public/kai.jpg */}
                <FounderPhoto />
              </div>
            </div>

            {/* Story */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Kai hated logging his volunteer hours.
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  Every term it was the same mess — a spreadsheet no one trusted, supervisors who never
                  replied to emails, and a last-minute scramble to prove it all before a scholarship deadline.
                  He&apos;d done the hours. He just couldn&apos;t <em>show</em> them.
                </p>
                <p>
                  So he built the tool he wished he&apos;d had. Log a session in seconds, get it verified with a
                  single text, and export a clean, signed PDF that scholarship committees and admissions officers
                  actually believe.
                </p>
                <p className="text-foreground">
                  That&apos;s Merit — built in Burnaby, BC, and now used by students across the province.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <span className="h-9 w-1 rounded-full bg-merit-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Kai</p>
                  <p className="text-xs text-muted-foreground">Founder, Merit</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Reveal className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-merit-blue-600">The problem</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Real hours, no way to prove them.</h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <RevealItem key={title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-merit-blue-50 text-merit-blue-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* The solution */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Reveal className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-merit-blue-600">The solution</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">The whole loop, in three steps.</h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SOLUTION.map(({ icon: Icon, title, body }, i) => (
            <RevealItem key={title}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-6">
                <span className="absolute right-5 top-5 font-mono text-sm tabular-nums text-muted-foreground/50">0{i + 1}</span>
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-merit-blue-600 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* CTA band */}
      <section className="relative mt-6 overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-merit-blue-600/25 blur-[120px]" />
        <div className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white">Prove your hours the easy way.</h2>
          <p className="mb-7 text-[15px] text-zinc-400">Free forever for students. No credit card.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-merit-blue-700 transition-all hover:-translate-y-0.5 hover:bg-merit-blue-50"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-full border border-white/15 px-7 py-3 text-[15px] font-medium text-zinc-200 transition-colors hover:bg-white/5"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
