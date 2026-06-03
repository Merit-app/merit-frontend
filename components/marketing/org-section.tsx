'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Users, BarChart3, CheckCircle2, Building2 } from 'lucide-react';
import { OrgShowcase } from './org-showcase';

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

const STEPS = [
  {
    step: '01',
    title: 'Volunteers log their own hours',
    desc: 'Students use the Merit app to log sessions. You see every pending session in your dashboard — no chasing spreadsheets.',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    step: '02',
    title: 'You verify in one click',
    desc: 'See every pending session. Click Verify. The student gets notified instantly and their PDF updates. No emails. No paper.',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    step: '03',
    title: 'Run events, get grant reports',
    desc: 'Create volunteer shifts, check in arrivals, send bulk SMS, and generate professional grant impact reports in one click.',
    icon: BarChart3,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
];

export function OrgSection() {
  return (
    <div className="bg-[#0A0A0A] text-white">
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="max-w-6xl mx-auto px-6 pt-32 pb-32"
      >
        {/* Section hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
          >
            <Building2 className="w-3.5 h-3.5" />
            Merit for organizations
          </motion.div>

          <motion.h2
            variants={item}
            className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-6"
          >
            Your volunteer program,
            <br />
            <span className="text-gray-500">finally organized.</span>
          </motion.h2>

          <motion.p
            variants={item}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Manage volunteers, run events, send announcements, and generate grant reports — all
            from one dashboard. Students log hours themselves. You just verify.
          </motion.p>

          <motion.div variants={item} className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/org/login"
              className="bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm"
            >
              Sign in to your organization
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/org"
              className="text-gray-400 font-medium px-7 py-3.5 rounded-full hover:bg-white/5 transition-colors"
            >
              Learn more
            </Link>
          </motion.div>
        </div>

        {/* Notion-style laptop feature showcase */}
        <motion.div variants={item}>
          <OrgShowcase />
        </motion.div>

        {/* 3-step user journey cards */}
        <motion.div
          variants={container}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {STEPS.map((s) => (
            <motion.div
              key={s.step}
              variants={item}
              className="bg-[#131313] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-600 font-mono font-bold text-sm">{s.step}</span>
                <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="font-bold text-white text-lg mb-2">{s.title}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Cross-promo: explain to students seeing the page */}
        <motion.div
          variants={item}
          className="mt-32 bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-2xl mx-auto"
        >
          <p className="text-gray-400 text-sm mb-1">Already using Merit as a student?</p>
          <p className="text-white font-semibold text-lg mb-2">
            This is what your supervisors see.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            When you submit a session, it appears in your organization&apos;s dashboard. One tap from
            them and you&apos;re verified.
          </p>
          <Link
            href="/signup"
            className="text-sm text-white font-medium underline hover:text-gray-300 transition-colors"
          >
            Start tracking your hours →
          </Link>
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="mt-24 text-center max-w-2xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to organize your volunteer program?
          </h3>
          <p className="text-gray-400 mb-8">
            Claim your org page in 2 minutes. Free for nonprofits.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/org/login"
              className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
            >
              Sign in to your org
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/organizations"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Browse organizations
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
