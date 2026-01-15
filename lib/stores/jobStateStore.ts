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
      const state = await api.jobs.getState(jobId);
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
    return jobState.routine_states[routineId] || null;
  },

  getExecutionHistory: (jobId: string, routineId?: string) => {
    const jobState = get().jobStates.get(jobId);
    if (!jobState) return [];
    const history = jobState.execution_history;
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
