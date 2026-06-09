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
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="font-bold text-xl text-foreground">merit.</a>
          <span className="text-muted-foreground text-sm font-medium px-2 py-0.5 rounded border border-border">
            for organizations
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Student login
          </a>
          <Link
            href="/org/login"
            className="bg-foreground text-background text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-card/5 border border-white/10 text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Built for nonprofits and volunteer coordinators
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
          Your volunteer program,
          <br />
          <span className="text-muted-foreground">finally organized.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Manage volunteers, run events, send announcements, and generate grant reports — all from one dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/org/create"
            className="bg-foreground text-background font-semibold px-8 py-4 rounded-xl text-lg hover:bg-muted transition-colors flex items-center gap-2"
          >
            Create your organization
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/org/login"
            className="text-muted-foreground font-medium px-8 py-4 rounded-xl text-lg border border-border hover:bg-card transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-muted-foreground text-sm mt-4">
          Invited to join an org?{' '}
          <Link href="/org/join" className="text-muted-foreground hover:text-foreground underline">
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
              className="bg-card border border-border rounded-2xl p-6 hover:border-border transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-card/5 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-2">{f.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-20 px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How it works</h2>
          <div className="space-y-4">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-6 p-5 bg-card rounded-2xl border border-border">
                <span className="text-muted-foreground font-mono font-bold text-lg shrink-0 mt-0.5">{item.step}</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-8 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">merit. for organizations</p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-muted-foreground">Student app</a>
          <a href="/terms" className="hover:text-muted-foreground">Terms</a>
          <a href="/privacy" className="hover:text-muted-foreground">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
