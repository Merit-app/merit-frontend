import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Merit Privacy Policy — How we protect your data and use SMS verification for service hour verification.',
  openGraph: {
    title: 'Merit Privacy Policy',
    description: 'Merit Privacy Policy — How we protect your data and use SMS verification for service hour verification.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink-200 bg-white">
        <Link href="/" className="text-[18px] font-bold text-ink-900 tracking-tight">
          merit<span className="text-merit-blue-600">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-8 py-14">
        <p className="text-[12px] font-semibold text-merit-blue-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-[32px] font-bold text-ink-900 mb-2">Privacy Policy</h1>
        <p className="text-small text-ink-400 mb-10">Last updated: May 2025</p>

        <div className="space-y-8 text-[14px] text-ink-700 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">What we collect</h2>
            <p className="mb-3">When you use Merit, we collect the following information:</p>
            <ul className="list-disc list-inside space-y-1.5 text-ink-600">
              <li>Name, email address, and date of birth</li>
              <li>School name, grade, and graduation year</li>
              <li>Volunteer session records (date, organization, hours, activity)</li>
              <li>Supervisor contact information (name, phone, email)</li>
              <li>Service goal program and hour targets</li>
              <li>Payment information (processed securely by Stripe — we never store card numbers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">Why we collect it</h2>
            <p>We collect this information to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-ink-600 mt-2">
              <li>Verify your volunteer hours with your supervisors</li>
              <li>Generate PDF records for NHS, scholarship, and school requirements</li>
              <li>Track your progress toward your service goal</li>
              <li>Send you account and verification notifications</li>
              <li>Process subscription payments (Pro and Premium plans)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">Where your data is stored</h2>
            <p>Your data is stored in Canada using <strong>Supabase (ca-central-1 region)</strong>. We use industry-standard encryption in transit and at rest. We do not transfer your data outside of Canada except where necessary to deliver transactional emails or SMS (e.g. Resend, Twilio).</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">We never sell your data</h2>
            <p>Merit does not sell, rent, or share your personal information with third parties for marketing purposes. Ever. Your data is used only to operate the Merit service.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">Your rights</h2>
            <p className="mb-3">You have full control over your data:</p>
            <ul className="list-disc list-inside space-y-1.5 text-ink-600">
              <li><strong>Export:</strong> Download all your data in JSON format at any time from Settings → Account.</li>
              <li><strong>Delete:</strong> Schedule your account for permanent deletion from Settings → Account. Deletion completes within 30 days.</li>
              <li><strong>Correct:</strong> Update your profile information at any time from Settings → Profile.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">Minors</h2>
            <p>If you are between 13 and 17, we require parental or guardian consent before creating your account. We collect a parent or guardian email address and send a consent notification. We do not knowingly collect data from children under 13.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">Contact</h2>
            <p>For privacy questions or data requests, contact us at <a href="mailto:privacy@merit.app" className="text-merit-blue-600 hover:underline">privacy@merit.app</a>.</p>
          </section>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
