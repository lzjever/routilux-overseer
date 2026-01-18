"use client";

import { BaseEdge, EdgeProps, getSmoothStepPath } from "reactflow";

export interface ConnectionEdgeData {
  active?: boolean;
  sourceEvent?: string;
  targetSlot?: string;
}

// Colors for different connection types
const SELF_CONNECTION_COLOR = "#f97316"; // Orange for self-loops
const CROSS_CONNECTION_COLOR = "#6b7280"; // Gray for normal connections
const SELECTED_COLOR = "#3b82f6"; // Blue for selected

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
  markerEnd,
  style,
}: EdgeProps<ConnectionEdgeData>) {
  const isSelfLoop = source === target;

  // Determine stroke color: style override > selection > type-based
  let strokeColor: string;
  if (style?.stroke) {
    // Use heat visualization color if provided
    strokeColor = style.stroke as string;
  } else if (selected) {
    strokeColor = SELECTED_COLOR;
  } else if (isSelfLoop) {
    strokeColor = SELF_CONNECTION_COLOR;
  } else {
    strokeColor = CROSS_CONNECTION_COLOR;
  }

  const strokeWidth = style?.strokeWidth ?? (selected ? 3 : 2);

  // For self-loops, create custom path that routes around the node
  let edgePath: string;

  if (isSelfLoop) {
    // Self-loop path: exits right, goes up, comes back to left
    const offsetX = 0;
    const offsetY = 100;

    edgePath = `M ${sourceX} ${sourceY} 
      L ${sourceX + offsetX} ${sourceY}
      Q ${sourceX + offsetX + 20} ${sourceY} ${sourceX + offsetX + 20} ${sourceY - 20}
      L ${sourceX + offsetX + 20} ${sourceY - offsetY + 20}
      Q ${sourceX + offsetX + 20} ${sourceY - offsetY} ${sourceX + offsetX} ${sourceY - offsetY}
      L ${targetX - offsetX} ${targetY - offsetY}
      Q ${targetX - offsetX - 20} ${targetY - offsetY} ${targetX - offsetX - 20} ${targetY - offsetY + 20}
      L ${targetX - offsetX - 20} ${targetY - 20}
      Q ${targetX - offsetX - 20} ${targetY} ${targetX - offsetX} ${targetY}
      L ${targetX} ${targetY}`;
  } else {
    // Use native smooth step path for regular connections
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 20,
    });
    edgePath = path;
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: strokeColor,
        strokeWidth,
        transition: "stroke 0.2s, stroke-width 0.2s",
      }}
    />
  );
}
