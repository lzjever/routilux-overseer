"use client";

import { EdgeProps, getBezierPath, Edge } from "reactflow";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface ConnectionEdgeData {
  active?: boolean;
  lastActivity?: string;
  hasBreakpoint?: boolean;
  sourceEvent?: string;
  targetSlot?: string;
}

export function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<ConnectionEdgeData>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.active || false;
  const hasBreakpoint = data?.hasBreakpoint || false;

  // Calculate midpoint for breakpoint marker
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        className={cn(
          "fill-none transition-all duration-300",
          isActive
            ? "stroke-blue-500 stroke-[3px] animated-edge"
            : "stroke-gray-400 stroke-2",
          selected && "stroke-ring stroke-[3px]"
        )}
      />

      {/* Breakpoint Marker */}
      {hasBreakpoint && (
        <foreignObject
          x={midX - 10}
          y={midY - 10}
          width={20}
          height={20}
          className="pointer-events-none"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-purple-500 rounded-full border-2 border-white shadow-lg" />
            <MapPin className="h-3 w-3 text-white relative z-10" />
          </div>
        </foreignObject>
      )}
    </g>
  );
}
