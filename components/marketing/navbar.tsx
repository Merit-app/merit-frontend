'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

type Section = 'students' | 'organizations';

export function MarketingNavbar() {
  const [activeSection, setActiveSection] = useState<Section>('students');
  const reducedMotion = useReducedMotion();

  // Track which section is in view via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as Section);
          }
        }
      },
      // 35% rootMargin from top so the tab flips slightly before the section reaches the navbar
      { threshold: 0, rootMargin: '-35% 0px -55% 0px' },
    );

    const studentEl = document.getElementById('students');
    const orgEl = document.getElementById('organizations');
    if (studentEl) observer.observe(studentEl);
    if (orgEl) observer.observe(orgEl);

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: Section) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isDark = activeSection === 'organizations';

  return (
    <nav
      data-tab={activeSection}
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-500 border-b
        bg-white/70 border-gray-200/60
        data-[tab=organizations]:bg-black/70 data-[tab=organizations]:border-white/10"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          data-tab={activeSection}
          className="font-bold text-xl transition-colors duration-500
            text-gray-900 data-[tab=organizations]:text-white"
        >
          merit.
        </Link>

        {/* Tab switcher (scroll anchors) */}
        <div
          data-tab={activeSection}
          className="relative flex items-center p-1 rounded-full transition-colors duration-500
            bg-gray-100 data-[tab=organizations]:bg-white/10"
        >
          {(['students', 'organizations'] as Section[]).map((t) => {
            const active = activeSection === t;
            return (
              <button
                key={t}
                onClick={() => scrollTo(t)}
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

        {/* Right CTA — morphs with active section */}
        {activeSection === 'students' ? (
          <div className="flex items-center gap-3">
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
          </div>
        ) : (
          <div className="flex items-center gap-3">
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
          </div>
        )}
      </div>
    </nav>
  );
}
