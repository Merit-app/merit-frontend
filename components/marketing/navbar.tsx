'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

type Section = 'students' | 'organizations' | 'schools';

const TABS: { id: Section; label: string; short: string }[] = [
  { id: 'students', label: 'For students', short: 'Students' },
  { id: 'organizations', label: 'For organizations', short: 'Orgs' },
  { id: 'schools', label: 'For schools', short: 'Schools' },
];

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

    for (const tab of TABS) {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    }

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
        bg-background/70 border-border/60
        data-[tab=organizations]:bg-black/70 data-[tab=organizations]:border-white/10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link
          href="/"
          data-tab={activeSection}
          className="font-bold text-xl transition-colors duration-500
            text-foreground data-[tab=organizations]:text-white"
        >
          merit.
        </Link>

        {/* Tab switcher (scroll anchors) */}
        <div
          data-tab={activeSection}
          className="relative flex items-center p-1 rounded-full transition-colors duration-500
            bg-muted data-[tab=organizations]:bg-white/10"
        >
          {TABS.map((t) => {
            const active = activeSection === t.id;
            return (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                className="relative px-2.5 sm:px-3.5 md:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full z-10 whitespace-nowrap"
              >
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    active
                      ? isDark ? 'text-zinc-900' : 'text-background'
                      : isDark ? 'text-zinc-400' : 'text-muted-foreground'
                  }`}
                >
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </span>
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className={`absolute inset-0 rounded-full ${isDark ? 'bg-white' : 'bg-foreground'}`}
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
        {activeSection === 'students' && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-merit-blue-600 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-merit-blue-700 transition-colors whitespace-nowrap shadow-sm"
            >
              Get started
            </Link>
          </div>
        )}
        {activeSection === 'organizations' && (
          <div className="flex items-center gap-3">
            <Link
              href="/org/login"
              className="hidden sm:inline text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/org/create"
              className="bg-white text-zinc-900 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              <span className="sm:hidden">Get started</span>
              <span className="hidden sm:inline">Create your organization</span>
            </Link>
          </div>
        )}
        {activeSection === 'schools' && (
          <div className="flex items-center gap-3">
            <Link
              href="/login?redirect=/chapter/overview"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              School sign in
            </Link>
            <button
              onClick={() => scrollTo('schools')}
              className="bg-merit-blue-600 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-merit-blue-700 transition-colors whitespace-nowrap shadow-sm"
            >
              Get early access
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
