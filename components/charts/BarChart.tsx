"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xKey: string;
  bars?: Array<{ key: string; name: string; color?: string }>;
  height?: number;
  className?: string;
}

export function BarChart({
  data,
  dataKey,
  xKey,
  bars = [{ key: dataKey, name: dataKey }],
  height = 300,
  className,
}: BarChartProps) {
  // Ensure minimum dimensions to prevent chart errors
  const minHeight = Math.max(height || 300, 100);

  if (!data || data.length === 0) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: minHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-muted-foreground text-sm">No data available</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: "100%", minHeight, height: minHeight }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={minHeight}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {bars.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color || "#8884d8"} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
