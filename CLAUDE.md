# merit-frontend

Next.js 16 App Router + TypeScript + Tailwind v4 + shadcn/ui + framer-motion. Capacitor wraps the deployed site for iOS/Android. Production: www.meritco.app (Vercel).

## Commands
- `npm run dev` — local dev at http://localhost:3000
- `npm run typecheck` — the fast gate; run before declaring any work done
- `npm run lint`
- Deploy: `npx vercel --prod --yes` (remote build; wait for READY, then spot-check prod)

## Design system (the law)
- `DESIGN_DIRECTION.md` is the north star — read it before visual work. One system, two voices: student surfaces = warm/rounded/celebratory; org + chapter = dense/professional; landing = the showcase (its dark hero band is intentional).
- **Semantic tokens only** (`background`, `card`, `muted`, `foreground`, `border`; merit-blue is the single accent). Never hardcode hex or `gray-*`. Test every visual change in dark AND light mode.
- Build marketing sections from `components/marketing/_primitives.tsx`; motion from `components/motion/*`; shared UI from `components/ui/*` (UserAvatar, StatCard, SectionHeader…). Don't re-roll these primitives.
- Geist + Geist Mono (numbers/stats in mono with `tabular-nums`), 8px rhythm, respect `prefers-reduced-motion`.

## Settled naming
- Marketplace `/organizations` = **"Explore"**; the org a user administers (`/org/[id]/dashboard`) = **"My Organization"**.

## Gotchas
- `NEXT_PUBLIC_API_URL` falls back to `''` — if unset, every API call silently hits the frontend origin and 404s (audit B8).
- The public `/verify/*` pages are what supervisors and admissions officers see — historically the least consistent surfaces (audit B7). Hold them to the highest polish bar, on semantic tokens.
- Auth flows, the chapter platform, and the org dashboard are load-bearing — don't break them during restyles.
