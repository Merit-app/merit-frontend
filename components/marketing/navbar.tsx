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
  // Which audience tab is active (drives the sliding indicator + CTA).
  const [activeSection, setActiveSection] = useState<Section>('students');
  // Whether the band currently under the navbar is dark — decoupled from the
  // tab, because the dark hero and the light student-proof band share the
  // 'students' tab.
  const [dark, setDark] = useState(true);
  const reducedMotion = useReducedMotion();

  // Track which audience section is in view for the tab indicator.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as Section);
          }
        }
      },
      { threshold: 0, rootMargin: '-35% 0px -55% 0px' },
    );

    for (const tab of TABS) {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Track the theme of the band sitting directly under the navbar. A thin
  // detection strip just below the navbar decides which band is "under" it.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDark(entry.target.getAttribute('data-theme') === 'dark');
          }
        }
      },
      { threshold: 0, rootMargin: '-64px 0px -80% 0px' },
    );

    const bands = document.querySelectorAll('[data-theme]');
    bands.forEach((b) => observer.observe(b));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: Section) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      data-dark={dark}
      className="sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500
        data-[dark=false]:border-border/60 data-[dark=false]:bg-background/70
        data-[dark=true]:border-white/10 data-[dark=true]:bg-black/70"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-1.5 px-3 sm:h-16 sm:gap-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className={`text-lg font-bold transition-colors duration-500 sm:text-xl ${
            dark ? 'text-white' : 'text-foreground'
          }`}
        >
          merit.
        </Link>

        {/* Tab switcher (scroll anchors) */}
        <div
          className={`relative flex items-center rounded-full p-1 transition-colors duration-500 ${
            dark ? 'bg-white/10' : 'bg-muted'
          }`}
        >
          {TABS.map((t) => {
            const active = activeSection === t.id;
            return (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                className="relative z-10 whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-medium sm:px-3.5 sm:text-sm md:px-4"
              >
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    active
                      ? dark ? 'text-zinc-900' : 'text-background'
                      : dark ? 'text-zinc-400' : 'text-muted-foreground'
                  }`}
                >
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </span>
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className={`absolute inset-0 rounded-full ${dark ? 'bg-white' : 'bg-foreground'}`}
                    transition={
                      reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right CTA — morphs with active section; colors follow the band theme */}
        {activeSection === 'students' && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`hidden text-sm transition-colors sm:inline ${
                dark ? 'text-zinc-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-full bg-merit-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-merit-blue-700 sm:px-4 sm:text-sm"
            >
              Get started
            </Link>
          </div>
        )}
        {activeSection === 'organizations' && (
          <div className="flex items-center gap-3">
            <Link
              href="/org/login"
              className={`hidden text-sm transition-colors sm:inline ${
                dark ? 'text-zinc-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/org/create"
              className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 sm:px-4 sm:text-sm"
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
              className={`hidden text-sm transition-colors sm:inline ${
                dark ? 'text-zinc-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              School sign in
            </Link>
            <button
              onClick={() => scrollTo('schools')}
              className="whitespace-nowrap rounded-full bg-merit-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-merit-blue-700 sm:px-4 sm:text-sm"
            >
              Get early access
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
