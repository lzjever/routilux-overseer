"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xKey: string;
  lines?: Array<{ key: string; name: string; color?: string }>;
  height?: number;
  className?: string;
}

export function LineChart({
  data,
  dataKey,
  xKey,
  lines = [{ key: dataKey, name: dataKey }],
  height = 300,
  className,
}: LineChartProps) {
  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color || "#8884d8"}
              strokeWidth={2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
