import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-[22px] font-semibold tracking-tight text-ink-900">
            merit<span className="text-merit-blue-600">.</span>
          </span>
        </div>

        {/* 404 */}
        <p className="text-[80px] font-bold text-ink-900 leading-none mb-4">404</p>

        <h1 className="text-[18px] font-semibold text-ink-900 mb-2">
          This page doesn&apos;t exist.
        </h1>
        <p className="text-[13px] text-ink-500 mb-8 leading-relaxed">
          The link may be broken, or the page may have been moved.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Button
            asChild
            className="w-full max-w-[200px] bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100"
          >
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Link
            href="/"
            className="text-[13px] text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
