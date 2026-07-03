'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StudentDemo } from './student-demo';
import { HeroBackdrop } from './hero-backdrop';
import { Reveal, RevealGroup, RevealItem, CountUp } from '@/components/motion';
import { Tilt } from '@/components/motion/tilt';
import { Section, Eyebrow, SectionHeading, Lead, BentoCard } from './_primitives';

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
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Parallax: the copy drifts up + fades as you scroll past; the demo rises a
  // touch slower than the page, so it feels like a layered plane (Framer/Stripe).
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.15]);
  const demoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -30]);

  return (
    <Section
      id="students"
      theme="dark"
      backdrop={<HeroBackdrop />}
      padding="pt-20 pb-24 sm:pt-28 sm:pb-32"
      className="scroll-mt-16"
    >
      <div ref={ref}>
        <motion.div variants={container} initial="hidden" animate="visible">
          {/* Hero copy */}
          <motion.div style={{ y: copyY, opacity: copyOpacity }} className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
            <motion.div
              variants={item}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-merit-blue-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-merit-blue-400" />
              </span>
              Trusted by students across BC
            </motion.div>

            <motion.h1 variants={item} className="text-hero mb-6 text-white">
              Service hours
              <br />
              <span className="bg-gradient-to-r from-merit-blue-400 via-merit-blue-300 to-indigo-300 bg-clip-text text-transparent">
                you can actually prove.
              </span>
            </motion.h1>

            <motion.div variants={item}>
              <Lead className="mx-auto mb-8 max-w-2xl">
                Log volunteer hours, get them verified by SMS, and export beautiful signed PDFs for
                college applications and graduation requirements.
              </Lead>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-merit-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-merit-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-merit-blue-500 active:translate-y-0 active:scale-[0.98]"
              >
                {/* sheen */}
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Start free</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
          </motion.div>

          {/* Phone demo — 3D-tilt + parallax, dark chrome for near-black legibility */}
          <motion.div variants={item} style={{ y: demoY }}>
            <Tilt max={6} lift={20} className="mx-auto">
              <StudentDemo tone="dark" />
            </Tilt>
          </motion.div>
        </motion.div>
      </div>
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

      {/* Hairline stat strip — columns separated by thin vertical rules (no
          boxes). Divide only at md+ so the 2-col mobile layout stays clean. */}
      <RevealGroup className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 text-center sm:mt-28 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border">
        {STATS.map((stat) => (
          <RevealItem key={stat.label} className="md:px-6">
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

      {/* Testimonials bento — one larger featured quote (soft blue tint) + two
          quieter ones. Borderless, seamless fills. */}
      <div className="mx-auto mt-20 max-w-5xl sm:mt-28">
        <Reveal>
          <Eyebrow className="mb-12 text-center">From students who&apos;ve used it</Eyebrow>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Featured */}
          <RevealItem className="lg:col-span-2">
            <BentoCard anchor className="h-full">
              <div className="flex h-full flex-col p-7 sm:p-9">
                <p className="text-lg font-medium leading-relaxed text-foreground sm:text-2xl">
                  &ldquo;{TESTIMONIALS[0].quote}&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-3 pt-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-merit-blue-50 text-sm font-bold text-merit-blue-600">
                    {TESTIMONIALS[0].name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{TESTIMONIALS[0].name}</p>
                    <p className="text-xs text-muted-foreground">
                      {TESTIMONIALS[0].school} · {TESTIMONIALS[0].grade}
                    </p>
                  </div>
                </div>
              </div>
            </BentoCard>
          </RevealItem>

          {/* Two quiet */}
          <div className="flex flex-col gap-5">
            {TESTIMONIALS.slice(1).map((t, i) => (
              <RevealItem key={t.name} className="flex-1">
                <BentoCard interactive glow={i === 0 ? 'tr' : 'bl'} className="h-full">
                  <div className="flex h-full flex-col p-6">
                    <p className="text-sm leading-relaxed text-foreground sm:text-[15px]">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-auto flex items-center gap-3 pt-5">
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
                  </div>
                </BentoCard>
              </RevealItem>
            ))}
          </div>
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
