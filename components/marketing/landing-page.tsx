'use client';

import Link from 'next/link';
import { MarketingNavbar } from './navbar';
import { StudentSection } from './student-section';
import { OrgSection } from './org-section';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <MarketingNavbar />

      {/* Student section — light theme */}
      <section id="students" className="scroll-mt-16">
        <StudentSection />
      </section>

      {/* Org section — dark theme (wraps inside) */}
      <section id="organizations" className="scroll-mt-16">
        <OrgSection />
      </section>

      {/* Shared footer */}
      <footer className="border-t border-white/5 py-8 px-6 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>merit. Volunteer hours you can prove.</p>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-300">Pricing</Link>
            <Link href="/faq" className="hover:text-gray-300">FAQ</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
            <a href="mailto:hello@meritco.app" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
