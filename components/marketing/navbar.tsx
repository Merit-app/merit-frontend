'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useLandingTab, type LandingTab } from '@/lib/use-landing-tab';

export function MarketingNavbar() {
  const { tab, setTab } = useLandingTab();
  const reducedMotion = useReducedMotion();
  const isDark = tab === 'organizations';

  return (
    <nav
      data-tab={tab}
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-500 border-b
        bg-white/70 border-gray-200/60
        data-[tab=organizations]:bg-black/70 data-[tab=organizations]:border-white/10"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          data-tab={tab}
          className="font-bold text-xl transition-colors duration-500
            text-gray-900 data-[tab=organizations]:text-white"
        >
          merit.
        </Link>

        {/* Tab switcher */}
        <div
          data-tab={tab}
          className="relative flex items-center p-1 rounded-full transition-colors duration-500
            bg-gray-100 data-[tab=organizations]:bg-white/10"
        >
          {(['students', 'organizations'] as LandingTab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative px-4 sm:px-5 py-1.5 text-sm font-medium rounded-full z-10"
              >
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    active
                      ? isDark ? 'text-black' : 'text-white'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t === 'students' ? 'For students' : 'For organizations'}
                </span>
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className={`absolute inset-0 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 300, damping: 30 }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* CTA — morphs by tab */}
        <AnimatePresence mode="wait" initial={false}>
          {tab === 'students' ? (
            <motion.div
              key="student-cta"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/login"
                className="hidden sm:inline text-sm text-gray-600 hover:text-black transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                Get started
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="org-cta"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/org/login"
                className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/org"
                className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                Learn more
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
