'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, Search, Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const ROWS = [
  { name: 'Sarah Kim', year: '2026', hours: 32, goal: 30, status: 'met' },
  { name: 'Daniel Osei', year: '2026', hours: 24, goal: 30, status: 'on_track' },
  { name: 'Maya Tran', year: '2027', hours: 21, goal: 30, status: 'on_track' },
  { name: 'Jacob Liu', year: '2026', hours: 9, goal: 30, status: 'at_risk' },
  { name: 'Priya Shah', year: '2027', hours: 27, goal: 30, status: 'on_track' },
] as const;

const STATUS = {
  met: { label: 'Met', cls: 'bg-green-50 text-green-700', icon: CheckCircle2 },
  on_track: { label: 'On track', cls: 'bg-merit-blue-50 text-merit-blue-700 dark:text-merit-blue-200', icon: Clock },
  at_risk: { label: 'At risk', cls: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
} as const;

/**
 * Static animated mockup of the chapter (school) dashboard — roster, goals,
 * at-risk flags. Browser-framed; renders on semantic tokens so it works in
 * both themes.
 */
export function ChapterMockup() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-8 top-8 bottom-0 -z-10 rounded-full bg-merit-blue-500/10 blur-3xl" />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-background px-3 py-1 text-[10px] text-muted-foreground">
            meritco.app/chapter/roster
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-merit-blue-50">
                <GraduationCap className="h-4 w-4 text-merit-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Riverside NHS</p>
                <p className="text-[11px] text-muted-foreground">132 students · 30h requirement · due Jun 1</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <Search className="h-3 w-3" /> Search students…
            </div>
          </div>

          {/* Stat chips */}
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Met requirement', value: '41', cls: 'text-green-600 dark:text-green-400' },
              { label: 'On track', value: '67', cls: 'text-merit-blue-600 dark:text-merit-blue-400' },
              { label: 'At risk', value: '18', cls: 'text-amber-600 dark:text-amber-400' },
              { label: 'Avg hours', value: '21.4', cls: 'text-foreground' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease: EASE }}
                className="rounded-lg border border-border bg-background px-3 py-2.5"
              >
                <p className={`text-lg font-semibold tabular-nums ${s.cls}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Roster rows */}
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1fr_34px_1fr_70px] items-center gap-2 border-b border-border bg-muted/50 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[1.2fr_60px_1fr_90px] sm:gap-3">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Student</span>
              <span>Year</span>
              <span>Progress</span>
              <span>Status</span>
            </div>
            {ROWS.map((r, i) => {
              const st = STATUS[r.status];
              const pct = Math.min(100, Math.round((r.hours / r.goal) * 100));
              return (
                <motion.div
                  key={r.name}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.07, ease: EASE }}
                  className="grid grid-cols-[1fr_34px_1fr_70px] items-center gap-2 border-b border-border px-3 py-2.5 text-xs last:border-0 sm:grid-cols-[1.2fr_60px_1fr_90px] sm:gap-3"
                >
                  <span className="truncate font-medium text-foreground">{r.name}</span>
                  <span className="tabular-nums text-muted-foreground">{r.year}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.span
                        className={`block h-full rounded-full ${r.status === 'at_risk' ? 'bg-amber-500' : r.status === 'met' ? 'bg-green-500' : 'bg-merit-blue-600'}`}
                        initial={reduce ? { width: `${pct}%` } : { width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.07, ease: EASE }}
                      />
                    </span>
                    <span className="hidden w-12 shrink-0 tabular-nums text-muted-foreground sm:inline">{r.hours}/{r.goal}h</span>
                  </span>
                  <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.cls}`}>
                    <st.icon className="h-2.5 w-2.5" />
                    {st.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
