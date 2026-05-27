import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'About Merit',
  description: 'About Merit — Built for students by students to make volunteer hours verifiable and shareable.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink-200 bg-white">
        <Link href="/" className="text-[18px] font-bold text-ink-900 tracking-tight">
          merit<span className="text-merit-blue-600">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">Pricing</Link>
          <Link href="/faq" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">FAQ</Link>
          <Link href="/login" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">Sign in</Link>
          <Link href="/signup" className="text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-[44px] font-bold text-ink-900 leading-tight mb-4">
          Built for students, by students
        </h1>
        <p className="text-[18px] text-ink-600 mb-8">
          Merit makes it simple to track, verify, and prove your volunteer hours.
        </p>
      </section>

      {/* The Problem */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-[28px] font-bold text-ink-900 mb-6">The Problem</h2>
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <p className="text-[16px] text-ink-700 leading-relaxed mb-4">
            Volunteer hours are hard to prove. You log them in spreadsheets, email them to supervisors, and hope they get verified before the deadline. Hours get lost, supervisors forget to confirm, and you're left scrambling to re-create records for:
          </p>
          <ul className="space-y-2 text-[16px] text-ink-700">
            <li>🏥 NHS (National Honor Society) — requires 75+ verified hours</li>
            <li>📚 IB CAS (Creativity, Activity, Service) — needs documented proof</li>
            <li>🎓 College applications — admissions officers want credible evidence</li>
            <li>👨‍🎓 Graduation requirements — schools mandate verifiable service records</li>
          </ul>
        </div>
      </section>

      {/* The Solution */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-[28px] font-bold text-ink-900 mb-6">The Solution</h2>
        <div className="bg-white rounded-xl border border-ink-200 p-8">
          <p className="text-[16px] text-ink-700 leading-relaxed mb-6">
            Merit replaces spreadsheets with a simple, verifiable system:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-semibold text-ink-900 mb-2">📝 Log in seconds</h3>
              <p className="text-[14px] text-ink-600">Fill out what you did, when, and who to verify it. Merit does the rest.</p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink-900 mb-2">✓ SMS verification</h3>
              <p className="text-[14px] text-ink-600">Your supervisor gets a text. They reply YES or NO. Hours are instantly verified or disputed.</p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink-900 mb-2">📄 Export to PDF</h3>
              <p className="text-[14px] text-ink-600">Download a beautiful, official-looking PDF with all your verified hours. Ready for applications, scholarships, and requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-[28px] font-bold text-ink-900 mb-8 text-center">Built by students who needed it</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-ink-200 p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-merit-blue-100 flex items-center justify-center">
              <span className="text-[40px]">👤</span>
            </div>
            <h3 className="text-[16px] font-semibold text-ink-900 mb-1">Founder 1</h3>
            <p className="text-[13px] text-ink-500 mb-3">Co-founder & Product</p>
            <p className="text-[13px] text-ink-600">High school senior building tools for students like them.</p>
          </div>
          <div className="bg-white rounded-xl border border-ink-200 p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-merit-blue-100 flex items-center justify-center">
              <span className="text-[40px]">👤</span>
            </div>
            <h3 className="text-[16px] font-semibold text-ink-900 mb-1">Founder 2</h3>
            <p className="text-[13px] text-ink-500 mb-3">Co-founder & Engineering</p>
            <p className="text-[13px] text-ink-600">Student passionate about building scalable, user-focused products.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center max-w-2xl mx-auto">
        <h2 className="text-[28px] font-bold text-ink-900 mb-4">Ready to get started?</h2>
        <p className="text-[16px] text-ink-600 mb-8">
          Join thousands of students proving their hours with Merit.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="px-8 py-3 bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Get started free
          </Link>
          <Link 
            href="/pricing" 
            className="px-8 py-3 border border-ink-200 hover:bg-ink-50 text-ink-900 font-medium rounded-lg transition-colors"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
