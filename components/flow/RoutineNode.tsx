"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoutineNodeData } from "@/lib/types/flow";
import { CheckCircle2, Clock, XCircle, Pause, AlertCircle, ArrowRight } from "lucide-react";

const statusConfig = {
  pending: {
    color: "border-gray-300 bg-white",
    badge: "secondary",
    icon: Clock,
  },
  running: {
    color: "border-blue-500 bg-white shadow-lg shadow-blue-200",
    badge: "default",
    icon: Clock,
  },
  paused: {
    color: "border-yellow-500 bg-white",
    badge: "secondary",
    icon: Pause,
  },
  completed: {
    color: "border-green-500 bg-white",
    badge: "default",
    icon: CheckCircle2,
  },
  failed: {
    color: "border-red-500 bg-white",
    badge: "destructive",
    icon: XCircle,
  },
  error_continued: {
    color: "border-orange-500 bg-white",
    badge: "secondary",
    icon: AlertCircle,
  },
  cancelled: {
    color: "border-gray-400 bg-white",
    badge: "secondary",
    icon: XCircle,
  },
};

export function RoutineNode({ data, selected }: NodeProps<RoutineNodeData>) {
  const status = data.status || "pending";
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  const hasSlots = data.slots && data.slots.length > 0;
  const hasEvents = data.events && data.events.length > 0;

  return (
    <div className="relative flex rounded-lg border-2 shadow-lg overflow-hidden bg-white min-w-[300px]">
      {/* Left side - Inputs */}
      {hasSlots && (
        <div className="w-24 bg-blue-50/50 border-r border-blue-100 py-3 px-2">
          <div className="text-[10px] font-semibold text-blue-600 mb-2 text-center uppercase tracking-wide">
            Inputs
          </div>
          <div className="space-y-2">
            {data.slots.map((slot, index) => {
              const topPercent = 25 + (index * 50 / Math.max(data.slots.length - 1, 1));
              return (
                <div key={slot.name} className="relative h-8 flex items-center justify-end">
                  <span className="text-[10px] text-blue-700 font-medium truncate mr-1" title={slot.name}>
                    {slot.name}
                  </span>
                  {/* Handle positioned at the edge */}
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={slot.name}
                    title={`Input: ${slot.name}`}
                    className={cn(
                      "!w-3 !h-3 !bg-blue-500 !border-2 !border-white",
                      "absolute !left-0 !-translate-x-1/2",
                      data.breakpoints?.some((bp: any) => bp.slotName === slot.name) && "!bg-red-500"
                    )}
                    style={{
                      top: "50%",
                      left: "-1px",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Center - Main content */}
      <div className={cn(
        "flex-1 py-3 px-4 flex flex-col justify-between",
        !hasSlots && !hasEvents && "px-6"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <StatusIcon className="h-4 w-4 flex-shrink-0" />
          <span className="font-bold text-sm truncate">{data.routineId}</span>
          <Badge variant={config.badge as any} className="text-xs ml-auto flex-shrink-0">
            {status}
          </Badge>
        </div>

        {/* Class name */}
        <div className="text-xs text-muted-foreground truncate mb-2" title={data.className}>
          {data.className}
        </div>

        {/* Arrow indicator if has both inputs and outputs */}
        {hasSlots && hasEvents && (
          <div className="flex items-center justify-center text-muted-foreground">
            <ArrowRight className="h-3 w-3" />
          </div>
        )}

        {/* Execution count */}
        {data.executionCount > 0 && (
          <div className="text-[10px] text-muted-foreground border-t pt-1 mt-auto">
            Executed: {data.executionCount}x
          </div>
        )}
      </div>

      {/* Right side - Outputs */}
      {hasEvents && (
        <div className="w-24 bg-green-50/50 border-l border-green-100 py-3 px-2">
          <div className="text-[10px] font-semibold text-green-600 mb-2 text-center uppercase tracking-wide">
            Outputs
          </div>
          <div className="space-y-2">
            {data.events.map((event, index) => {
              const topPercent = 25 + (index * 50 / Math.max(data.events.length - 1, 1));
              return (
                <div key={event.name} className="relative h-8 flex items-center justify-start">
                  {/* Handle positioned at the edge */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={event.name}
                    title={`Output: ${event.name}`}
                    className={cn(
                      "!w-3 !h-3 !bg-green-500 !border-2 !border-white",
                      "absolute !right-0 !translate-x-1/2",
                      data.breakpoints?.some((bp: any) => bp.eventName === event.name) && "!bg-red-500"
                    )}
                    style={{
                      top: "50%",
                      right: "-1px",
                    }}
                  />
                  <span className="text-[10px] text-green-700 font-medium truncate ml-1" title={event.name}>
                    {event.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection ring */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none ring-2 ring-ring ring-offset-2 rounded-lg" />
      )}
    </div>
  );
}
