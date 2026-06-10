'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StudentDemo } from './student-demo';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion';

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

export function StudentSection() {
  return (
    <div className="relative">
      {/* Soft gradient-mesh backdrop — very restrained */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-merit-blue-500/10 blur-3xl" />
        <div className="absolute left-[12%] top-[40px] h-[300px] w-[300px] rounded-full bg-violet-500/[0.07] blur-3xl" />
        <div className="absolute right-[8%] top-[90px] h-[320px] w-[360px] rounded-full bg-cyan-400/[0.07] blur-3xl" />
      </div>

      <motion.section
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-32"
      >
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Trusted by students across BC
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.05] mb-6"
          >
            Service hours
            <br />
            <span className="bg-gradient-to-r from-merit-blue-600 via-violet-500 to-merit-blue-500 bg-clip-text text-transparent">
              you can actually prove.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Log volunteer hours, get them verified by SMS, and export beautiful signed PDFs for
            college applications and graduation requirements.
          </motion.p>

          <motion.div variants={item} className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="bg-merit-blue-600 text-white font-semibold px-7 py-3.5 rounded-full text-base hover:bg-merit-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-merit-blue-600/20 hover:shadow-xl hover:shadow-merit-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-foreground font-medium px-7 py-3.5 rounded-full text-base hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.p variants={item} className="text-xs text-muted-foreground mt-4">
            Free forever for students. No credit card.
          </motion.p>
        </div>

        {/* Demo */}
        <motion.div variants={item}>
          <StudentDemo />
        </motion.div>

        {/* Stats strip */}
        <RevealGroup className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
          {[
            { value: '2 min', label: 'Average time to log a session' },
            { value: '< 30s', label: 'Average supervisor response' },
            { value: '100%', label: 'PDF accepted rate' },
            { value: 'Free', label: 'For every student' },
          ].map((stat) => (
            <RevealItem key={stat.label}>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Testimonials */}
        <div className="mt-32 max-w-4xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase text-center mb-12">
              From students who&apos;ve used it
            </p>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <RevealItem
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <p className="text-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-8 h-8 rounded-full bg-merit-blue-50 flex items-center justify-center text-xs font-bold text-merit-blue-600">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.school} · {t.grade}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Final CTA */}
        <Reveal className="mt-32 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            Your advisor will notice the difference.
          </h2>
          <p className="text-muted-foreground mb-8">Stop tracking hours in a spreadsheet.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-merit-blue-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-merit-blue-700 transition-all shadow-lg shadow-merit-blue-600/20 hover:shadow-xl hover:shadow-merit-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Create your free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </motion.section>
    </div>
  );
}
