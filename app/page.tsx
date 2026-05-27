import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ShieldCheck, FileText, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Merit — Volunteer hours you can prove',
  description: 'Track, verify, and export your volunteer hours with SMS verification. Built for NHS, IB, college apps, and graduation requirements.',
  openGraph: {
    title: 'Merit — Volunteer hours you can prove',
    description: 'Track, verify, and export your volunteer hours with SMS verification. Built for NHS, IB, college apps, and graduation requirements.',
    type: 'website',
    url: 'https://merit-frontend-nine.vercel.app',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Merit — Volunteer hours you can prove',
    }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'SMS-verified hours',
    body: "Text your supervisor's number. They reply YES. Your hour is verified — no paperwork, no chasing emails.",
  },
  {
    icon: Clock,
    title: 'Track every session',
    body: 'Log the date, organization, activity, and duration in under a minute. Every session is timestamped and stored.',
  },
  {
    icon: FileText,
    title: 'Export a signed PDF',
    body: 'Generate a clean, credentialed PDF of your record whenever you need it — NHS submissions, scholarships, applications.',
  },
  {
    icon: CheckCircle,
    title: 'NHS-ready by design',
    body: "Merit tracks verified vs. pending hours separately so you always know exactly where you stand against your chapter's goal.",
  },
];

const SOCIAL_PROOF = [
  { name: 'Maya T.', school: 'Burnaby North Secondary', quote: 'I used to keep a spreadsheet. Merit replaced it in a week.' },
  { name: 'Jordan K.', school: 'Eric Hamber Secondary', quote: 'My NHS advisor asked me to recommend this to the whole chapter.' },
  { name: 'Priya S.', school: 'Lord Byng Secondary', quote: 'The PDF export is exactly what UBC wanted for my scholarship application.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ink-200 bg-white">
        <span className="text-[18px] font-bold text-ink-900 tracking-tight">
          merit<span className="text-merit-blue-600">.</span>
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/about" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">
            About
          </Link>
          <Link href="/pricing" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">
            Pricing
          </Link>
          <Link href="/faq" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">
            Contact
          </Link>
          <Link href="/login" className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-20 pb-16 text-center">
        <p className="text-[12px] font-semibold text-merit-blue-600 uppercase tracking-widest mb-4">
          For high school students
        </p>
        <h1 className="text-[40px] font-bold text-ink-900 leading-tight tracking-tight mb-5">
          Service hours you can actually prove.
        </h1>
        <p className="text-[16px] text-ink-500 leading-relaxed mb-8 max-w-xl mx-auto">
          Merit logs your volunteer sessions, verifies them with your supervisor by SMS, and generates a signed PDF record — ready for NHS, scholarships, and college apps.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/signup"
            className="text-[14px] font-semibold text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-6 py-3 rounded-lg transition-colors"
          >
            Start tracking for free
          </Link>
          <Link
            href="/login"
            className="text-[14px] font-medium text-ink-600 hover:text-ink-900 border border-ink-200 bg-white hover:bg-ink-50 px-6 py-3 rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-[12px] text-ink-400 mt-4">No credit card. No app download. Works in your browser.</p>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-8 pb-16">
        <div className="rounded-3xl bg-white border border-ink-200 p-8 mb-10">
          <p className="text-[12px] font-semibold text-merit-blue-600 uppercase tracking-widest mb-4 text-center">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-ink-200 p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-merit-blue-50 flex items-center justify-center text-merit-blue-600 text-xl">1</div>
              <h3 className="text-[15px] font-semibold text-ink-900 mb-2">Log your hours</h3>
              <p className="text-[13px] text-ink-500">Fill out a quick form with your session details, organization, and supervisor.</p>
            </div>
            <div className="rounded-2xl border border-ink-200 p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-merit-blue-50 flex items-center justify-center text-merit-blue-600 text-xl">2</div>
              <h3 className="text-[15px] font-semibold text-ink-900 mb-2">Supervisor verifies</h3>
              <p className="text-[13px] text-ink-500">Your supervisor receives a text and confirms your session with one reply.</p>
            </div>
            <div className="rounded-2xl border border-ink-200 p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-merit-blue-50 flex items-center justify-center text-merit-blue-600 text-xl">3</div>
              <h3 className="text-[15px] font-semibold text-ink-900 mb-2">Download PDF</h3>
              <p className="text-[13px] text-ink-500">Export a verified PDF record for NHS, scholarships, and college applications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-3xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-xl border border-ink-200 p-6">
              <div className="flex items-center gap-2.5 mb-3">
                <Icon size={16} className="text-merit-blue-600 shrink-0" />
                <p className="text-[14px] font-semibold text-ink-900">{title}</p>
              </div>
              <p className="text-[13px] text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-ink-200 bg-white">
        <div className="max-w-3xl mx-auto px-8 py-16">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-widest text-center mb-8">
            What students say
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SOCIAL_PROOF.map(({ name, school, quote }) => (
              <div key={name} className="rounded-xl border border-ink-200 p-5">
                <p className="text-[13px] text-ink-700 leading-relaxed mb-4">
                  &ldquo;{quote}&rdquo;
                </p>
                <div>
                  <p className="text-[12px] font-semibold text-ink-900">{name}</p>
                  <p className="text-[11px] text-ink-400">{school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-merit-blue-600">
        <div className="max-w-3xl mx-auto px-8 py-14 text-center">
          <h2 className="text-[26px] font-bold text-white mb-3">
            Your NHS advisor will notice the difference.
          </h2>
          <p className="text-[14px] text-merit-blue-100 mb-6">
            Stop tracking hours in a spreadsheet. Start with Merit today — it takes two minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex text-[14px] font-semibold text-merit-blue-600 bg-white hover:bg-merit-blue-50 px-6 py-3 rounded-lg transition-colors"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-white">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12px] text-ink-400">
            <span>
              merit<span className="text-merit-blue-600">.</span>
              {' '}— Service hour tracking for students
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/about" className="hover:text-ink-700 transition-colors">About</Link>
              <Link href="/contact" className="hover:text-ink-700 transition-colors">Contact</Link>
              <Link href="/pricing" className="hover:text-ink-700 transition-colors">Pricing</Link>
              <Link href="/faq" className="hover:text-ink-700 transition-colors">FAQ</Link>
              <Link href="/terms" className="hover:text-ink-700 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-ink-700 transition-colors">Privacy</Link>
              <Link href="/login" className="hover:text-ink-700 transition-colors">Sign in</Link>
              <a href="mailto:hello@merit.app" className="hover:text-ink-700 transition-colors">hello@merit.app</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
