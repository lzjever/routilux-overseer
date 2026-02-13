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
  mode?: "job" | "flow"; // Display mode: 'job' shows runtime info, 'flow' shows static config
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
  breakpoint_id: string;
  job_id: string;
  routine_id: string;
  slot_name: string;
  enabled: boolean;
  hit_count: number;
  condition?: string | null;
}

export interface ConnectionEdgeData {
  sourceRoutine: string;
  sourceEvent: string;
  targetRoutine: string;
  targetSlot: string;
  active: boolean;
  lastActivity: string | null;
}

export type RoutineNode = Node<RoutineNodeData>;
export type ConnectionEdge = Edge<ConnectionEdgeData>;

// Re-export API types for convenience
export type { FlowResponse, RoutineInfo, ConnectionInfo } from "./api";
