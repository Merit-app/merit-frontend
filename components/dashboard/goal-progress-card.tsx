'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
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
            className="flex flex-col items-start rounded-lg border border-border px-4 py-3 text-left hover:border-merit-blue-300 hover:bg-merit-blue-50 transition-colors disabled:opacity-50"
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
            className="text-[13px] text-muted-foreground hover:text-muted-foreground transition-colors"
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

  // Animate progress bar from 0 → pct on mount
  const [displayPct, setDisplayPct] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 400;

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(eased * pct);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [pct]);

  const displayHours = totalHours % 1 === 0 ? totalHours.toString() : totalHours.toFixed(1);
  const programLabel = user.goalProgram
    ? `${user.goalProgram} requirement`
    : 'Service goal';

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-foreground">{programLabel}</h3>
        <span className="text-[12px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {goal} hrs
        </span>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-[32px] font-medium text-foreground leading-none tabular-nums">
          {displayHours}
        </span>
        <span className="text-[16px] text-muted-foreground">/ {goal} hrs</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-merit-blue-600 rounded-full transition-none"
          style={{ width: `${displayPct}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-small text-muted-foreground">
          {user.nhsGoalStartDate
            ? `Started ${formatLongDate(user.nhsGoalStartDate)}`
            : `${remaining > 0 ? `${remaining % 1 === 0 ? remaining : remaining.toFixed(1)} hrs remaining` : 'Goal complete 🎉'}`}
        </span>
        <Link
          href="/hours"
          className="text-[13px] font-medium text-merit-blue-600 hover:text-merit-blue-700 transition-colors"
        >
          View all sessions →
        </Link>
      </div>
    </div>
  );
}
