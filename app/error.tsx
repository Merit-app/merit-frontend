'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <AlertTriangle size={22} className="text-danger" />
          </div>
        </div>

        <h1 className="text-[18px] font-semibold text-ink-900 mb-2">Something went wrong</h1>
        <p className="text-[13px] text-ink-500 mb-6 leading-relaxed">
          An unexpected error occurred. If this keeps happening, please contact support.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Button
            onClick={reset}
            className="w-full max-w-[200px] bg-merit-blue-600 hover:bg-merit-blue-700 active:scale-[0.98] text-white font-medium transition-all duration-100"
          >
            Try again
          </Button>
          <Link
            href="/"
            className="text-[13px] text-merit-blue-600 hover:text-merit-blue-700 font-medium transition-colors"
          >
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-[11px] text-ink-400 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
