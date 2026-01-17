"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  className?: string;
}

const DEFAULT_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#0088fe",
];

export function PieChart({
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  className,
}: PieChartProps) {
  // Ensure minimum dimensions to prevent chart errors
  const minHeight = Math.max(height || 300, 100);
  
  if (!data || data.length === 0) {
    return (
      <div className={className} style={{ width: "100%", height: minHeight, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="text-muted-foreground text-sm">No data available</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: "100%", minHeight, height: minHeight }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={minHeight}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
