'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('cookie_consent')) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-foreground/95 backdrop-blur-sm border-t border-ink-700">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <p className="flex-1 text-[13px] text-muted-foreground leading-snug">
          We use cookies to improve your experience. By using Merit you agree to our{' '}
          <Link
            href="/privacy"
            className="text-merit-blue-400 hover:text-merit-blue-300 underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-merit-blue-600 hover:bg-merit-blue-500 active:scale-[0.97] text-white text-[13px] font-medium transition-all duration-100"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
