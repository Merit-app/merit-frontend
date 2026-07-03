'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingNav } from '@/components/marketing/nav';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion';
import { cn } from '@/lib/utils';

type Cycle = 'monthly' | 'yearly';

const PLANS = [
  {
    name: 'Free',
    monthly: '$0',
    yearly: '$0',
    period: 'forever',
    description: 'Everything you need to get started.',
    cta: 'Get started free',
    ctaHref: '/signup',
    highlighted: false,
    features: ['3 SMS verifications / day', 'Up to 50 hours logged', 'Classic PDF export', 'Basic dashboard', 'Up to 5 organizations'],
  },
  {
    name: 'Pro',
    monthly: '$4.99',
    yearly: '$2.92',
    period: '/mo',
    yearlyBilled: 'billed $34.99/yr',
    description: 'For serious students chasing multiple goals.',
    cta: 'Upgrade to Pro',
    ctaHref: '/signup?plan=pro',
    highlighted: true,
    badge: 'Most popular',
    features: ['15 SMS verifications / day', 'Unlimited hours', 'Classic + Modern PDF', 'Advanced stats dashboard', 'Scholarship tracker', 'Unlimited organizations', 'CSV export', 'Priority support'],
  },
  {
    name: 'Premium',
    monthly: '$9.99',
    yearly: '$6.67',
    period: '/mo',
    yearlyBilled: 'billed $79.99/yr',
    description: 'Maximum verification power and customization.',
    cta: 'Upgrade to Premium',
    ctaHref: '/signup?plan=premium',
    highlighted: false,
    features: ['Unlimited SMS verifications', 'All PDF templates', 'Custom PDF branding', 'AI-powered hour insights', 'Advanced fraud analytics', 'Bulk session import', 'API access', 'Priority support'],
  },
];

const INSTITUTIONAL = {
  name: 'Institutional',
  description: 'For schools and clubs managing multiple students.',
  features: ['Everything in Premium', 'Admin dashboard for advisors', 'Supervisor whitelist management', 'Custom branded PDFs', 'Grant reporting exports', 'Dedicated onboarding', 'SLA support'],
};

export function PricingView() {
  const [cycle, setCycle] = useState<Cycle>('yearly');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Header with soft gradient depth */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-160px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-merit-blue-500/10 blur-[120px]" />
          <div className="absolute inset-0 text-foreground bg-grid-faint mask-radial-fade opacity-[0.04]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-8 text-center">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-merit-blue-600">Pricing</p>
            <h1 className="text-section-title mb-4 text-foreground">Simple, honest pricing.</h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Start free. Upgrade when you need more verifications, templates, or advanced tracking.
            </p>
          </Reveal>

          {/* Billing toggle */}
          <Reveal delay={0.1} className="mt-8 flex items-center justify-center">
            <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
              {(['monthly', 'yearly'] as Cycle[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                    cycle === c ? 'text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {cycle === c && (
                    <motion.span
                      layoutId="cycle-pill"
                      className="absolute inset-0 rounded-full bg-merit-blue-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {c}
                    {c === 'yearly' && <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">−40%</span>}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <RevealItem key={plan.name} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-200',
                  plan.highlighted
                    ? 'border-merit-blue-300 bg-card shadow-[0_16px_48px_-24px_rgba(37,99,235,0.45)] dark:border-merit-blue-500/40'
                    : 'border-border bg-card hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]',
                )}
              >
                {plan.highlighted && (
                  <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-merit-blue-500/15 blur-3xl" />
                )}
                <div className="relative mb-3 flex items-center justify-between">
                  <p className="text-[15px] font-semibold text-foreground">{plan.name}</p>
                  {plan.badge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-merit-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                      <Sparkles className="h-3 w-3" /> {plan.badge}
                    </span>
                  )}
                </div>

                <div className="relative mb-1 flex items-end gap-1">
                  <span className="font-mono text-4xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
                    {cycle === 'monthly' ? plan.monthly : plan.yearly}
                  </span>
                  {plan.period !== 'forever' && <span className="mb-1 text-sm text-muted-foreground">/mo</span>}
                  {plan.period === 'forever' && <span className="mb-1 text-sm text-muted-foreground">forever</span>}
                </div>
                <p className="relative mb-4 h-4 text-[12px] text-muted-foreground">
                  {cycle === 'yearly' && 'yearlyBilled' in plan ? plan.yearlyBilled : ' '}
                </p>

                <p className="relative mb-5 text-[13px] text-muted-foreground">{plan.description}</p>

                <ul className="relative mb-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-foreground/90">
                      <Check size={15} className={cn('mt-0.5 shrink-0', plan.highlighted ? 'text-merit-blue-600' : 'text-success')} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={cn(
                    'relative w-full rounded-xl py-2.5 text-center text-[14px] font-semibold transition-all active:scale-[0.98]',
                    plan.highlighted
                      ? 'bg-merit-blue-600 text-white shadow-lg shadow-merit-blue-600/25 hover:-translate-y-0.5 hover:bg-merit-blue-700'
                      : 'border border-border text-foreground hover:bg-muted',
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Institutional */}
        <Reveal className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-[15px] font-semibold text-foreground">{INSTITUTIONAL.name}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Contact us</span>
                </div>
                <p className="mb-4 text-[13px] text-muted-foreground">{INSTITUTIONAL.description}</p>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {INSTITUTIONAL.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-foreground/90">
                      <Check size={13} className="shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="mailto:hello@meritco.app"
                className="shrink-0 rounded-xl border border-border px-6 py-2.5 text-center text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Contact us →
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-merit-blue-600/25 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white">Start free today.</h2>
          <p className="mb-7 text-[15px] text-zinc-400">No credit card required. Upgrade any time.</p>
          <Link
            href="/signup"
            className="inline-flex rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-merit-blue-700 transition-all hover:-translate-y-0.5 hover:bg-merit-blue-50 active:translate-y-0"
          >
            Get started free
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
