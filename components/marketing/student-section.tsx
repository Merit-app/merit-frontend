'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StudentDemo } from './student-demo';
import { Reveal, RevealGroup, RevealItem, CountUp } from '@/components/motion';
import { Section, Eyebrow, SectionHeading, Lead, MarketingCard } from './_primitives';

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

/* ============================================================== Hero (dark) */

export function HeroSection() {
  return (
    <Section
      id="students"
      theme="dark"
      spotlight
      padding="pt-16 pb-24 sm:pt-24 sm:pb-32"
      className="scroll-mt-16"
    >
      <motion.div variants={container} initial="hidden" animate="visible">
        {/* Hero copy */}
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-merit-blue-400" />
            Trusted by students across BC
          </motion.div>

          <motion.div variants={item}>
            <SectionHeading as="h1" variant="display" className="mb-6">
              Service hours
              <br />
              <span className="text-merit-blue-400">you can actually prove.</span>
            </SectionHeading>
          </motion.div>

          <motion.div variants={item}>
            <Lead className="mx-auto mb-8 max-w-2xl">
              Log volunteer hours, get them verified by SMS, and export beautiful signed PDFs for
              college applications and graduation requirements.
            </Lead>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-full bg-merit-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-merit-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-merit-blue-500 active:translate-y-0 active:scale-[0.98]"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-full px-7 py-3.5 text-base font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.p variants={item} className="mt-4 text-xs text-zinc-500">
            Free forever for students. No credit card.
          </motion.p>
        </div>

        {/* Phone demo — dark chrome so labels/caption stay legible on near-black */}
        <motion.div variants={item}>
          <StudentDemo tone="dark" />
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* =================================================== Student proof (light) */

const STATS = [
  { value: 2, suffix: ' min', label: 'Average time to log a session' },
  { prefix: '< ', value: 30, suffix: 's', label: 'Average supervisor response' },
  { value: 100, suffix: '%', label: 'PDF accepted rate' },
  { text: 'Free', label: 'For every student' },
] as const;

const TESTIMONIALS = [
  {
    quote:
      'My NHS advisor asked me what I was using. She wants to recommend it to the whole chapter.',
    name: 'Jordan K.',
    school: 'Eric Hamber Secondary',
    grade: 'Grade 12',
  },
  {
    quote: "I've been using a spreadsheet for two years. I switched to Merit in one afternoon.",
    name: 'Maya T.',
    school: 'Burnaby North Secondary',
    grade: 'Grade 11',
  },
  {
    quote: 'The PDF has a QR code. My scholarship committee scanned it on the spot.',
    name: 'Priya S.',
    school: 'Lord Byng Secondary',
    grade: 'Grade 12',
  },
] as const;

export function StudentProofSection() {
  return (
    <Section id="students-proof" theme="light" className="scroll-mt-16 border-t border-border">
      {/* Band header */}
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow className="mb-4">For students</Eyebrow>
        <SectionHeading className="mb-6">The fastest way to a verified record.</SectionHeading>
        <Lead className="mx-auto">
          Log in seconds, verify by text, export a signed PDF. That&apos;s the whole loop — no
          spreadsheet, no chasing signatures.
        </Lead>
      </Reveal>

      {/* Stats strip */}
      <RevealGroup className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 text-center sm:mt-28 md:grid-cols-4">
        {STATS.map((stat) => (
          <RevealItem key={stat.label}>
            {'text' in stat ? (
              <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground sm:text-4xl">
                {stat.text}
              </p>
            ) : (
              <CountUp
                value={stat.value}
                prefix={'prefix' in stat ? stat.prefix : undefined}
                suffix={stat.suffix}
                className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              />
            )}
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Testimonials */}
      <div className="mx-auto mt-20 max-w-5xl sm:mt-28">
        <Reveal>
          <Eyebrow className="mb-12 text-center">From students who&apos;ve used it</Eyebrow>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <RevealItem key={t.name}>
              <MarketingCard interactive className="h-full">
                <p className="text-sm leading-relaxed text-foreground sm:text-[15px]">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-merit-blue-50 text-xs font-bold text-merit-blue-600">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.school} · {t.grade}
                    </p>
                  </div>
                </div>
              </MarketingCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* Final CTA */}
      <Reveal className="mx-auto mt-20 max-w-2xl text-center sm:mt-28">
        <SectionHeading className="mb-4">Your advisor will notice the difference.</SectionHeading>
        <p className="mb-8 text-muted-foreground">Stop tracking hours in a spreadsheet.</p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-full bg-merit-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-merit-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-merit-blue-700 active:translate-y-0 active:scale-[0.98]"
        >
          Create your free account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </Section>
  );
}
