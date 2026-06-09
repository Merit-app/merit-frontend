'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StudentDemo } from './student-demo';

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
    <motion.section
      variants={container}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-32"
    >
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 bg-muted text-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Trusted by students across BC
        </motion.div>

        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-6"
        >
          Service hours
          <br />
          <span className="text-muted-foreground">you can actually prove.</span>
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
            className="bg-black text-white font-semibold px-7 py-3.5 rounded-full text-base hover:bg-muted transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
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
      <motion.div
        variants={item}
        className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto"
      >
        {[
          { value: '2 min', label: 'Average time to log a session' },
          { value: '< 30s', label: 'Average supervisor response' },
          { value: '100%', label: 'PDF accepted rate' },
          { value: 'Free', label: 'For every student' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <motion.div variants={item} className="mt-32 max-w-4xl mx-auto">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase text-center mb-12">
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
              <p className="text-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.school} · {t.grade}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div variants={item} className="mt-32 text-center max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Your advisor will notice the difference.
        </h2>
        <p className="text-muted-foreground mb-8">Stop tracking hours in a spreadsheet.</p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-black text-white font-semibold px-8 py-4 rounded-full hover:bg-muted transition-colors shadow-lg"
        >
          Create your free account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </motion.section>
  );
}
