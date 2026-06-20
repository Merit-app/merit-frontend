'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Users, BarChart3, CheckCircle2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrgShowcase } from './org-showcase';
import { OrgLaptopMockup } from './org-laptop-mockup';
import {
  Section,
  Eyebrow,
  SectionHeading,
  Lead,
  MarketingCard,
  BentoCard,
  IconChip,
  floatCardCls,
  cardTitleCls,
  cardBodyCls,
} from './_primitives';

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

/* Quiet supporting slices — a small framed slice of the real product UI sits at
   the bottom of each quiet card. Real status colors (pending=amber) are genuine
   product states; all decorative accent stays merit-blue only. */
function StepSlice({ kind }: { kind: 'logged' | 'report' }) {
  if (kind === 'logged') {
    return (
      <div className="mt-6 rounded-md border border-white/10 bg-white/[0.03] p-3">
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
  return (
    <div className="mt-6 grid grid-cols-2 gap-2.5">
      <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <p className="font-mono text-lg font-semibold tabular-nums text-white">1,240</p>
        <p className="text-[10px] text-zinc-500">Verified hours</p>
      </div>
      <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <p className="font-mono text-lg font-semibold tabular-nums text-white">86</p>
        <p className="text-[10px] text-zinc-500">Volunteers</p>
      </div>
    </div>
  );
}

const QUEUE_OTHERS = [
  { initials: 'JL', name: 'Jacob Liu', meta: '2.5h · Community Library' },
  { initials: 'MT', name: 'Maya Thompson', meta: '3.0h · Youth Shelter' },
] as const;

/* ----------------------------------------------- Verify anchor walkthrough ---
   Scroll-triggered micro-walkthrough of the one-click verify flow inside a real-
   looking verification queue: the top pending session flips to verified, the
   pending count ticks down, and a "PDF updated" card floats in. Plays ONCE on
   scroll-into-view; reduced-motion renders the final state with no timers. */
function OrgVerifyQueue() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [phase, setPhase] = useState<'pending' | 'verifying' | 'verified'>('pending');

  useEffect(() => {
    if (reduce) {
      setPhase('verified');
      return;
    }
    if (!inView) return;
    const t1 = setTimeout(() => setPhase('verifying'), 800);
    const t2 = setTimeout(() => setPhase('verified'), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView, reduce]);

  const verified = phase === 'verified';
  const pendingCount = verified ? 2 : 3;

  return (
    <div ref={ref} className="relative -mx-7 -mb-7 mt-7 sm:-mx-9 sm:-mb-9">
      {/* Floating status card — overlaps the queue, soft shadow for real depth.
          Hidden on mobile (the inline Verified pill carries the signal there). */}
      <AnimatePresence>
        {verified && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={cn(
              floatCardCls(true),
              'absolute right-7 top-0 z-20 hidden -translate-y-1/2 items-center gap-2 sm:right-9 sm:flex',
            )}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-green-500/15 text-green-400">
              <Check className="h-3.5 w-3.5" />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold text-white">PDF updated</p>
              <p className="font-mono text-[10px] text-zinc-400">+4.0h verified</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification queue — framed panel that bleeds to the card's bottom edge. */}
      <div className="border-t border-white/10 bg-[#0B0C0F]/70 px-7 py-6 sm:px-9">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Pending verification
          </p>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            {pendingCount} pending
          </span>
        </div>

        <div className="divide-y divide-white/[0.06] overflow-hidden rounded-md border border-white/10">
          {/* Row 1 — the animated one */}
          <div className="flex items-center justify-between gap-3 bg-white/[0.02] p-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-merit-blue-500/15 text-[11px] font-bold text-merit-blue-300">
                SK
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">Sarah Kim</p>
                <p className="truncate text-[11px] text-zinc-500">4.0h · Vancouver Food Bank</p>
              </div>
            </div>
            <div className="shrink-0">
              <AnimatePresence mode="wait" initial={false}>
                {verified ? (
                  <motion.span
                    key="verified"
                    initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-medium text-green-400"
                  >
                    <Check className="h-3 w-3" />
                    Verified
                  </motion.span>
                ) : (
                  <motion.span
                    key="verify"
                    aria-hidden
                    animate={phase === 'verifying' && !reduce ? { scale: 0.94 } : { scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="inline-block rounded-md bg-merit-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white"
                  >
                    Verify
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Rows 2–3 — static pending, so the queue reads like a real dashboard */}
          {QUEUE_OTHERS.map((o) => (
            <div key={o.initials} className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[11px] font-bold text-zinc-300">
                  {o.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">{o.name}</p>
                  <p className="truncate text-[11px] text-zinc-500">{o.meta}</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrgSection() {
  return (
    <Section id="organizations" theme="dark" spotlight className="scroll-mt-16 border-t border-white/5">
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

        {/* 3-step bento — Verify is the loud anchor (blue mesh + bleeding
            verification queue + floating status card); 01/03 stay quiet with a
            faint corner glow. Collapses to a single column below lg (iPad). */}
        <motion.div
          variants={container}
          className="mt-20 grid grid-cols-1 gap-5 sm:mt-28 lg:grid-cols-3"
        >
          {/* Anchor — 02 Verify */}
          <motion.div variants={item} className="lg:col-span-2">
            <BentoCard anchor className="h-full">
              <div className="flex h-full flex-col p-7 sm:p-9">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-zinc-500">02</span>
                  <IconChip>
                    <CheckCircle2 className="h-4 w-4" />
                  </IconChip>
                </div>
                <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  You verify in one click
                </p>
                <p className={cn(cardBodyCls(true), 'max-w-lg')}>
                  <span className="font-semibold text-zinc-200">One-click verify.</span> Every pending
                  session lands in one queue. Press Verify and the student is notified instantly —
                  their signed PDF updates on the spot. No emails, no paper.
                </p>
                <OrgVerifyQueue />
              </div>
            </BentoCard>
          </motion.div>

          {/* Quiet supporting column — 01 Log, 03 Report */}
          <div className="flex flex-col gap-5">
            <motion.div variants={item} className="flex-1">
              <BentoCard interactive glow="tr" className="h-full">
                <div className="flex h-full flex-col p-6 sm:p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-zinc-500">01</span>
                    <IconChip>
                      <Users className="h-4 w-4" />
                    </IconChip>
                  </div>
                  <p className={cardTitleCls(true)}>Volunteers log their own hours</p>
                  <p className={cardBodyCls(true)}>
                    Students log sessions in the app. Every pending session lands in your dashboard —
                    no chasing spreadsheets.
                  </p>
                  <div className="mt-auto">
                    <StepSlice kind="logged" />
                  </div>
                </div>
              </BentoCard>
            </motion.div>

            <motion.div variants={item} className="flex-1">
              <BentoCard interactive glow="bl" className="h-full">
                <div className="flex h-full flex-col p-6 sm:p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-zinc-500">03</span>
                    <IconChip>
                      <BarChart3 className="h-4 w-4" />
                    </IconChip>
                  </div>
                  <p className={cardTitleCls(true)}>Run events, get grant reports</p>
                  <p className={cardBodyCls(true)}>
                    Create shifts, check in arrivals, send bulk SMS, and generate grant impact
                    reports in one click.
                  </p>
                  <div className="mt-auto">
                    <StepSlice kind="report" />
                  </div>
                </div>
              </BentoCard>
            </motion.div>
          </div>
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
