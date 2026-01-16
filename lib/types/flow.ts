import { Edge, Node } from "reactflow";

// Flow Types for ReactFlow

export type ExecutionStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "error_continued"
  | "cancelled";

export interface RoutineNodeData {
  routineId: string;
  className: string;
  slots: Slot[];
  events: Event[];
  config: Record<string, any>;
  status: ExecutionStatus;
  executionCount: number;
  lastExecutionTime: number | null;
  breakpoints: Breakpoint[];
  routineState?: any; // Routine state from job state
  onToggleBreakpoint?: () => void;
  onViewDetails?: () => void;
  onPauseAtRoutine?: () => void;
}

export interface Slot {
  name: string;
  handler?: string;
  mergeStrategy?: string;
}

export interface Event {
  name: string;
  parameters?: string[];
}

export interface Breakpoint {
  breakpointId: string;
  type: "routine" | "slot" | "event";
  slotName?: string;
  eventName?: string;
  enabled: boolean;
  hitCount: number;
  condition?: string;
}

export interface ConnectionEdgeData {
  sourceRoutine: string;
  sourceEvent: string;
  targetRoutine: string;
  targetSlot: string;
  paramMapping: Record<string, string> | null;
  active: boolean;
  lastActivity: string | null;
}

export type RoutineNode = Node<RoutineNodeData>;
export type ConnectionEdge = Edge<ConnectionEdgeData>;

// Re-export API types for convenience
export type { FlowResponse, RoutineInfo, ConnectionInfo } from "./api";
