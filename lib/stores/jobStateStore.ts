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
      // Note: getState API is no longer available
      // Use getJobMonitoringData or getJobTrace instead
      // For now, we'll create a minimal state from monitoring data
      const monitoringData = await api.jobs.getMonitoringData(jobId);
      const trace = await api.jobs.getTrace(jobId);
      
      // Convert to JobStateResponse format for compatibility
      // Extract routine states from monitoring data
      const routineStates: Record<string, RoutineState> = {};
      if (monitoringData.routines) {
        for (const [routineId, routineData] of Object.entries(monitoringData.routines)) {
          const execStatus = (routineData as any).execution_status;
          if (execStatus) {
            routineStates[routineId] = {
              status: execStatus.status,
              execution_count: execStatus.execution_count,
              last_execution: execStatus.last_execution_time,
              error: execStatus.error_count > 0 ? `${execStatus.error_count} errors` : undefined,
            };
          }
        }
      }
      
      const state: JobStateResponse = {
        status: monitoringData.job_status || "unknown",
        current_routine_id: null, // Not available in new API
        routine_states: routineStates,
        execution_history: (trace.trace_log || []).map((entry: any) => ({
          routine_id: entry.routine_id || entry.routine || "",
          timestamp: entry.timestamp || entry.time || new Date().toISOString(),
          event_name: entry.event_type || entry.event || entry.type || "",
          data: entry.data || entry || {},
        })),
        pause_points: [],
        deferred_events: [],
        created_at: new Date().toISOString(),
        updated_at: monitoringData.updated_at || new Date().toISOString(),
        shared_data: {},
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
