# Merit — Design Direction (North Star)

> This is the brief. Execute against it. The goal: a **stunning, modern, easy** product —
> Notion's guided-demo warmth + Vercel's professional restraint, on one coherent system.
> **One design system, two voices.** Don't rip out the system — elevate it.

---

## 1. North star (read this first)

Merit should feel **calm on the surface, alive in the moments.** Generous whitespace,
confident typography, and restraint as the baseline (Vercel) — then deliberate pops of
delight where it counts: the landing demos, progress celebrations, micro-interactions
(Notion/Duolingo). Never busy. Never corporate-cold. Every screen should feel
*considered*.

Three feelings, by surface:
- **Student app** → *motivating, warm, "made for me."* A student should *want* to open it.
- **Org + Chapter dashboards** → *professional, confident, data-forward.* An adult admin should trust it.
- **Landing page** → *the showcase.* Walk visitors through everything Merit does, beautifully.

---

## 2. The two voices (same system, different dial settings)

| Dimension | Student app (warm) | Org / Chapter (professional) |
|---|---|---|
| Radius | Rounder (`rounded-xl`/`2xl`) | Slightly tighter (`rounded-lg`/`xl`) |
| Density | Airier, larger touch targets | Denser, more data per screen |
| Color | More accent, gentle gradients, celebratory moments | Mostly neutral, accent used sparingly for signal |
| Copy | Friendly, encouraging ("Nice work — 3 hrs logged!") | Direct, precise ("3 students at risk") |
| Motion | Playful springs, confetti-on-milestone | Subtle, fast, functional |
| Imagery | Soft illustration, rounded avatars | Clean charts, logos, tables |

Both share the **same tokens, type scale, and components** — only the dial moves.

---

## 3. Foundations

### Typography
- **Keep Geist** (already in use) — it's the Vercel-grade sans. Geist Mono for numbers/code/stats.
- Establish a **tighter, more deliberate scale.** Headlines should be bigger and more confident than they are now:
  - Display (landing hero): `text-5xl`–`text-7xl`, `font-semibold`, `tracking-tight`, leading ~1.05
  - H1 (page titles): `text-2xl`–`text-3xl`, `tracking-tight`
  - Body: 15px base, `leading-relaxed`, `text-muted-foreground` for secondary
  - Stats/numbers: Geist Mono, `tabular-nums`, large and proud
- **Rule:** one headline weight (semibold), one body weight (normal/medium). No light weights at small sizes (washes out, esp. dark mode).

