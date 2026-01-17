// Re-export all types from generated API
export type * from "../api/generated";

/**
 * Routine execution status for monitoring
 */
export interface RoutineExecutionStatus {
  routine_id: string;
  is_active: boolean;
  status: string;
  last_execution_time?: string | null;
  execution_count?: number;
  error_count?: number;
}

/**
 * Queue status for a slot
 */
export interface SlotQueueStatus {
  slot_name: string;
  queue_size: number;
  queue_limit: number;
  active: boolean;
  queue_pressure: "low" | "medium" | "high" | "critical";
}

/**
 * Routine info
 */
export interface RoutineInfo {
  routine_id: string;
  routine_type: string;
  activation_policy: Record<string, any>;
  config: Record<string, any>;
  slots: Array<string>;
  events: Array<string>;
}

/**
 * Complete monitoring data for a routine
 */
export interface RoutineMonitoringData {
  routine_id: string;
  execution_status: RoutineExecutionStatus;
  queue_status: SlotQueueStatus[];
  info: RoutineInfo;
}

/**
 * Complete monitoring data for a job
 */
export interface JobMonitoringData {
  job_id: string;
  flow_id: string;
  job_status: string;
  routines: Record<string, RoutineMonitoringData>;
  updated_at: string;
}

/**
 * Call stack response from debug endpoint
 */
export interface CallStackResponse {
  job_id: string;
  call_stack: Array<{
    routine_id: string;
    slot_name?: string;
    event_name?: string;
  }>;
}

// Legacy type aliases for backward compatibility
export type { BreakpointResponse as Breakpoint } from "./generated";
