import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { vi } from "vitest";

// Custom render function with providers if needed
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, options);
}

// Mock data generators
export const mockJobState = {
  job_id: "test-job-1",
  flow_id: "test-flow-1",
  status: "running",
  current_routine_id: "routine-1",
  routine_states: {
    "routine-1": {
      status: "completed",
      execution_count: 1,
      last_execution: "2025-01-15T10:00:00Z",
      result: { data: "test" },
    },
    "routine-2": {
      status: "pending",
      execution_count: 0,
      last_execution: null,
    },
  },
  execution_history: [
    {
      routine_id: "routine-1",
      event_name: "on_start",
      timestamp: "2025-01-15T10:00:00Z",
      data: { message: "Started" },
    },
  ],
  pause_points: [],
  pending_tasks: [],
  deferred_events: [],
  shared_data: { key1: "value1", key2: { nested: "value2" } },
  shared_log: [],
  output_log: [],
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-15T10:00:00Z",
};

export const mockFlow = {
  flow_id: "test-flow-1",
  execution_strategy: "parallel",
  max_workers: 4,
  routines: {
    "routine-1": {
      routine_id: "routine-1",
      class_name: "TestRoutine",
      slots: ["input1", "input2"],
      events: ["output1", "output2"],
      config: { param1: "value1" },
    },
    "routine-2": {
      routine_id: "routine-2",
      class_name: "AnotherRoutine",
      slots: ["data"],
      events: ["result"],
      config: {},
    },
  },
  connections: [
    {
      source_routine: "routine-1",
      source_event: "output1",
      target_routine: "routine-2",
      target_slot: "data",
    },
  ],
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-15T10:00:00Z",
};

export const mockDebugSession = {
  session_id: "test-session-1",
  job_id: "test-job-1",
  status: "paused" as const,
  paused_at: {
    routine_id: "routine-1",
    checkpoint: { data: "test" },
  },
  call_stack_depth: 3,
  paused_timestamp: "2025-01-15T10:00:00Z",
};

export const mockEvalResponse = {
  result: 42,
  type: "int",
};

export const mockEvalError = {
  error: "NameError: name 'undefined_var' is not defined",
};

// Mock fetch API
export function mockFetch(response: any, ok = true) {
  return vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
}
