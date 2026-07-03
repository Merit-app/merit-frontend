'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Buttery smooth-scroll for the marketing pages (the Framer/Stripe "weight").
 * Mounted only inside the landing tree, so it never affects the authenticated
 * app or the native WebView. Fully disabled under prefers-reduced-motion (and
 * for users who never opted into motion), falling back to native scroll.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.4,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
