"use client";

import { EdgeProps, getBezierPath, getSmoothStepPath, Edge, Position } from "reactflow";
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
  source,
  target,
  data,
  selected,
  style,
}: EdgeProps<ConnectionEdgeData>) {
  const isActive = data?.active || false;
  const hasBreakpoint = data?.hasBreakpoint || false;
  const isSelfLoop = source === target;

  // Calculate edge path - use custom path for self-loops to route around node
  let edgePath: string;

  if (isSelfLoop) {
    // Self-loop: create a path that goes around the node
    // Use fixed offsets since source and target are the same node
    const loopOffset = 120; // Distance to route around the node
    
    // Determine routing direction based on handle positions
    // If both handles are on the same side, route to the opposite side
    // If handles are on different sides, route above or below
    
    if (sourcePosition === Position.Right && targetPosition === Position.Left) {
      // Output to input: route above the node
      const midX = (sourceX + targetX) / 2;
      const controlY = Math.min(sourceY, targetY) - loopOffset;
      edgePath = `M ${sourceX} ${sourceY} Q ${midX} ${controlY} ${targetX} ${targetY}`;
    } else if (sourcePosition === Position.Left && targetPosition === Position.Right) {
      // Input to output: route below the node
      const midX = (sourceX + targetX) / 2;
      const controlY = Math.max(sourceY, targetY) + loopOffset;
      edgePath = `M ${sourceX} ${sourceY} Q ${midX} ${controlY} ${targetX} ${targetY}`;
    } else if (sourcePosition === Position.Right && targetPosition === Position.Right) {
      // Both on right: route to the left
      const controlX = Math.min(sourceX, targetX) - loopOffset;
      const midY = (sourceY + targetY) / 2;
      edgePath = `M ${sourceX} ${sourceY} Q ${controlX} ${midY} ${targetX} ${targetY}`;
    } else if (sourcePosition === Position.Left && targetPosition === Position.Left) {
      // Both on left: route to the right
      const controlX = Math.max(sourceX, targetX) + loopOffset;
      const midY = (sourceY + targetY) / 2;
      edgePath = `M ${sourceX} ${sourceY} Q ${controlX} ${midY} ${targetX} ${targetY}`;
    } else {
      // Default: route above
      const midX = (sourceX + targetX) / 2;
      const controlY = Math.min(sourceY, targetY) - loopOffset;
      edgePath = `M ${sourceX} ${sourceY} Q ${midX} ${controlY} ${targetX} ${targetY}`;
    }
  } else {
    // Regular connection: use smooth step path to avoid going through nodes
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 8,
    });
    edgePath = path;
  }

  // Calculate midpoint for breakpoint marker
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Determine stroke color for arrow
  const strokeColor = style?.stroke || (isActive ? "#3b82f6" : "#9ca3af");
  const markerId = `arrow-${id}`;

  return (
    <g>
      <defs>
        {/* Modern arrow marker with better visual design - larger and more visible */}
        {/* Adjust refX to position arrow before the end of the path to avoid being hidden by node */}
        <marker
          id={markerId}
          markerWidth="18"
          markerHeight="18"
          refX={isSelfLoop ? 16 : 14}
          refY="9"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0 0 L 18 9 L 0 18 Z"
            fill={strokeColor}
            stroke={isActive ? "#1e40af" : "none"}
            strokeWidth={isActive ? "0.5" : "0"}
            opacity={isActive ? "0.95" : "0.85"}
          />
        </marker>
      </defs>
      {/* Main edge path */}
      <path
        id={id}
        d={edgePath}
        markerEnd={`url(#${markerId})`}
        className={cn(
          "fill-none transition-all duration-300",
          isActive
            ? "stroke-blue-500 stroke-[3px]"
            : "stroke-gray-400 stroke-2",
          selected && "stroke-ring stroke-[4px] drop-shadow-lg"
        )}
        style={{
          ...style,
          filter: isActive ? "drop-shadow(0 0 3px rgba(59, 130, 246, 0.6))" : undefined,
        }}
      />
      {/* Subtle animated direction indicator for inactive edges */}
      {!isActive && (
        <path
          d={edgePath}
          className="fill-none stroke-gray-300/40 stroke-[1.5]"
          strokeDasharray="3 6"
          style={{
            markerEnd: `url(#${markerId})`,
            animation: "dash 2s linear infinite",
          }}
        />
      )}

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
