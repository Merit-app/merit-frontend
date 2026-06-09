import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12px] text-muted-foreground">
          <span>
            merit<span className="text-merit-blue-600">.</span>
            {' '}— Service hour tracking for students
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <a href="mailto:hello@merit.app" className="hover:text-foreground transition-colors">hello@merit.app</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
