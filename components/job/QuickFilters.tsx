"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickFilter {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  activeFilter?: string;
  onFilterChange: (value: string) => void;
  className?: string;
}

const defaultFilters: QuickFilter[] = [
  { label: "All", value: "all", icon: Clock },
  { label: "Running", value: "running", icon: Play },
  { label: "Completed", value: "completed", icon: CheckCircle2 },
  { label: "Failed", value: "failed", icon: XCircle },
];

export function QuickFilters({
  filters = defaultFilters,
  activeFilter,
  onFilterChange,
  className,
}: QuickFiltersProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={cn("gap-1", isActive && "shadow-sm")}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
