import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingNav } from '@/components/marketing/nav';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <MarketingNav />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-8 py-14">
        <p className="text-[12px] font-semibold text-merit-blue-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-[32px] font-bold text-ink-900 mb-2">Terms of Service</h1>
        <p className="text-small text-ink-400 mb-10">Last updated: May 2025</p>

        <div className="space-y-8 text-[14px] text-ink-700 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">1. About Merit</h2>
            <p>Merit is a volunteer hour tracking tool designed for high school students. It helps you log service sessions, have them verified by your supervisor, and generate PDF records for scholarship and graduation requirements.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">2. Eligibility</h2>
            <p>You must be at least 13 years old to create a Merit account. If you are between 13 and 17, parental or guardian consent is required. By creating an account, you confirm that you meet this requirement.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">3. Accuracy of Hours</h2>
            <p>Hours logged on Merit must be accurate and truthful. You agree not to log hours for sessions that did not occur, inflate time spent, or submit false supervisor information. Merit may suspend accounts found to be submitting inaccurate records.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">4. Verification Disputes</h2>
            <p>Merit facilitates supervisor verification via SMS and email. Merit is not responsible for supervisors who do not respond, disputes between you and your supervisor, or decisions made by your school or scholarship committee based on your records.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">5. Account Termination</h2>
            <p>Merit reserves the right to suspend or terminate accounts at any time for abuse, fraudulent activity, or violation of these terms. You may also delete your account at any time from Settings → Account.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">6. Data Storage</h2>
            <p>Your data is stored securely in Canada using Supabase (ca-central-1 region). We take reasonable precautions to protect your information. See our <Link href="/privacy" className="text-merit-blue-600 hover:underline">Privacy Policy</Link> for details.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">7. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of Merit after changes are posted constitutes acceptance of the new terms. We will notify active users of material changes by email.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-ink-900 mb-3">8. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:hello@merit.app" className="text-merit-blue-600 hover:underline">hello@merit.app</a>.</p>
          </section>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
