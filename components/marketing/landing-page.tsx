'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLandingTab } from '@/lib/use-landing-tab';
import { MarketingNavbar } from './navbar';
import { StudentSection } from './student-section';
import { OrgSection } from './org-section';
import Link from 'next/link';

const EASE_APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function LandingPage() {
  const { tab } = useLandingTab();
  const reducedMotion = useReducedMotion();
  const isDark = tab === 'organizations';

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAF9]'
      }`}
    >
      <MarketingNavbar />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={
            reducedMotion ? { duration: 0 } : { duration: 0.4, ease: EASE_APPLE }
          }
        >
          {tab === 'students' ? <StudentSection /> : <OrgSection />}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <footer
        className={`border-t py-8 px-6 transition-colors duration-700 ${
          isDark ? 'border-white/5' : 'border-gray-100'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            merit. {isDark ? 'for organizations' : 'Volunteer hours you can prove.'}
          </p>
          <div className={`flex gap-6 text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            <Link href="/pricing" className="hover:text-current">Pricing</Link>
            <Link href="/faq" className="hover:text-current">FAQ</Link>
            <Link href="/terms" className="hover:text-current">Terms</Link>
            <Link href="/privacy" className="hover:text-current">Privacy</Link>
            <a href="mailto:hello@meritco.app" className="hover:text-current">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
