"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RoutineNodeData } from "@/lib/types/flow";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Pause,
  AlertCircle,
  MapPin,
  Repeat,
  Hash,
  Info,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const statusConfig = {
  pending: {
    border: "border-slate-200",
    bg: "bg-white",
    badge: "secondary",
    icon: Clock,
    iconColor: "text-slate-500",
  },
  running: {
    border: "border-blue-400",
    bg: "bg-white",
    badge: "default",
    icon: Zap,
    iconColor: "text-blue-500 animate-pulse",
  },
  paused: {
    border: "border-amber-400",
    bg: "bg-white",
    badge: "secondary",
    icon: Pause,
    iconColor: "text-amber-500",
  },
  completed: {
    border: "border-emerald-400",
    bg: "bg-white",
    badge: "default",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  failed: {
    border: "border-red-400",
    bg: "bg-white",
    badge: "destructive",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  error_continued: {
    border: "border-orange-400",
    bg: "bg-white",
    badge: "secondary",
    icon: AlertCircle,
    iconColor: "text-orange-500",
  },
  cancelled: {
    border: "border-slate-300",
    bg: "bg-slate-50/50",
    badge: "secondary",
    icon: XCircle,
    iconColor: "text-slate-500",
  },
  breakpoint_hit: {
    border: "border-violet-500",
    bg: "bg-white",
    badge: "default",
    icon: MapPin,
    iconColor: "text-violet-500",
  },
  loop_active: {
    border: "border-cyan-400",
    bg: "bg-white",
    badge: "default",
    icon: Repeat,
    iconColor: "text-cyan-500",
  },
};

export function RoutineNode({ data, selected }: NodeProps<RoutineNodeData>) {
  const status = data.status || "pending";
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  const hasSlots = data.slots?.length > 0;
  const hasEvents = data.events?.length > 0;
  const routineState = data.routineState;
  const hasBreakpoint = (data.breakpoints?.length ?? 0) > 0;
  const isLoopActive = routineState?.current_iteration != null;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative flex flex-col rounded-lg border-2 shadow-md min-w-[200px] max-w-[320px] overflow-visible transition-shadow hover:shadow-lg",
          config.border,
          config.bg
        )}
      >
        {/* Header: identity (left) + status + actions (right) */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/60 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm truncate block">{data.routineId}</span>
            <span className="text-[10px] text-muted-foreground truncate block" title={data.className}>
              {data.className}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasBreakpoint && (
              <MapPin className="h-3 w-3 text-violet-500 fill-violet-500" aria-hidden />
            )}
            {isLoopActive && (
              <Repeat className="h-3 w-3 text-cyan-500" style={{ animation: "spin 3s linear infinite" }} aria-hidden />
            )}
            <Badge variant={config.badge as "default" | "secondary" | "destructive"} className="text-[10px] h-5 px-1.5 gap-0.5">
              <StatusIcon className={cn("h-2.5 w-2.5", config.iconColor)} />
              {status}
            </Badge>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onToggleBreakpoint?.();
                    }}
                  >
                    <MapPin className={cn("h-3 w-3", hasBreakpoint ? "text-violet-500 fill-violet-500" : "text-muted-foreground")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{hasBreakpoint ? "Remove breakpoint" : "Set breakpoint"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onViewDetails?.();
                    }}
                  >
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View details</TooltipContent>
              </Tooltip>
              {status === "running" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        data.onPauseAtRoutine?.();
                      }}
                    >
                      <Pause className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Pause here</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Body: [inputs] | center | [outputs] */}
        <div className="flex items-stretch px-1.5 py-2 gap-2 min-h-[44px]">
          {/* Inputs: thin strip, handles at node left edge */}
          {hasSlots ? (
            <div className="flex flex-col justify-center gap-1 w-16 flex-shrink-0 border-r border-blue-200/60 pr-1.5">
              {data.slots.map((slot) => (
                <div key={slot.name} className="relative flex items-center gap-1 h-5">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={slot.name}
                    title={`In: ${slot.name}`}
                    className={cn(
                      "!w-2 !h-2 !min-w-0 !min-h-0 !bg-blue-500 !border-2 !border-white",
                      data.breakpoints?.some((bp: { slotName?: string }) => bp.slotName === slot.name) && "!bg-violet-500"
                    )}
                  />
                  <span className="text-[10px] text-slate-600 truncate" title={slot.name}>{slot.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-1 flex-shrink-0" />
          )}

          {/* Center: state, arrow, or count */}
          <div className="flex-1 flex flex-col justify-center items-center min-w-0 py-0.5">
            {routineState && (
              <div className="space-y-1 w-full">
                {routineState.processed_count != null && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <Hash className="h-2.5 w-2.5" />
                    <span>{routineState.processed_count}×</span>
                    {routineState.valid_count != null && <span className="text-emerald-600">✓{routineState.valid_count}</span>}
                    {routineState.invalid_count != null && <span className="text-red-600">✗{routineState.invalid_count}</span>}
                  </div>
                )}
                {routineState.progress != null && (
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-mono">{Number(routineState.progress).toFixed(0)}%</span>
                    </div>
                    <Progress value={Number(routineState.progress)} className="h-1" />
                  </div>
                )}
                {routineState.current_iteration != null && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-600">
                    <Repeat className="h-2.5 w-2.5" />
                    <span className="font-mono">{routineState.current_iteration}/{routineState.max_iterations}</span>
                  </div>
                )}
                {routineState.last_result != null && !routineState.progress && !(routineState.current_iteration != null) && (
                  <div className="text-[9px] text-muted-foreground truncate text-center" title={String(routineState.last_result)}>
                    {String(routineState.last_result)}
                  </div>
                )}
              </div>
            )}
            {!routineState && hasSlots && hasEvents && (
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
            )}
            {!routineState && data.executionCount > 0 && (
              <span className="text-[10px] text-muted-foreground">{data.executionCount}×</span>
            )}
          </div>

          {/* Outputs: thin strip, handles at node right edge */}
          {hasEvents ? (
            <div className="flex flex-col justify-center gap-1 w-16 flex-shrink-0 border-l border-emerald-200/60 pl-1.5">
              {data.events.map((event) => (
                <div key={event.name} className="relative flex items-center justify-end gap-1 h-5">
                  <span className="text-[10px] text-slate-600 truncate text-right" title={event.name}>{event.name}</span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={event.name}
                    title={`Out: ${event.name}`}
                    className={cn(
                      "!w-2 !h-2 !min-w-0 !min-h-0 !bg-emerald-500 !border-2 !border-white",
                      data.breakpoints?.some((bp: { eventName?: string }) => bp.eventName === event.name) && "!bg-violet-500"
                    )}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-1 flex-shrink-0" />
          )}
        </div>

        {selected && (
          <div className="absolute inset-0 pointer-events-none rounded-lg ring-2 ring-ring ring-offset-2" />
        )}
      </div>
    </TooltipProvider>
  );
}
