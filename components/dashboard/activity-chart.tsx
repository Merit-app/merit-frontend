'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useState } from 'react';
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval, parseISO, format } from 'date-fns';
import { useMeritStore } from '@/lib/store';

interface WeekBar {
  label: string;
  range: string;
  hours: number;
}

function buildWeeklyData(sessions: ReturnType<typeof useMeritStore.getState>['sessions']): WeekBar[] {
  const now = new Date();
  const verified = sessions.filter((s) => s.status === 'verified');

  return Array.from({ length: 8 }, (_, i) => {
    const weekDate = subWeeks(now, 7 - i);
    const start = startOfWeek(weekDate, { weekStartsOn: 1 });
    const end = endOfWeek(weekDate, { weekStartsOn: 1 });

    const hours = verified
      .filter((s) => isWithinInterval(parseISO(s.date), { start, end }))
      .reduce((sum, s) => sum + s.hours, 0);

    const label = i === 0 ? format(start, 'MMM d') : i === 7 ? format(start, 'MMM d') : '';

    return {
      label: i === 0 || i === 7 ? format(start, 'MMM d') : '',
      range: `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`,
      hours,
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  data: WeekBar[];
  activeIndex: number | null;
}

function CustomTooltip({ active, payload, data, activeIndex }: CustomTooltipProps) {
  if (!active || !payload?.length || activeIndex === null) return null;
  const week = data[activeIndex];
  if (!week) return null;

  return (
    <div
      className="bg-white border border-ink-200 rounded-lg px-3 py-2 text-[12px] shadow-sm"
      style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.06)' }}
    >
      <p className="text-ink-500 mb-0.5">{week.range}</p>
      <p className="font-medium text-ink-900">
        {week.hours % 1 === 0 ? week.hours : week.hours.toFixed(1)} hrs
      </p>
    </div>
  );
}

export default function ActivityChart() {
  const sessions = useMeritStore((s) => s.sessions);
  const data = buildWeeklyData(sessions);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
      <h3 className="text-h3 text-ink-900 mb-5">Activity</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap="30%"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#A8A29E' }}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip data={data} activeIndex={hoveredIndex} />}
              cursor={false}
            />
            <Bar
              dataKey="hours"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={hoveredIndex === index ? '#2563EB' : '#BFDBFE'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
