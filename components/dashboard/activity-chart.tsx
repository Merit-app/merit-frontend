'use client';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval, parseISO, format } from 'date-fns';
import { useMeritStore } from '@/lib/store';

// Series colors — chosen to read well on both light and dark cards.
const COLOR_VERIFIED = '#3B82F6';     // merit blue
const COLOR_SELF_TRACKED = '#F59E0B'; // amber

interface WeekBar {
  label: string;
  range: string;
  verified: number;
  selfTracked: number;
}

function buildWeeklyData(sessions: ReturnType<typeof useMeritStore.getState>['sessions']): WeekBar[] {
  const now = new Date();

  return Array.from({ length: 8 }, (_, i) => {
    const weekDate = subWeeks(now, 7 - i);
    const start = startOfWeek(weekDate, { weekStartsOn: 1 });
    const end = endOfWeek(weekDate, { weekStartsOn: 1 });

    let verified = 0;
    let selfTracked = 0;
    for (const s of sessions) {
      if (!isWithinInterval(parseISO(s.date), { start, end })) continue;
      // Self-tracked sessions are stored as status 'verified' but are NOT
      // org-verified, so check selfReported first.
      if (s.selfReported) selfTracked += s.hours;
      else if (s.status === 'verified') verified += s.hours;
    }

    return {
      label: i === 0 || i === 7 ? format(start, 'MMM d') : '',
      range: `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`,
      verified,
      selfTracked,
    };
  });
}

function fmtHrs(n: number) {
  return n % 1 === 0 ? `${n}` : n.toFixed(1);
}

interface CustomTooltipProps {
  active?: boolean;
  data: WeekBar[];
  activeIndex: number | null;
}

function CustomTooltip({ active, data, activeIndex }: CustomTooltipProps) {
  if (!active || activeIndex === null) return null;
  const week = data[activeIndex];
  if (!week) return null;
  const total = week.verified + week.selfTracked;

  return (
    <div
      className="bg-card border border-border rounded-lg px-3 py-2 text-[12px] shadow-sm"
      style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.12)' }}
    >
      <p className="text-muted-foreground mb-1">{week.range}</p>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: COLOR_VERIFIED }} />
          <span className="text-foreground">Verified</span>
          <span className="ml-auto font-medium text-foreground tabular-nums">{fmtHrs(week.verified)} h</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: COLOR_SELF_TRACKED }} />
          <span className="text-foreground">Self-tracked</span>
          <span className="ml-auto font-medium text-foreground tabular-nums">{fmtHrs(week.selfTracked)} h</span>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2 border-t border-border mt-1 pt-1">
            <span className="text-muted-foreground">Total</span>
            <span className="ml-auto font-semibold text-foreground tabular-nums">{fmtHrs(total)} h</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      <span className="text-[12px] text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ActivityChart() {
  const sessions = useMeritStore((s) => s.sessions);
  const data = buildWeeklyData(sessions);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      {/* Header — title + legend */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h3 className="text-h3 text-foreground">Activity</h3>
        <div className="flex items-center gap-4">
          <LegendSwatch color={COLOR_VERIFIED} label="Verified" />
          <LegendSwatch color={COLOR_SELF_TRACKED} label="Self-tracked" />
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <div className="min-w-[320px] h-[200px] md:h-44 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barCategoryGap="30%"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis hide />
              <Tooltip
                content={<CustomTooltip data={data} activeIndex={hoveredIndex} />}
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              />
              {/* Self-tracked sits at the base; verified stacks on top with the
                  rounded cap, so common verified-only weeks read cleanly. */}
              <Bar
                dataKey="selfTracked"
                stackId="a"
                fill={COLOR_SELF_TRACKED}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
              />
              <Bar
                dataKey="verified"
                stackId="a"
                fill={COLOR_VERIFIED}
                radius={[4, 4, 0, 0]}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
