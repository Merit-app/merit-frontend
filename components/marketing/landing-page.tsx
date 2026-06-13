'use client';

import Link from 'next/link';
import { MarketingNavbar } from './navbar';
import { HeroSection, StudentProofSection } from './student-section';
import { OrgSection } from './org-section';
import { SchoolSection } from './school-section';
import { DARK_BAND } from './_primitives';

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <MarketingNavbar />

      {/* Band rhythm — dark → light → dark → light → dark (Stripe-style). Each
          band carries its own id + data-theme (set by <Section>) so the navbar
          can track which band sits under it. */}
      <HeroSection />
      <StudentProofSection />
      <OrgSection />
      <SchoolSection />

      {/* Shared footer — always dark; data-theme keeps the navbar dark over it */}
      <footer data-theme="dark" className="border-t border-white/5 px-6 py-12" style={{ backgroundColor: DARK_BAND }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold text-white">merit.</p>
            <p className="mt-1 text-sm text-zinc-400">Volunteer hours you can prove.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</p>
              <Link href="/pricing" className="block text-zinc-400 transition-colors hover:text-white">Pricing</Link>
              <Link href="/organizations" className="block text-zinc-400 transition-colors hover:text-white">Organizations</Link>
              <Link href="/scholarships" className="block text-zinc-400 transition-colors hover:text-white">Scholarships</Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Support</p>
              <Link href="/faq" className="block text-zinc-400 transition-colors hover:text-white">FAQ</Link>
              <Link href="/help" className="block text-zinc-400 transition-colors hover:text-white">Help</Link>
              <a href="mailto:hello@meritco.app" className="block text-zinc-400 transition-colors hover:text-white">Contact</a>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Legal</p>
              <Link href="/terms" className="block text-zinc-400 transition-colors hover:text-white">Terms</Link>
              <Link href="/privacy" className="block text-zinc-400 transition-colors hover:text-white">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/5 pt-6">
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} Merit. Made in BC, Canada.</p>
        </div>
      </footer>
    </div>
  );
}
