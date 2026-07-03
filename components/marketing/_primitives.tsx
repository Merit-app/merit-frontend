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
  /** Full-bleed decorative layer rendered behind the container (e.g. HeroBackdrop). */
  backdrop?: React.ReactNode;
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
  backdrop,
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
        {backdrop}
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
        'rounded-md border p-6 transition-all duration-200 sm:p-8',
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
        'inline-flex h-9 w-9 items-center justify-center rounded-md',
        dark ? 'bg-merit-blue-500/15 text-merit-blue-300 ring-1 ring-inset ring-merit-blue-400/20' : 'bg-merit-blue-50 text-merit-blue-600 ring-1 ring-inset ring-merit-blue-600/10',
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

/* --------------------------------------------------------------- GradientMesh */

/**
 * The signature blue atmosphere for ANCHOR cards. Pure CSS — layered radial
 * gradients in the brand-blue family ONLY (cool, restrained; never warm /
 * rainbow / cyan). Decorative: aria-hidden, non-interactive, sits behind
 * content. Contained inside one anchor card per section, never page chrome.
 *
 * 'dark'  — full mesh over a near-black base; the densest blue is parked in the
 *           bottom-right, away from the top-left heading, so white text stays
 *           legible over the darkest area.
 * 'light' — a faint blue tint layered over the card's token base (bg-card), so
 *           it adapts to dark mode instead of hardcoding white.
 */
export function GradientMesh({ variant }: { variant: BandTheme }) {
  const dark = variant === 'dark';
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-90 sm:opacity-100"
      style={{
        backgroundImage: dark
          ? [
              'radial-gradient(120% 120% at 0% 0%, rgba(59,130,246,0.20), transparent 52%)',
              'radial-gradient(120% 120% at 100% 0%, rgba(37,99,235,0.20), transparent 50%)',
              'radial-gradient(150% 150% at 100% 100%, rgba(30,58,138,0.42), transparent 55%)',
              'radial-gradient(95% 95% at 6% 100%, rgba(29,78,216,0.20), transparent 55%)',
              'linear-gradient(165deg, #181A20 0%, #0F1014 100%)',
            ].join(', ')
          : [
              'radial-gradient(120% 120% at 0% 0%, rgba(37,99,235,0.09), transparent 55%)',
              'radial-gradient(120% 100% at 100% 100%, rgba(59,130,246,0.07), transparent 55%)',
            ].join(', '),
      }}
    />
  );
}

/* ------------------------------------------------------------------ BentoCard */

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Loud anchor: gets the blue gradient-mesh atmosphere + room for floats. */
  anchor?: boolean;
  /** Subtle hover border-lift (no harsh shadow). */
  interactive?: boolean;
  /** Faint single-color blue glow tucked into one corner (quiet-card variation). */
  glow?: 'tr' | 'bl';
}

/**
 * Borderless / seamless surface card — the Stripe-grade replacement for the
 * boxed MarketingCard. A card is defined by a SUBTLE FILL, not a hard stroke:
 * dark bands use an explicit near-black gradient + a barely-there white border;
 * light bands use the semantic `bg-card` + a hairline that adapts across modes.
 * Crisp corners (`rounded-md`, 8px) read more architectural than the generic
 * 16px "vibecoded" radius. A faint top-edge inner highlight on dark cards gives
 * them the "cut from glass" elevation that separates them from the black band.
 * `overflow-hidden` so embedded product UI can bleed to the edge.
 *
 * Padding is intentionally NOT baked in — callers pad their text content and let
 * embedded UI break out to the edge with negative margins.
 */
export function BentoCard({ anchor = false, interactive = false, glow, className, children, ...props }: BentoCardProps) {
  const dark = useBandTheme() === 'dark';
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md',
        dark
          ? cn(
              'border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
              anchor ? 'border-white/10' : 'border-white/[0.08]',
            )
          : anchor
            ? 'bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
            : 'bg-card border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-white/[0.08]',
        interactive &&
          'transition-[border-color,transform] duration-200 ' +
            (dark ? 'hover:border-white/20' : 'hover:border-black/[0.10] dark:hover:border-white/20'),
        className,
      )}
      style={dark ? { backgroundImage: 'linear-gradient(165deg, #1A1B1F 0%, #131417 100%)' } : undefined}
      {...props}
    >
      {anchor && <GradientMesh variant={dark ? 'dark' : 'light'} />}
      {glow && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute h-40 w-40 rounded-full blur-[64px]',
            dark ? 'bg-merit-blue-500/20' : 'bg-merit-blue-400/15',
            glow === 'tr' ? '-right-12 -top-12' : '-bottom-12 -left-12',
          )}
        />
      )}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}

/** Recipe for the small overlapping "floating" status card on an anchor — the
    ONE place a real drop shadow is intentional (it implies layered depth). */
export function floatCardCls(dark: boolean) {
  return cn(
    'rounded-md border px-3 py-2 backdrop-blur-sm',
    dark
      ? 'border-white/10 bg-[#1B1C20]/95 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]'
      : 'border-black/[0.06] bg-card shadow-[var(--shadow-elevated)]',
  );
}
