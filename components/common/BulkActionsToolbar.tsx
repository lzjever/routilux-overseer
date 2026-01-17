"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, CheckSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline";
    disabled?: boolean;
  }>;
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions = [],
  className,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-3 bg-muted/50 border rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          {selectedCount} selected
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="h-7 text-xs"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="h-7 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="h-7 text-xs gap-1"
            >
              {Icon && <Icon className="h-3 w-3" />}
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
