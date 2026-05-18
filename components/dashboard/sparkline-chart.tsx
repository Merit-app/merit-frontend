'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  data: { v: number }[];
  positive?: boolean;
}

export default function SparklineChart({ data, positive = true }: Props) {
  const color = positive ? '#2563EB' : '#DC2626';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          strokeOpacity={0.6}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
