// API Response Types

export interface FlowListResponse {
  flows: FlowResponse[];
  total: number;
}

export interface FlowResponse {
  flow_id: string;
  routines: Record<string, RoutineInfo>;
  connections: ConnectionInfo[];
  execution_strategy: string;
  max_workers: number;
}

export interface RoutineInfo {
  routine_id: string;
  class_name: string;
  slots: string[];
  events: string[];
  config: Record<string, any>;
}

export interface ConnectionInfo {
  connection_id: string;
  source_routine: string;
  source_event: string;
  target_routine: string;
  target_slot: string;
  param_mapping: Record<string, string> | null;
}

export interface FlowCreateRequest {
  flow_id: string;
  dsl?: string;
  dsl_dict?: Record<string, any>;
  execution_strategy?: string;
  max_workers?: number;
}

// Job Types

export interface JobListResponse {
  jobs: JobResponse[];
  total: number;
}

export interface JobResponse {
  job_id: string;
  flow_id: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

export interface JobStartRequest {
  flow_id: string;
  entry_routine_id: string;
  entry_params?: Record<string, any>;
  timeout?: number;
}

export interface JobStatusResponse {
  job_id: string;
  status: string;
  flow_id: string;
}

export interface JobStateResponse {
  job_id: string;
  flow_id: string;
  status: string;
  current_routine_id: string | null;
  routine_states: Record<string, RoutineState>;
  execution_history: ExecutionRecord[];
  pause_points: PausePoint[];
  pending_tasks: any[];
  deferred_events: DeferredEvent[];
  shared_data: Record<string, any>;
  shared_log: SharedLogEntry[];
  output_log: OutputLogEntry[];
  created_at: string;
  updated_at: string;
}

export interface RoutineState {
  status: string;
  execution_count: number;
  last_execution: string | null;
  error?: string;
  result?: any;
}

export interface PausePoint {
  timestamp: string;
  reason: string;
  current_routine_id: string;
  checkpoint: Record<string, any>;
}

export interface DeferredEvent {
  routine_id: string;
  event_name: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface SharedLogEntry {
  [key: string]: any;
  timestamp: string;
}

export interface OutputLogEntry {
  routine_id: string;
  output_type: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface ExecutionRecord {
  routine_id: string;
  event_name: string;
  data: Record<string, any>;
  timestamp: string;
}

// Debug Types

export interface DebugSessionResponse {
  session_id: string;
  job_id: string;
  status: string;
  paused_at: DebugPosition | null;
  call_stack_depth: number;
}

export interface DebugPosition {
  routine_id: string;
  slot_name: string | null;
  event_name: string | null;
}

export interface VariablesResponse {
  job_id: string;
  routine_id: string | null;
  variables: Record<string, any>;
}

export interface VariableSetResponse {
  job_id: string;
  variable: string;
  value: any;
}

export interface CallStackResponse {
  job_id: string;
  call_stack: CallStackFrame[];
}

export interface CallStackFrame {
  routine_id: string;
  slot_name: string | null;
  event_name: string | null;
  variables: string[];
}

// Breakpoint Types

export interface Breakpoint {
  breakpoint_id: string;
  job_id: string;
  type: "routine" | "slot" | "event";
  routine_id: string;
  slot_name?: string;
  event_name?: string;
  condition?: string;
  enabled: boolean;
  hit_count: number;
}

export interface BreakpointListResponse {
  job_id: string;
  breakpoints: Breakpoint[];
}

export interface BreakpointCreateRequest {
  type: "routine" | "slot" | "event";
  routine_id: string;
  slot_name?: string;
  event_name?: string;
  condition?: string;
}

// Metrics Types

export interface MetricsResponse {
  job_id: string;
  flow_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  total_events: number;
  total_slot_calls: number;
  total_event_emits: number;
  routine_metrics: Record<string, RoutineMetrics>;
  errors: ErrorRecord[];
}

export interface JobMetricsResponse {
  job_id: string;
  flow_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  routine_metrics: Record<string, RoutineMetrics>;
  total_events: number;
  total_slot_calls: number;
  total_event_emits: number;
  errors: ErrorRecord[];
}

export interface RoutineMetrics {
  routine_id: string;
  execution_count: number;
  total_duration: number;
  avg_duration: number;
  min_duration: number | null;
  max_duration: number | null;
  error_count: number;
  last_execution: string | null;
}

export interface ErrorRecord {
  error_id: string;
  job_id: string;
  routine_id: string;
  timestamp: string;
  error_type: string;
  error_message: string;
  traceback: string | null;
}

// Job Trace

export interface JobTraceResponse {
  events: ExecutionTraceEvent[];
  total: number;
}

export interface ExecutionTraceEvent {
  event_id: string;
  job_id: string;
  routine_id: string;
  event_type: string;
  timestamp: string;
  data: Record<string, any>;
  duration?: number;
  status?: string;
}

// Job Logs

export interface JobLogsResponse {
  job_id: string;
  logs: JobLogEntry[];
  total: number;
}

export interface JobLogEntry {
  timestamp: string;
  level: string;
  message: string;
  routine_id?: string;
}

// Expression Evaluation

export interface ExpressionEvalRequest {
  expression: string;
  routine_id?: string;
  frame_index?: number;
}

export interface ExpressionEvalResponse {
  result?: any;
  type?: string;
  error?: string;
}

// Debug Session Info (Enhanced)

export interface DebugSessionInfo {
  session_id: string;
  job_id: string;
  status: "paused" | "running" | "stepping";
  paused_at: DebugPosition | null;
  call_stack_depth: number;
  paused_timestamp?: string;
}

// WebSocket Event Types

export interface WebSocketMessage {
  type: string;
  job_id: string;
  [key: string]: any;
}

export interface ExecutionEvent {
  event_id: string;
  job_id: string;
  routine_id: string;
  event_type: "routine_start" | "routine_end" | "slot_call" | "event_emit";
  timestamp: string;
  data: Record<string, any>;
  duration?: number;
  status?: string;
}

export interface BreakpointHitEvent {
  breakpoint_id: string;
  job_id: string;
  routine_id: string;
  timestamp: string;
  position: DebugPosition;
  context: Record<string, any>;
}
