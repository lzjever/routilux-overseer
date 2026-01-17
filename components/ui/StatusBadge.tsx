"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  Circle,
} from "lucide-react";

export type StatusType =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "paused"
  | "cancelled"
  | "unknown";

interface StatusBadgeProps {
  status: string | StatusType;
  showIcon?: boolean;
  showSpinner?: boolean;
  className?: string;
  onClick?: () => void;
  errorMessage?: string;
}

const statusConfig: Record<
  StatusType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: "default" | "secondary" | "destructive" | "outline";
    color: string;
    bgColor: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "outline",
    color: "text-yellow-600 dark:text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
  },
  running: {
    label: "Running",
    icon: Play,
    variant: "default",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "secondary",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    variant: "destructive",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  },
  paused: {
    label: "Paused",
    icon: Pause,
    variant: "outline",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "outline",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800",
  },
  unknown: {
    label: "Unknown",
    icon: Circle,
    variant: "outline",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

export function StatusBadge({
  status,
  showIcon = true,
  showSpinner = false,
  className,
  onClick,
  errorMessage,
}: StatusBadgeProps) {
  const normalizedStatus = (status?.toLowerCase() || "unknown") as StatusType;
  const config = statusConfig[normalizedStatus] || statusConfig.unknown;
  const Icon = config.icon;

  const badgeContent = (
    <Badge
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium transition-colors",
        config.bgColor,
        config.color,
        showSpinner && normalizedStatus === "running" && "animate-pulse",
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : "status"}
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && (
        <>
          {showSpinner && normalizedStatus === "running" ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <Icon className="h-3 w-3" aria-hidden="true" />
          )}
        </>
      )}
      <span>{config.label}</span>
    </Badge>
  );

  if (onClick && errorMessage && normalizedStatus === "failed") {
    return (
      <div className="relative group">
        {badgeContent}
        <div
          className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block bg-popover text-popover-foreground border rounded-md shadow-lg p-2 text-xs max-w-xs"
          role="tooltip"
        >
          {errorMessage}
        </div>
      </div>
    );
  }

  return badgeContent;
}
