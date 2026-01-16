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
  ArrowRight,
  MapPin,
  Repeat,
  Hash,
  Info,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const statusConfig = {
  pending: {
    color: "border-slate-300 bg-white",
    badge: "secondary",
    icon: Clock,
    iconColor: "text-slate-500",
  },
  running: {
    color: "border-blue-500 bg-blue-50/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    badge: "default",
    icon: Zap,
    iconColor: "text-blue-500 animate-pulse",
  },
  paused: {
    color: "border-yellow-500 bg-yellow-50/30",
    badge: "secondary",
    icon: Pause,
    iconColor: "text-yellow-500",
  },
  completed: {
    color: "border-green-500 bg-green-50/30",
    badge: "default",
    icon: CheckCircle2,
    iconColor: "text-green-500",
  },
  failed: {
    color: "border-red-500 bg-red-50/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    badge: "destructive",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  error_continued: {
    color: "border-orange-500 bg-orange-50/30",
    badge: "secondary",
    icon: AlertCircle,
    iconColor: "text-orange-500",
  },
  cancelled: {
    color: "border-slate-400 bg-slate-50",
    badge: "secondary",
    icon: XCircle,
    iconColor: "text-slate-500",
  },
  breakpoint_hit: {
    color: "border-purple-500 bg-purple-50 shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse",
    badge: "default",
    icon: MapPin,
    iconColor: "text-purple-500",
  },
  loop_active: {
    color: "border-cyan-500 bg-cyan-50/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    badge: "default",
    icon: Repeat,
    iconColor: "text-cyan-500 animate-spin-slow",
  },
};

