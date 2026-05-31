import Link from 'next/link';

/**
 * Shared marketing navbar — mobile-first.
 * - Logo always visible on left
 * - Middle nav links (About, Pricing, FAQ, Contact) hidden on mobile, shown md+
 * - "Sign in" always visible
 * - "Get started" hidden on mobile to keep the bar clean (sign up link is in hero)
 */
export function MarketingNav() {
  return (
    <nav className="border-b border-ink-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-[18px] font-bold text-ink-900 tracking-tight shrink-0"
        >
          merit<span className="text-merit-blue-600">.</span>
        </Link>

        {/* Middle nav — hidden on mobile */}
        <div className="hidden md:flex items-center gap-5 text-[13px] font-medium text-ink-600">
          <Link href="/about"    className="hover:text-ink-900 transition-colors">About</Link>
          <Link href="/pricing"  className="hover:text-ink-900 transition-colors">Pricing</Link>
          <Link href="/faq"      className="hover:text-ink-900 transition-colors">FAQ</Link>
          <Link href="/contact"  className="hover:text-ink-900 transition-colors">Contact</Link>
        </div>

        {/* Auth links — always visible */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="hidden sm:inline-flex text-[13px] font-medium text-white bg-merit-blue-600 hover:bg-merit-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
