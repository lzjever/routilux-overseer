// Re-export all types from generated API (RoutineInfo, SlotQueueStatus, JobMonitoringData, etc.)
export type * from "../api/generated";

/**
 * Execution record for timeline/history views
 */
export interface ExecutionRecord {
  routine_id: string;
  timestamp: string;
  event_name: string;
  data: Record<string, unknown>;
}

/**
 * Routine state within a job (from job state response)
 */
export interface RoutineState {
  status?: string;
  execution_count?: number;
  last_execution?: string | null;
  error?: string;
  result?: unknown;
}

/**
 * Job state response from GET /api/jobs/{job_id}/state
 */
export interface JobStateResponse {
  status: string;
  current_routine_id?: string | null;
  routine_states?: Record<string, RoutineState>;
  execution_history?: ExecutionRecord[];
  pause_points: Array<{ timestamp: string; reason: string; current_routine_id: string }>;
  deferred_events: unknown[];
  created_at: string;
  updated_at: string;
  shared_data?: Record<string, unknown>;
}

export type { BreakpointResponse as Breakpoint } from "../api/generated";