export function RoutineNode({ data, selected }: NodeProps<RoutineNodeData>) {
  const status = data.status || "pending";
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  const hasSlots = data.slots && data.slots.length > 0;
  const hasEvents = data.events && data.events.length > 0;

  const routineState = data.routineState;
  const hasBreakpoint = data.breakpoints && data.breakpoints.length > 0;
  const isLoopActive = routineState?.current_iteration !== undefined;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative flex rounded-lg border-2 shadow-lg overflow-hidden min-w-[280px] transition-all duration-200 group hover:scale-[1.02] hover:z-50 cursor-pointer",
          config.color
        )}
      >
        {/* Top Status Bar */}
        <div className="flex items-center justify-between px-2 py-1 border-b bg-white/50 backdrop-blur-sm">
          {/* Left: Indicators */}
          <div className="flex items-center gap-1">
            {hasBreakpoint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <MapPin className="h-3.5 w-3.5 text-purple-500 fill-purple-500 cursor-pointer hover:scale-110 transition-transform" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Breakpoint set</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isLoopActive && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Repeat className="h-3.5 w-3.5 text-cyan-500" style={{ animation: "spin 3s linear infinite" }} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Loop iteration {routineState.current_iteration}/{routineState.max_iterations}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Right: Status Badge */}
          <Badge variant={config.badge as any} className="text-xs">
            <StatusIcon className={cn("h-3 w-3 mr-1", config.iconColor)} />
            {status}
          </Badge>
        </div>

        {/* Hover Action Buttons */}
        <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 rounded-full shadow-lg bg-white hover:bg-purple-50"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onToggleBreakpoint?.();
                }}
              >
                <MapPin className={cn("h-3 w-3", hasBreakpoint ? "text-purple-500 fill-purple-500" : "text-slate-400")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasBreakpoint ? "Remove Breakpoint" : "Set Breakpoint"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 rounded-full shadow-lg bg-white hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onViewDetails?.();
                }}
              >
                <Info className="h-3 w-3 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>

          {status === "running" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 rounded-full shadow-lg bg-white hover:bg-yellow-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onPauseAtRoutine?.();
                  }}
                >
                  <Pause className="h-3 w-3 text-slate-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pause Here</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Left side - Inputs */}
        {hasSlots && (
          <div className="w-20 bg-blue-50/50 border-r border-blue-100 py-2 px-1.5">
            <div className="text-[9px] font-semibold text-blue-600 mb-1.5 text-center uppercase tracking-wide">
              Inputs
            </div>
            <div className="space-y-1.5">
              {data.slots.map((slot) => (
                <div key={slot.name} className="relative h-7 flex items-center justify-end">
                  <span className="text-[9px] text-blue-700 font-medium truncate mr-1 w-full text-right" title={slot.name}>
                    {slot.name}
                  </span>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={slot.name}
                    title={`Input: ${slot.name}`}
                    className={cn(
                      "!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white",
                      "absolute !left-0 !-translate-x-1/2",
                      data.breakpoints?.some((bp: any) => bp.slotName === slot.name) && "!bg-purple-500"
                    )}
                    style={{ top: "50%", left: "-1px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Center - Main content */}
        <div
          className={cn(
            "flex-1 py-2 px-3 flex flex-col justify-between min-w-[180px]",
            !hasSlots && !hasEvents && "px-4"
          )}
        >
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm truncate">{data.routineId}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate" title={data.className}>
              {data.className}
            </div>
          </div>

          {/* Execution State */}
          {routineState && (
            <div className="space-y-1.5">
              {/* Execution Count */}
              {routineState.processed_count !== undefined && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Hash className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-600">{routineState.processed_count}x</span>
                  {routineState.valid_count !== undefined && (
                    <span className="text-green-600">✓ {routineState.valid_count}</span>
                  )}
                  {routineState.invalid_count !== undefined && (
                    <span className="text-red-600">✗ {routineState.invalid_count}</span>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              {routineState.progress !== undefined && (
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] text-slate-600">
                    <span>Progress</span>
                    <span className="font-mono">{routineState.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={routineState.progress} className="h-1.5" />
                </div>
              )}

              {/* Loop Iteration */}
              {routineState.current_iteration !== undefined && (
                <div className="flex items-center gap-1 text-[10px]">
                  <Repeat className="h-3 w-3 text-cyan-500" />
                  <span className="font-mono text-slate-600">
                    {routineState.current_iteration}/{routineState.max_iterations}
                  </span>
                </div>
              )}

              {/* Last Result */}
              {routineState.last_result && (
                <div className="text-[9px] text-slate-500 truncate" title={routineState.last_result}>
                  Last: {routineState.last_result}
                </div>
              )}
            </div>
          )}

          {/* Arrow indicator */}
          {hasSlots && hasEvents && !routineState && (
            <div className="flex items-center justify-center text-slate-400 mt-auto">
              <ArrowRight className="h-3 w-3" />
            </div>
          )}

          {/* Execution count fallback */}
          {data.executionCount > 0 && !routineState && (
            <div className="text-[9px] text-slate-500 border-t pt-1 mt-auto">
              Executed: {data.executionCount}x
            </div>
          )}
        </div>

        {/* Right side - Outputs */}
        {hasEvents && (
          <div className="w-20 bg-green-50/50 border-l border-green-100 py-2 px-1.5">
            <div className="text-[9px] font-semibold text-green-600 mb-1.5 text-center uppercase tracking-wide">
              Outputs
            </div>
            <div className="space-y-1.5">
              {data.events.map((event) => (
                <div key={event.name} className="relative h-7 flex items-center justify-start">
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={event.name}
                    title={`Output: ${event.name}`}
                    className={cn(
                      "!w-2.5 !h-2.5 !bg-green-500 !border-2 !border-white",
                      "absolute !right-0 !translate-x-1/2",
                      data.breakpoints?.some((bp: any) => bp.eventName === event.name) && "!bg-purple-500"
                    )}
                    style={{ top: "50%", right: "-1px" }}
                  />
                  <span className="text-[9px] text-green-700 font-medium truncate ml-1 w-full" title={event.name}>
                    {event.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection ring */}
        {selected && (
          <div className="absolute inset-0 pointer-events-none ring-2 ring-ring ring-offset-2 rounded-lg" />
        )}
      </div>
    </TooltipProvider>
  );
}
