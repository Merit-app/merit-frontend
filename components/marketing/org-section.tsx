'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Users, Calendar, MessageSquare, BarChart3, Award, FileText,
} from 'lucide-react';
import { OrgDemo } from './org-demo';

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

const FEATURES = [
  { icon: Users, title: 'Volunteer management', desc: 'See every volunteer, every session, every hour. Search, filter, export.' },
  { icon: Calendar, title: 'Events & shifts', desc: 'Create volunteer shifts in 30 seconds. Auto-text everyone. Check in arrivals on the day.' },
  { icon: MessageSquare, title: 'Bulk SMS', desc: 'Send announcements to all volunteers, event attendees, or active groups.' },
  { icon: BarChart3, title: 'Grant reports', desc: 'Generate professional impact PDFs in one click. Ready for grant committees.' },
  { icon: Award, title: 'Certificates', desc: "Issue personalized recognition letters for volunteers' college applications." },
  { icon: FileText, title: 'Verified hours', desc: 'Every session SMS-verified. Funders trust your data because they should.' },
];

export function OrgSection() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-6 pt-20 pb-32"
    >
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Built for nonprofits and volunteer coordinators
        </motion.div>

        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6"
        >
          Your volunteer program,
          <br />
          <span className="text-gray-500">finally organized.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Manage volunteers, run events, send announcements, and generate grant reports — all from
          one dashboard. Students log hours themselves. You just verify.
        </motion.p>

        <motion.div variants={item} className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/org/login"
            className="bg-white text-black font-semibold px-7 py-3.5 rounded-full text-base hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm"
          >
            Sign in to your organization
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/org/join"
            className="text-gray-400 font-medium px-7 py-3.5 rounded-full text-base hover:bg-white/5 transition-colors"
          >
            Accept an invitation
          </Link>
        </motion.div>

        <motion.p variants={item} className="text-xs text-gray-600 mt-4">
          Claim your org page free. No setup fee.
        </motion.p>
      </div>

      {/* Demo */}
      <motion.div variants={item}>
        <OrgDemo />
      </motion.div>

      {/* Features */}
      <motion.div variants={item} className="mt-32 mb-16 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Everything you need
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          One dashboard.
          <br />
          <span className="text-gray-500">All your volunteer ops.</span>
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={item}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="bg-[#131313] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-white mb-2">{f.title}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div variants={item} className="mt-32 text-center max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to organize your volunteer program?
        </h2>
        <p className="text-gray-400 mb-8">It takes 2 minutes to claim your org. Free for nonprofits.</p>
        <Link
          href="/org"
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
        >
          Get started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </motion.section>
  );
}