### Color
- **Primary:** `merit-blue` (keep). Use it as the *one* confident accent — CTAs, active states, progress, focus rings. Don't dilute it with competing accents.
- **Neutrals:** keep the warm-ish neutral base (not pure cold gray). The semantic tokens (`background`, `card`, `muted`, `foreground`, `border`) already exist — **use them everywhere; never hardcode hex.**
- **Student surfaces** may add a subtle blue→violet or blue→cyan gradient in heroes/celebrations. **Org/chapter** stays near-monochrome + blue signal.
- **Dark mode is a first-class citizen, not an afterthought.** Every new component must look intentional in dark mode (test both). Avoid `bg-foreground + text-white` (white-on-white bug we've hit) — use `text-background` on inverted surfaces.
- Status colors: green = met/success, amber = at-risk/warning, red = overdue/danger — already in use; keep consistent.

### Spacing & rhythm
- More breathing room. Sections on the landing want `py-20`/`py-28`. Cards want `p-6`/`p-8`.
- Establish an **8px rhythm**; align everything to it. Consistent vertical rhythm is 80% of "premium."

### Elevation
- Shadows: **subtle and layered**, never harsh. Prefer `border` + a faint shadow over a heavy drop shadow. Cards lift slightly on hover (student side a touch more).

### Motion (the "pop" — do this well, it's the differentiator)
- **Library:** Framer Motion (already a dep).
- **Principles:** fast (150–300ms), spring-based for interactive elements, ease-out for entrances. Nothing should feel sluggish.
- **Scroll-reveal:** landing sections fade+rise in (`opacity 0→1`, `y 16→0`) as they enter view, staggered children.
- **Micro-interactions:** buttons scale `0.98` on press; cards lift on hover; numbers count up; progress bars animate fill.
- **Celebration:** when a student hits a milestone/goal — a tasteful confetti or a satisfying check animation. This is the Duolingo dopamine. Use sparingly so it stays special.
- **Respect `prefers-reduced-motion`** everywhere.

---

## 4. The landing page (the hero deliverable)

Model: **Notion's homepage** — a guided, scroll-driven walkthrough that *shows* the product,
section by section, with live/animated demos. We already have `student-demo.tsx` (phone) and
`org-laptop-mockup.tsx` (laptop) — **elevate these into the centerpieces.**

Section flow (evolve the current `landing-page.tsx`):
1. **Hero** — big confident headline, one-line value prop, primary CTA + secondary. A subtle animated backdrop (gradient mesh or soft grid, *very* restrained). Maybe a small live demo peek.
2. **Student showcase** — scroll-driven walkthrough of the student experience: logging hours → SMS verification → dashboard → leaderboard → scholarships. Each step animates the phone demo to the relevant screen. **Make the phone demo cleaner, with crisp transitions and "pop."** This is the warm, student-appealing section.
3. **Org showcase** — the laptop demo walking through the org dashboard (verify hours, events, reports). Professional, confident. Darker band for contrast (already a pattern).
4. **School / chapter showcase** — the newest, most impressive surface. Show the chapter dashboard: roster, at-risk flags, goals, opportunities. Professional. (The lead-capture form already lives here.)
5. **Social proof / trust** — verification, privacy, "data stays yours."
6. **Final CTA** — big, clean, single action.

Demo polish checklist: smooth state transitions (not hard cuts), consistent device frames, real-looking data, subtle looping motion (a notification sliding in, a number ticking up), and tasteful depth (soft shadows, slight 3D tilt à la Vercel/Framer).

---

## 5. Student app shell — warm & motivating

The dashboard is a **home that celebrates progress**, not a control panel.
- **Greeting header** with personality; a hero progress moment (goal ring / animated bar) front and center.
- **Stats** as friendly cards with count-up numbers and tiny sparklines.
- **Recent activity** with verified/self-tracked color coding (already built — make it sing).
- Empty states are **encouraging**, not blank ("Log your first hour →" with a friendly illustration).
- Badges/streaks get a little delight. Milestone = celebration moment.
- Rounded, airy, blue-accented. Mobile-first feel even on desktop.

## 6. Org + Chapter shells — professional & confident

- **Denser, calmer, authoritative.** Think a premium analytics tool.
- Sidebar: refined, clear active states (the inverted `bg-foreground` active pill is good — keep, polish).
- **Tables** are key here — make them excellent: comfortable row height, clear headers, hover states, sortable affordances, great empty/loading states. The roster, volunteers, and reports tables should feel like Linear's lists.
- **Data viz**: clean, minimal charts. One accent. Lots of whitespace. Numbers in Geist Mono, tabular.
- Status pills (met/at-risk/overdue) consistent and legible in both themes.
- Restrained motion — fast, functional, no confetti.

## 7. Component elevation checklist (cascades everywhere)

Elevate the shared primitives so every screen improves at once:
- **Buttons** — confident sizing, press-scale, clear hierarchy (primary/secondary/ghost), loading state with spinner.
- **Cards** — consistent radius/padding/border/hover-lift.
- **Inputs** — clean focus ring (merit-blue), comfortable height, clear labels/help/error.
- **Tables** — see §6.
- **Empty states** — every list gets a designed empty state (icon + line + action), never a bare "No data."
- **Loading** — skeletons that match content shape, not spinners-in-a-void.
- **Badges/pills** — one consistent system for status.
- **Toasts/feedback** — add a clean toast system for success/error (currently inline messages); subtle slide-in.
- **Modals** — consistent, backdrop-blur, spring-in.

## 8. Reusable motion patterns to build
- `<Reveal>` — scroll-triggered fade+rise wrapper (staggered children).
- `<CountUp>` — animated number.
- `<ProgressBar animated>` — fills on mount.
- Press/hover primitives baked into Button/Card.
- Milestone celebration (confetti/check) component.

---

## 9. Do / Don't

**Do:** use semantic tokens; test dark + light on every change; align to 8px; keep one accent;
make empty + loading states; respect reduced-motion; ship screen-by-screen behind the working app.

**Don't:** hardcode hex; add a second competing accent color; use heavy drop shadows; animate
everything (motion is seasoning); break the chapter/org/student shells while restyling shared
components; rewrite the design system from scratch.

---

## 10. Execution order (for Fable)

1. **Foundations pass** — refine tokens, type scale, radius/shadow, motion primitives, Button/Card/Input/Table/Badge/EmptyState/Skeleton/Toast. (Everything cascades from here.)
2. **Landing page** — the hero. Hero → student showcase (elevate phone demo) → org → chapter → CTA. Get this to "wow."
3. **Student dashboard** — the warm home, celebration moments.
4. **Org + Chapter shells** — professional polish, great tables, clean charts.
5. **Sweep** — empty/loading/error states, mobile, dark-mode audit.

## 11. Guardrails (non-negotiable)
- Don't break: chapter platform, org dashboard, dark/light mode, auth flows.
- Tailwind v4 + semantic tokens stay the foundation.
- Deploy frontend with `npx vercel --prod --yes` (builds remotely — the build is the type check; deps aren't installed locally). Verify each deploy is `READY` before moving on.
- Work in reviewable chunks; keep the product shippable at every step.
