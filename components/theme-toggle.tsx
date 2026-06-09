'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  /** Use 'sidebar' for the org dark sidebar style, 'topbar' for the light student topbar. */
  variant?: 'sidebar' | 'topbar';
}

export function ThemeToggle({ variant = 'topbar' }: Props) {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch — only render icon after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  if (variant === 'sidebar') {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-muted transition-colors w-full"
      >
        {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-merit-blue-600"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
