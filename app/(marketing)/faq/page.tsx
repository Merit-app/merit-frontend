import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Merit FAQ — Your questions answered about SMS verification, PDF export, school partnerships, and more.',
  openGraph: {
    title: 'Merit FAQ',
    description: 'Merit FAQ — Your questions answered about SMS verification, PDF export, school partnerships, and more.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app/faq',
  },
};

const FAQS = [
  {
    q: 'What is Merit?',
    a: 'Merit is a service hour tracking app for high school students. It lets you log volunteer sessions, get them verified by your supervisor via SMS or email, and export a clean PDF record for NHS submissions, scholarship applications, or graduation requirements.',
  },
  {
    q: 'How does SMS verification work?',
    a: "When you log a session, Merit sends a single text message to your supervisor's mobile number. They reply YES to confirm, NO to dispute, or STOP to opt out. No app or account required on their end — just one text.",
  },
  {
    q: "What happens if my supervisor doesn't reply?",
    a: "The session stays in Pending status. You can resend the verification request from the session detail view (within the limits of your plan). If your supervisor never responds, the session remains unverified — we can't automatically verify hours your supervisor hasn't confirmed.",
  },
  {
    q: 'Can I use Merit for NHS, IB CAS, and graduation at the same time?',
    a: "Currently Merit tracks one goal at a time, but you can switch programs in Settings → Profile at any time. All logged sessions are preserved regardless of which goal is active. Multiple simultaneous goal tracking is on our roadmap.",
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Your data is stored in Canada using Supabase (ca-central-1 region) with encryption in transit and at rest. We never sell your personal information. You can export or delete all your data at any time from Settings → Account.',
  },
  {
    q: 'What PDF formats are available?',
    a: 'The Free plan includes the Classic PDF template — a clean, professional record of your sessions. Pro and Premium plans unlock the Modern template and NHS-formatted exports. Premium also allows custom PDF branding.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to Settings → Billing and click "Manage subscription." You can cancel, downgrade, or update your payment method through the Stripe billing portal. Your plan continues until the end of the current billing period.',
  },
  {
    q: 'Is Merit free?',
    a: "Yes — the Free plan is free forever with no credit card required. It includes up to 50 hours logged, 3 SMS verifications per day, and the Classic PDF export. See our Pricing page for what's included in Pro and Premium.",
  },
  {
    q: "What if my organization isn't in the database?",
    a: "No problem. When logging a session, type the organization name and select 'Create new organization.' It'll be added to your account and can be reused for future sessions. Over 1 million nonprofits are pre-loaded from IRS and CRA databases.",
  },
  {
    q: 'Can my school or NHS chapter use Merit?',
    a: "Yes — we offer an Institutional plan with an admin dashboard for advisors, supervisor whitelisting, custom branded PDFs, and grant reporting. Reach out at hello@merit.app to learn more.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink-200 bg-white">
        <Link href="/" className="text-[18px] font-bold text-ink-900 tracking-tight">
          merit<span className="text-merit-blue-600">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">Pricing</Link>
          <Link href="/login" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">Sign in</Link>
          <Link href="/signup" className="text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-8 py-14">
        <p className="text-[12px] font-semibold text-merit-blue-600 uppercase tracking-widest mb-2">Support</p>
        <h1 className="text-[32px] font-bold text-ink-900 mb-2">Frequently asked questions</h1>
        <p className="text-[15px] text-ink-500 mb-10">
          Can&apos;t find your answer?{' '}
          <a href="mailto:hello@merit.app" className="text-merit-blue-600 hover:underline">Email us</a>.
        </p>

        <div className="space-y-0 divide-y divide-ink-100 border border-ink-200 rounded-xl overflow-hidden bg-white">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none hover:bg-ink-50 transition-colors">
                <span className="text-[14px] font-semibold text-ink-900">{faq.q}</span>
                <span className="text-ink-400 text-[18px] leading-none shrink-0 group-open:rotate-45 transition-transform duration-150">+</span>
              </summary>
              <div className="px-6 pb-5 pt-1 text-[14px] text-ink-600 leading-relaxed border-t border-ink-100">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[14px] text-ink-500 mb-4">Still have questions?</p>
          <a
            href="mailto:hello@merit.app"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-merit-blue-600 border border-merit-blue-200 hover:bg-merit-blue-50 px-5 py-2.5 rounded-lg transition-colors"
          >
            hello@merit.app
          </a>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
