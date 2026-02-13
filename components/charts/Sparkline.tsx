"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: Array<{ value: number }>;
  color?: string;
  height?: number;
  className?: string;
}

export function Sparkline({ data, color = "#8884d8", height = 40, className }: SparklineProps) {
  const chartData = data.map((d, i) => ({ name: i, value: d.value }));

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
