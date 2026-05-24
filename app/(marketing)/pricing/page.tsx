import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/footer';

export const metadata: Metadata = { title: 'Pricing · Merit' };

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to get started.',
    cta: 'Get started free',
    ctaHref: '/signup',
    highlighted: false,
    features: [
      '3 SMS verifications / day',
      'Up to 50 hours logged',
      'Classic PDF export',
      'Basic dashboard',
      'Up to 5 organizations',
    ],
  },
  {
    name: 'Pro',
    price: '$4.99',
    yearlyPrice: '$34.99',
    period: '/mo',
    yearlyNote: 'or $34.99/yr',
    description: 'For serious students chasing multiple goals.',
    cta: 'Upgrade to Pro',
    ctaHref: '/signup?plan=pro',
    highlighted: true,
    badge: 'Most popular',
    features: [
      '15 SMS verifications / day',
      'Unlimited hours',
      'Classic + Modern PDF',
      'Advanced stats dashboard',
      'Scholarship tracker',
      'Unlimited organizations',
      'CSV export',
      'Priority support',
    ],
  },
  {
    name: 'Premium',
    price: '$9.99',
    yearlyPrice: '$79.99',
    period: '/mo',
    yearlyNote: 'or $79.99/yr',
    description: 'Maximum verification power and customization.',
    cta: 'Upgrade to Premium',
    ctaHref: '/signup?plan=premium',
    highlighted: false,
    features: [
      'Unlimited SMS verifications',
      'All PDF templates',
      'Custom PDF branding',
      'AI-powered hour insights',
      'Advanced fraud analytics',
      'Bulk session import',
      'API access',
      'Priority support',
    ],
  },
];

const INSTITUTIONAL = {
  name: 'Institutional',
  description: 'For schools, NHS chapters, and clubs managing multiple students.',
  features: [
    'Everything in Premium',
    'Admin dashboard for advisors',
    'Supervisor whitelist management',
    'Custom branded PDFs',
    'Grant reporting exports',
    'Dedicated onboarding',
    'SLA support',
  ],
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink-200 bg-white">
        <Link href="/" className="text-[18px] font-bold text-ink-900 tracking-tight">
          merit<span className="text-merit-blue-600">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/faq" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">FAQ</Link>
          <Link href="/login" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">Sign in</Link>
          <Link href="/signup" className="text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-3xl mx-auto px-8 pt-16 pb-10 text-center">
        <p className="text-[12px] font-semibold text-merit-blue-600 uppercase tracking-widest mb-3">Pricing</p>
        <h1 className="text-[36px] font-bold text-ink-900 leading-tight mb-4">
          Simple, honest pricing.
        </h1>
        <p className="text-[16px] text-ink-500 max-w-xl mx-auto">
          Start free. Upgrade when you need more verifications, templates, or advanced tracking.
        </p>
      </section>

      {/* Plan cards */}
      <section className="max-w-5xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-merit-blue-300 bg-white shadow-md shadow-merit-blue-100'
                  : 'border-ink-200 bg-white'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[15px] font-semibold text-ink-900">{plan.name}</p>
                {plan.badge && (
                  <span className="text-[11px] font-semibold text-merit-blue-700 bg-merit-blue-100 px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-1">
                <span className="text-[32px] font-bold text-ink-900 leading-none">{plan.price}</span>
                {plan.period && plan.period !== 'forever' && (
                  <span className="text-[14px] text-ink-500 ml-0.5">{plan.period}</span>
                )}
                {plan.period === 'forever' && (
                  <span className="text-[14px] text-ink-400 ml-1">forever</span>
                )}
              </div>
              {plan.yearlyNote && (
                <p className="text-[12px] text-ink-400 mb-3">{plan.yearlyNote} — save 40%</p>
              )}

              <p className="text-[13px] text-ink-500 mb-5">{plan.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-ink-700">
                    <Check size={14} className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-merit-blue-600' : 'text-success'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`w-full text-center py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-merit-blue-600 hover:bg-merit-blue-700 text-white'
                    : 'border border-ink-200 hover:bg-ink-50 text-ink-900'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Institutional */}
        <div className="mt-5 rounded-xl border border-ink-200 bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[15px] font-semibold text-ink-900">{INSTITUTIONAL.name}</p>
                <span className="text-[11px] font-semibold text-ink-600 bg-ink-100 px-2 py-0.5 rounded-full">Contact us</span>
              </div>
              <p className="text-[13px] text-ink-500 mb-4">{INSTITUTIONAL.description}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {INSTITUTIONAL.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-ink-700">
                    <Check size={13} className="text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="mailto:hello@merit.app"
              className="shrink-0 px-6 py-2.5 rounded-lg border border-ink-200 hover:bg-ink-50 text-[14px] font-semibold text-ink-900 transition-colors text-center"
            >
              Contact us →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-merit-blue-600">
        <div className="max-w-3xl mx-auto px-8 py-14 text-center">
          <h2 className="text-[26px] font-bold text-white mb-3">Start free today.</h2>
          <p className="text-[14px] text-merit-blue-100 mb-6">No credit card required. Upgrade any time.</p>
          <Link
            href="/signup"
            className="inline-flex text-[14px] font-semibold text-merit-blue-600 bg-white hover:bg-merit-blue-50 px-6 py-3 rounded-lg transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
