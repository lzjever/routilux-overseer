import { create } from "zustand";
import type { JobStateResponse, RoutineState, ExecutionRecord } from "@/lib/types/api";
import { createAPI } from "@/lib/api";

interface JobStateStore {
  jobStates: Map<string, JobStateResponse>;
  loading: boolean;
  error: string | null;

  // Actions
  loadJobState: (jobId: string, serverUrl: string) => Promise<void>;
  getRoutineState: (jobId: string, routineId: string) => RoutineState | null;
  getExecutionHistory: (jobId: string, routineId?: string) => ExecutionRecord[];
  getSharedData: (jobId: string) => Record<string, any>;
  getCurrentRoutineId: (jobId: string) => string | null;
}

export const useJobStateStore = create<JobStateStore>((set, get) => ({
  jobStates: new Map(),
  loading: false,
  error: null,

  loadJobState: async (jobId: string, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const api = createAPI(serverUrl);
      const results = await Promise.allSettled([
        api.jobs.getMonitoringData(jobId),
        api.jobs.getRoutinesStatus(jobId),
        api.jobs.getExecutionTrace(jobId, 200),
        api.jobs.getData(jobId),
        api.jobs.get(jobId),
      ]);

      const monitoringData = results[0].status === "fulfilled" ? results[0].value : null;
      const routinesStatus = results[1].status === "fulfilled" ? results[1].value : null;
      const executionTrace = results[2].status === "fulfilled" ? results[2].value : null;
      const jobData = results[3].status === "fulfilled" ? results[3].value : null;
      const job = results[4].status === "fulfilled" ? results[4].value : null;

      if (!monitoringData || !routinesStatus) {
        throw new Error("Job monitoring data is unavailable");
      }

      const routineStates: Record<string, RoutineState> = {};
      for (const [routineId, status] of Object.entries(routinesStatus)) {
        routineStates[routineId] = {
          status: status.status,
          execution_count: status.execution_count,
          last_execution: status.last_execution_time,
          error: status.error_count > 0 ? `${status.error_count} errors` : undefined,
        };
      }

      const createdAt = formatTimestamp(job?.created_at);
      const updatedAt = monitoringData.updated_at || createdAt;

      const state: JobStateResponse = {
        status: monitoringData.job_status || "unknown",
        current_routine_id: null,
        routine_states: routineStates,
        execution_history: (executionTrace?.events || []).map((event) => ({
          routine_id: event.routine_id,
          timestamp: event.timestamp,
          event_name: event.event_type,
          data: event.data || {},
        })),
        pause_points: [],
        deferred_events: [],
        created_at: createdAt,
        updated_at: updatedAt,
        shared_data: normalizeJobData(jobData),
      };
      
      set((prevState) => ({
        jobStates: new Map(prevState.jobStates).set(jobId, state),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load job state",
        loading: false,
      });
    }
  },

  getRoutineState: (jobId: string, routineId: string) => {
    const jobState = get().jobStates.get(jobId);
    if (!jobState) return null;
    return jobState.routine_states?.[routineId] || null;
  },

  getExecutionHistory: (jobId: string, routineId?: string) => {
    const jobState = get().jobStates.get(jobId);
    if (!jobState) return [];
    const history = jobState.execution_history ?? [];
    if (routineId) {
      return history.filter((r) => r.routine_id === routineId);
    }
    return history;
  },

  getSharedData: (jobId: string) => {
    const jobState = get().jobStates.get(jobId);
    return jobState?.shared_data || {};
  },

  getCurrentRoutineId: (jobId: string) => {
    const jobState = get().jobStates.get(jobId);
    return jobState?.current_routine_id || null;
  },
}));

const normalizeJobData = (data: any): Record<string, any> => {
  if (!data) return {};
  if (typeof data === "object") {
    if ("data" in data && typeof data.data === "object") {
      return data.data as Record<string, any>;
    }
    if ("shared_data" in data && typeof data.shared_data === "object") {
      return data.shared_data as Record<string, any>;
    }
  }
  return typeof data === "object" ? (data as Record<string, any>) : {};
};

const formatTimestamp = (value: any): string => {
  if (typeof value === "number") {
    const millis = value < 1e12 ? value * 1000 : value;
    return new Date(millis).toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return new Date().toISOString();
};
