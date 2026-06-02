import Link from 'next/link';
import { Users, BarChart3, Calendar, Award, MessageSquare, FileText, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Volunteer management',
    desc: 'See all your volunteers in one place. Track hours, activity, and engagement.',
  },
  {
    icon: Calendar,
    title: 'Event & shift scheduling',
    desc: 'Create volunteer shifts, manage signups, and check in volunteers on the day.',
  },
  {
    icon: MessageSquare,
    title: 'Bulk messaging',
    desc: 'Send SMS announcements to all your volunteers or specific groups instantly.',
  },
  {
    icon: BarChart3,
    title: 'Grant reports',
    desc: 'Generate professional impact reports for grant applications in one click.',
  },
  {
    icon: Award,
    title: 'Volunteer certificates',
    desc: 'Issue personalized recognition letters for student college applications.',
  },
  {
    icon: FileText,
    title: 'Verified hours',
    desc: 'Every session is SMS-verified. Your data is trustworthy for funders.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Claim or create your org page',
    desc: "Find your organization in Merit's directory and claim it, or create a new one.",
  },
  {
    step: '02',
    title: 'Invite your team',
    desc: 'Add co-chairs, coordinators, and supervisors by email. Each person gets their own login.',
  },
  {
    step: '03',
    title: 'Students log their own hours',
    desc: 'Volunteers track sessions in the Merit student app. You verify with one tap.',
  },
  {
    step: '04',
    title: 'Run events and reports',
    desc: 'Create shifts, send SMS announcements, and generate grant reports whenever you need them.',
  },
];

export default function OrgLandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="font-bold text-xl text-white">merit.</a>
          <span className="text-gray-600 text-sm font-medium px-2 py-0.5 rounded border border-gray-700">
            for organizations
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            Student login
          </a>
          <Link
            href="/org/login"
            className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Built for nonprofits and volunteer coordinators
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
          Your volunteer program,
          <br />
          <span className="text-gray-400">finally organized.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Manage volunteers, run events, send announcements, and generate grant reports — all from one dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/org/login"
            className="bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            Sign in to your organization
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          Invited to join an org?{' '}
          <Link href="/org/join" className="text-gray-400 hover:text-white underline">
            Accept your invitation
          </Link>
        </p>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-white mb-2">{f.title}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-800 py-20 px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How it works</h2>
          <div className="space-y-4">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-6 p-5 bg-gray-900 rounded-2xl border border-gray-800">
                <span className="text-gray-600 font-mono font-bold text-lg shrink-0 mt-0.5">{item.step}</span>
                <div>
                  <p className="font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-8 flex items-center justify-between">
        <p className="text-gray-600 text-sm">merit. for organizations</p>
        <div className="flex gap-6 text-sm text-gray-600">
          <a href="/" className="hover:text-gray-400">Student app</a>
          <a href="/terms" className="hover:text-gray-400">Terms</a>
          <a href="/privacy" className="hover:text-gray-400">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
