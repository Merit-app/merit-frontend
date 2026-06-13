'use client';

/**
 * Marketing design system — the single source of truth for the landing page.
 *
 * Everything on the landing page is built from these primitives so the type
 * scale, spacing rhythm, and card treatment can't drift back into ad-hoc
 * "vibe-coded" values. Two voices live here ('light' warm band, 'dark' near-
 * black band); a band's <Section> sets the theme via context and every child
 * primitive (Eyebrow / SectionHeading / Lead / MarketingCard) reads it.
 *
 * GUARDRAIL: on dark bands we use EXPLICIT white/zinc classes (not semantic
 * tokens), because tokens like `bg-card` mean "white" on these #0A0A0A bands.
 * Light bands use the semantic tokens. See DESIGN_DIRECTION.md.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type BandTheme = 'light' | 'dark';

const ThemeContext = React.createContext<BandTheme>('light');
export const useBandTheme = () => React.useContext(ThemeContext);

/* Unified dark band base + one elevated card value — used everywhere a dark
   band appears so org / hero / footer stop drifting (#0A0A0A vs #131313). */
export const DARK_BAND = '#0A0A0A';
export const DARK_CARD = '#141416';

/* ------------------------------------------------------------------ Section */

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  theme?: BandTheme;
  /** Renders a single deep-blue spotlight fading into the band (hero/dark). */
  spotlight?: boolean;
  /** Class for the inner max-w container. */
  containerClassName?: string;
  /** Override the standard band padding (e.g. the hero wants less top). */
  padding?: string;
}

/**
 * A full-bleed marketing band. Owns the ONE section-padding value and the
 * container width, sets the band background + base text color, and exposes
 * `data-theme` so the navbar can track which band sits under it.
 */
export function Section({
  theme = 'light',
  spotlight = false,
  padding = 'py-24 sm:py-32',
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  const dark = theme === 'dark';
  return (
    <ThemeContext.Provider value={theme}>
      <section
        data-theme={theme}
        className={cn(
          'relative overflow-hidden',
          dark ? 'text-white' : 'bg-background text-foreground',
          className,
        )}
        style={dark ? { backgroundColor: DARK_BAND } : undefined}
        {...props}
      >
        {spotlight && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden">
            <div className="absolute left-1/2 top-[-220px] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-merit-blue-500/[0.16] blur-[130px]" />
          </div>
        )}
        <div className={cn('relative mx-auto max-w-6xl px-6', padding, containerClassName)}>
          {children}
        </div>
      </section>
    </ThemeContext.Provider>
  );
}

/* ------------------------------------------------------------------ Eyebrow */

export function Eyebrow({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const dark = useBandTheme() === 'dark';
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.14em]',
        dark ? 'text-merit-blue-400' : 'text-merit-blue-600',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/* ----------------------------------------------------------- SectionHeading */

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** 'display' = hero scale; 'section' = standard band heading. */
  variant?: 'display' | 'section';
  as?: 'h1' | 'h2' | 'h3';
}

export function SectionHeading({
  variant = 'section',
  as: Tag = 'h2',
  className,
  children,
  ...props
}: HeadingProps) {
  const dark = useBandTheme() === 'dark';
  return (
    <Tag
      className={cn(
        'font-semibold tracking-tight',
        variant === 'display'
          ? 'text-5xl leading-[1.05] sm:text-6xl lg:text-7xl'
          : 'text-3xl leading-[1.1] sm:text-4xl lg:text-5xl',
        dark ? 'text-white' : 'text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------------- Lead */

export function Lead({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const dark = useBandTheme() === 'dark';
  return (
    <p
      className={cn(
        'text-lg font-normal leading-relaxed sm:text-xl',
        dark ? 'text-zinc-400' : 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/* ------------------------------------------------------------- MarketingCard */

interface MarketingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift (border shift + faint shadow + rise). */
  interactive?: boolean;
}

/**
 * The ONE marketing card. Border by default, no drop shadow until hover.
 * Theme-aware: light bands use semantic tokens; dark bands use explicit
 * white/zinc + the unified #141416 surface.
 */
export function MarketingCard({ interactive = false, className, children, ...props }: MarketingCardProps) {
  const dark = useBandTheme() === 'dark';
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition-all duration-200 sm:p-8',
        dark ? 'border-white/10' : 'border-border bg-card',
        interactive &&
          (dark
            ? 'hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]'
            : 'hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-[var(--shadow-elevated)]'),
        className,
      )}
      style={dark ? { backgroundColor: DARK_CARD } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- IconChip */

/** Small square accent chip — ONE accent (merit-blue) on every card. */
export function IconChip({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const dark = useBandTheme() === 'dark';
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl',
        dark ? 'bg-merit-blue-500/10 text-merit-blue-400' : 'bg-merit-blue-50 text-merit-blue-600',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------- shared text recipes */

/** Card title — semibold, steps down from section heading. */
export function cardTitleCls(dark: boolean) {
  return cn('text-base font-semibold tracking-tight sm:text-lg', dark ? 'text-white' : 'text-foreground');
}

/** Card body — muted, smaller; the clear bottom of the hierarchy. */
export function cardBodyCls(dark: boolean) {
  return cn('mt-2 text-sm leading-relaxed sm:text-[15px]', dark ? 'text-zinc-400' : 'text-muted-foreground');
}
