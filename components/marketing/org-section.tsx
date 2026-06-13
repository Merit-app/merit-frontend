'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Users, BarChart3, CheckCircle2 } from 'lucide-react';
import { OrgShowcase } from './org-showcase';
import { OrgLaptopMockup } from './org-laptop-mockup';
import { Section, Eyebrow, SectionHeading, Lead, MarketingCard, IconChip, cardTitleCls, cardBodyCls } from './_primitives';

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

/* Each step pairs copy with a small static slice of the real product UI
   (Stripe-style) — the inset slices use real status colors (verified=green,
   pending=amber) because those are genuine product states, while all decorative
   accent stays merit-blue only. */
const STEPS = [
  {
    step: '01',
    title: 'Volunteers log their own hours',
    desc: 'Students log sessions in the Merit app. Every pending session lands in your dashboard — no chasing spreadsheets.',
    icon: Users,
    slice: 'logged',
  },
  {
    step: '02',
    title: 'You verify in one click',
    desc: 'See every pending session. Click Verify. The student is notified instantly and their PDF updates. No emails, no paper.',
    icon: CheckCircle2,
    slice: 'verify',
  },
  {
    step: '03',
    title: 'Run events, get grant reports',
    desc: 'Create shifts, check in arrivals, send bulk SMS, and generate professional grant impact reports in one click.',
    icon: BarChart3,
    slice: 'report',
  },
] as const;

function StepSlice({ kind }: { kind: (typeof STEPS)[number]['slice'] }) {
  if (kind === 'logged') {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">Sorted food donations</p>
            <p className="truncate text-[11px] text-zinc-500">Vancouver Food Bank · 4.0h</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        </div>
      </div>
    );
  }
  if (kind === 'verify') {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-merit-blue-500/15 text-[11px] font-bold text-merit-blue-300">
              SK
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">Sarah Kim</p>
              <p className="truncate text-[11px] text-zinc-500">4.0h · Food Bank</p>
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-merit-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            Verify
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="font-mono text-sm font-semibold tabular-nums text-white">1,240</p>
        <p className="text-[10px] text-zinc-500">Verified hours</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="font-mono text-sm font-semibold tabular-nums text-white">86</p>
        <p className="text-[10px] text-zinc-500">Volunteers</p>
      </div>
    </div>
  );
}

export function OrgSection() {
  return (
    <Section id="organizations" theme="dark" className="scroll-mt-16 border-t border-white/5">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Section hero */}
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <motion.div variants={item}>
            <Eyebrow className="mb-4">For organizations</Eyebrow>
          </motion.div>

          <motion.div variants={item}>
            <SectionHeading variant="display" className="mb-6">
              Your volunteer program,
              <br />
              <span className="text-zinc-500">finally organized.</span>
            </SectionHeading>
          </motion.div>

          <motion.div variants={item}>
            <Lead className="mx-auto mb-10 max-w-2xl">
              Manage volunteers, run events, send announcements, and generate grant reports — all
              from one dashboard. Students log hours themselves. You just verify.
            </Lead>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/org/login"
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-200"
            >
              Sign in to your organization
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/org"
              className="rounded-full px-7 py-3.5 font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              Learn more
            </Link>
          </motion.div>
        </div>

        {/* Notion-style laptop feature showcase */}
        <motion.div variants={item}>
          <OrgShowcase />
        </motion.div>

        {/* 3-step journey cards — unified card system + embedded UI slices */}
        <motion.div variants={container} className="mt-20 grid grid-cols-1 gap-5 sm:mt-28 sm:gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <motion.div key={s.step} variants={item}>
              <MarketingCard interactive className="flex h-full flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-zinc-500">{s.step}</span>
                  <IconChip>
                    <s.icon className="h-4 w-4" />
                  </IconChip>
                </div>
                <p className={cardTitleCls(true)}>{s.title}</p>
                <p className={cardBodyCls(true)}>{s.desc}</p>
                <div className="mt-auto">
                  <StepSlice kind={s.slice} />
                </div>
              </MarketingCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Laptop dashboard mockup — shown on mobile/tablet (desktop has the rich
            interactive showcase above) so the org section always has a laptop. */}
        <motion.div variants={item} className="mt-20 sm:mt-28 lg:hidden">
          <OrgLaptopMockup />
        </motion.div>

        {/* Cross-promo: explain to students seeing the page */}
        <motion.div variants={item} className="mx-auto mt-20 max-w-2xl sm:mt-28">
          <MarketingCard className="text-center">
            <p className="text-sm text-zinc-400">Already using Merit as a student?</p>
            <p className="mt-1 text-lg font-semibold text-white">This is what your supervisors see.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              When you submit a session, it appears in your organization&apos;s dashboard. One tap
              from them and you&apos;re verified.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-merit-blue-400 transition-colors hover:text-merit-blue-300"
            >
              Start tracking your hours
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </MarketingCard>
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="mx-auto mt-20 max-w-2xl text-center sm:mt-28">
          <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to organize your volunteer program?
          </h3>
          <p className="mb-8 mt-4 text-zinc-400">Claim your org page in 2 minutes. Free for nonprofits.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/org/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-zinc-900 shadow-lg transition-colors hover:bg-zinc-200"
            >
              Sign in to your org
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/organizations" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Browse organizations
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
