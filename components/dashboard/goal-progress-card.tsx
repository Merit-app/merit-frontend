'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressRing, CountUp } from '@/components/motion';
import { useMeritStore } from '@/lib/store';
import { usersApi, mapUser } from '@/lib/api';
import { formatLongDate } from '@/lib/utils';

// ─── Goal setup card (shown when no goal is set) ─────────────────────────────

const PRESET_GOALS = [
  { program: 'NHS',        label: 'NHS',        sub: '75 hrs',  hours: 75  },
  { program: 'IB CAS',     label: 'IB CAS',     sub: '150 hrs', hours: 150 },
  { program: 'Graduation', label: 'Graduation', sub: '40 hrs',  hours: 40  },
  { program: 'Scholarship',label: 'Scholarship',sub: '50 hrs',  hours: 50  },
];

function GoalSetupCard() {
  const updateUser = useMeritStore((s) => s.updateUser);
  const [saving, setSaving] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customHours, setCustomHours] = useState('');

  async function saveGoal(program: string, hours: number) {
    setSaving(true);
    try {
      const res = await usersApi.update({ goalProgram: program, goalHours: hours });
      updateUser(mapUser(res.data.user));
    } catch {
      // Non-fatal — optimistically update store anyway
      updateUser({
        goalProgram: program,
        nhsGoalHours: hours,
        nhsGoalStartDate: new Date().toISOString().split('T')[0],
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-6">
      <h3 className="text-h3 text-foreground mb-1">Set your service goal</h3>
      <p className="text-small text-muted-foreground mb-5">
        Choose a program to start tracking your progress.
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {PRESET_GOALS.map((p) => (
          <button
            key={p.program}
            disabled={saving}
            onClick={() => { setShowCustom(false); saveGoal(p.program, p.hours); }}
            className="flex flex-col items-start rounded-xl border border-border px-4 py-3 text-left transition-all hover:border-merit-blue-300 hover:bg-merit-blue-50 active:scale-[0.98] disabled:opacity-50"
          >
            <span className="text-[13px] font-semibold text-foreground">{p.label}</span>
            <span className="text-[12px] text-muted-foreground">{p.sub}</span>
          </button>
        ))}
      </div>

      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
        >
          + Custom goal
        </button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            min={1}
            max={1000}
            placeholder="e.g. 100"
            value={customHours}
            onChange={(e) => setCustomHours(e.target.value)}
            className="flex h-10 w-28 rounded-lg border border-border bg-card px-3 text-[14px] text-foreground focus:outline-none focus:border-merit-blue-400 transition-colors"
          />
          <span className="text-[13px] text-muted-foreground">hrs</span>
          <Button
            size="sm"
            disabled={!customHours || parseInt(customHours) < 1 || saving}
            onClick={() => saveGoal('Custom', parseInt(customHours))}
            className="bg-merit-blue-600 hover:bg-merit-blue-700 text-white font-medium text-[13px]"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : 'Set goal'}
          </Button>
          <button
            onClick={() => { setShowCustom(false); setCustomHours(''); }}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Progress card (shown when goal is set) ───────────────────────────────────

export function GoalProgressCard() {
  const user = useMeritStore((s) => s.user);
  const sessions = useMeritStore((s) => s.sessions);

  // No goal set yet
  if (!user.nhsGoalHours) {
    return <GoalSetupCard />;
  }

  const totalHours = sessions
    .filter((s) => s.status === 'verified')
    .reduce((sum, s) => sum + s.hours, 0);

  const goal = user.nhsGoalHours;
  const pct = Math.min((totalHours / goal) * 100, 100);
  const remaining = Math.max(goal - totalHours, 0);

  return <GoalProgressInner totalHours={totalHours} goal={goal} pct={pct} remaining={remaining} />;
}

interface InnerProps {
  totalHours: number;
  goal: number;
  pct: number;
  remaining: number;
}

function GoalProgressInner({ totalHours, goal, pct, remaining }: InnerProps) {
  const user = useMeritStore((s) => s.user);

  const complete = remaining <= 0;
  const decimals = totalHours % 1 === 0 ? 0 : 1;
  const programLabel = user.goalProgram
    ? `${user.goalProgram} requirement`
    : 'Service goal';
  const remainingStr = remaining % 1 === 0 ? remaining.toString() : remaining.toFixed(1);

  return (
    <div className="relative overflow-hidden bg-card rounded-2xl border border-border p-6 mb-6">
      {/* Soft celebratory wash when the goal is met */}
      {complete && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-merit-blue-50/80 via-transparent to-violet-500/[0.06]"
        />
      )}

      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        {/* Goal ring — the hero moment */}
        <ProgressRing value={pct} size={120} strokeWidth={11}>
          <div className="text-center">
            <p className="text-[22px] font-semibold leading-none tabular-nums text-foreground">
              <CountUp value={pct} decimals={0} suffix="%" duration={1.1} />
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {complete ? 'done!' : 'of goal'}
            </p>
          </div>
        </ProgressRing>

        {/* Numbers + meta */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="mb-1.5 flex items-center justify-center gap-2 sm:justify-start">
            <h3 className="text-h3 text-foreground">{programLabel}</h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[12px] font-medium text-muted-foreground">
              {goal} hrs
            </span>
          </div>

          <div className="flex items-baseline justify-center gap-1.5 sm:justify-start">
            <span className="text-[36px] font-semibold leading-none tabular-nums text-foreground">
              <CountUp value={totalHours} decimals={decimals} duration={1.1} />
            </span>
            <span className="text-[16px] text-muted-foreground">/ {goal} hrs verified</span>
          </div>

          <p className="mt-2 text-small text-muted-foreground">
            {complete ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-merit-blue-600 dark:text-merit-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                Goal complete — incredible work!
              </span>
            ) : (
              <>
                <span className="font-medium text-foreground">{remainingStr} hrs to go</span>
                {user.nhsGoalStartDate && (
                  <span> · started {formatLongDate(user.nhsGoalStartDate)}</span>
                )}
              </>
            )}
          </p>

          <Link
            href="/hours"
            className="mt-3 inline-block text-[13px] font-medium text-merit-blue-600 transition-colors hover:text-merit-blue-700 dark:text-merit-blue-400 dark:hover:text-merit-blue-200"
          >
            View all sessions →
          </Link>
        </div>
      </div>
    </div>
  );
}
