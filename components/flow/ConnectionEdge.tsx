"use client";

import { EdgeProps, getBezierPath } from "reactflow";
import { cn } from "@/lib/utils";

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
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.active || false;

  return (
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
  );
}
