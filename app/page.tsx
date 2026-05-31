import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, FileText } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { FeatureExplorer } from '@/components/marketing/feature-explorer';

export const metadata: Metadata = buildMetadata({
  title: 'Student Volunteer Hour Tracker',
  description:
    'The easiest way to track volunteer hours, get verified by SMS, ' +
    'and export a signed PDF. Free for students.',
  path: '/',
});

// ── Top nav ───────────────────────────────────────────────────────────────────

function TopNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
          merit.
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="/faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Hero app mockup ───────────────────────────────────────────────────────────

function AppMockup() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden bg-white">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-400 text-center">
            meritco.app/dashboard
          </div>
        </div>

        <div className="flex h-64 overflow-hidden">
          <div className="w-36 border-r border-gray-100 bg-gray-50 p-3 flex flex-col gap-1 shrink-0">
            <div className="text-xs font-bold text-gray-800 px-2 mb-2">merit.</div>
            {[
              { label: 'Dashboard', active: true },
              { label: 'Sessions' },
              { label: 'Organizations' },
              { label: 'Badges' },
              { label: 'Export' },
            ].map((item) => (
              <div
                key={item.label}
                className={`text-xs px-2 py-1.5 rounded-md ${
                  item.active ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-hidden">
            <p className="text-xs font-semibold text-gray-800">Dashboard</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Verified', value: '47h' },
                { label: 'Sessions', value: '12' },
                { label: 'Orgs', value: '4' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {[
                { org: 'Vancouver Rotary', hrs: '4h', status: 'verified' },
                { org: 'BC Youth Council', hrs: '3h', status: 'pending' },
                { org: 'Red Cross', hrs: '6h', status: 'verified' },
              ].map((session) => (
                <div
                  key={session.org}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-2.5 py-2"
                >
                  <p className="text-xs font-medium text-gray-800">{session.org}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{session.hrs}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        session.status === 'verified'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-6 bg-white rounded-xl border border-gray-200 shadow-lg p-3 flex items-center gap-3 max-w-[200px]">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">Session verified</p>
          <p className="text-xs text-gray-400">Supervisor replied YES</p>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 bg-white rounded-xl border border-gray-200 shadow-lg p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">PDF exported</p>
          <p className="text-xs text-gray-400">47 verified hours</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">
      <TopNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Free for students
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05]">
              Service hours you can actually prove.
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-md">
              Log hours, get verified by SMS, export a signed PDF. Takes two minutes.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="bg-gray-900 text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-700 transition-colors shadow-sm"
              >
                Start for free
              </Link>
              <a
                href="#how-it-works"
                className="text-sm text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1.5"
              >
                See how it works
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {['KN', 'SR', 'JP', 'ML'].map((init) => (
                  <div
                    key={init}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Trusted by students at
                <span className="font-medium text-gray-700">
                  {' '}Burnaby South, Eric Hamber, Lord Byng
                </span>
              </p>
            </div>
          </div>

          <div className="relative">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* Feature explorer (client component) */}
      <FeatureExplorer />

      {/* Stats strip */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2 min', label: 'Average time to log a session' },
              { value: '< 30s', label: 'Average supervisor response' },
              { value: '100%', label: 'PDF accepted rate' },
              { value: 'Free', label: 'For every student' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase text-center mb-14">
          From students who&apos;ve used it
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote:
                'My NHS advisor asked me what I was using. She wants to recommend it to the whole chapter.',
              name: 'Jordan K.',
              school: 'Eric Hamber Secondary',
              grade: 'Grade 12',
            },
            {
              quote:
                "I've been using a spreadsheet for two years. I switched to Merit in one afternoon.",
              name: 'Maya T.',
              school: 'Burnaby North Secondary',
              grade: 'Grade 11',
            },
            {
              quote:
                'The PDF has a QR code. My scholarship committee scanned it on the spot.',
              name: 'Priya S.',
              school: 'Lord Byng Secondary',
              grade: 'Grade 12',
            },
          ].map((t) => (
            <div key={t.name} className="space-y-4">
              <p className="text-gray-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">
                    {t.school} · {t.grade}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your advisor will notice the difference.
          </h2>
          <p className="text-gray-400 text-lg">Stop tracking hours in a spreadsheet.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-gray-900 font-semibold text-lg px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create your free account
          </Link>
          <p className="text-xs text-gray-500">
            No credit card. No app download. Works in your browser.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold">merit.</span>
            <span className="text-sm text-gray-400">Volunteer hours you can prove.</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <Link href="/pricing" className="hover:text-gray-700">Pricing</Link>
            <Link href="/faq" className="hover:text-gray-700">FAQ</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
            <a href="mailto:hello@meritco.app" className="hover:text-gray-700">Contact</a>
          </div>
          <p className="text-xs text-gray-400">Built in Vancouver, BC</p>
        </div>
      </footer>
    </div>
  );
}
