'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in development; swap for Sentry.captureException(error) in production
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono mt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-white text-sm font-medium hover:bg-muted transition-colors"
        >
          <Home className="w-4 h-4" />
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

