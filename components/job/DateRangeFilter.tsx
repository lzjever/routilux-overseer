"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  presets?: Array<{
    label: string;
    getDates: () => { start: Date; end: Date };
  }>;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  presets,
}: DateRangeFilterProps) {
  const defaultPresets = [
    {
      label: "Today",
      getDates: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { start: today, end: new Date() };
      },
    },
    {
      label: "This Week",
      getDates: () => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return { start: weekStart, end: today };
      },
    },
    {
      label: "Last 7 Days",
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { start, end };
      },
    },
    {
      label: "Last 30 Days",
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        return { start, end };
      },
    },
  ];

  const allPresets = presets || defaultPresets;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Date Range</Label>
      <div className="flex flex-wrap gap-2">
        {allPresets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => {
              const { start, end } = preset.getDates();
              onStartDateChange(start);
              onEndDateChange(end);
            }}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onStartDateChange(undefined);
            onEndDateChange(undefined);
          }}
          className="text-xs"
        >
          Clear
        </Button>
      </div>
      {(startDate || endDate) && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {startDate && format(startDate, "MMM d, yyyy")}
          {startDate && endDate && " - "}
          {endDate && format(endDate, "MMM d, yyyy")}
        </div>
      )}
    </div>
  );
}
