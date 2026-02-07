import { create } from "zustand";
import type { JobResponse, JobSubmitRequest } from "@/lib/api/generated";
import type { JobMonitoringData, ExecutionMetricsResponse } from "@/lib/api/generated";
import { queryService } from "@/lib/services";
import { handleError } from "@/lib/errors";
import { getWebSocketManager, disposeWebSocketManager, WebSocketMessage } from "@/lib/websocket/websocket-manager";

interface JobState {
  jobs: Map<string, JobResponse>;
  monitoringData: Map<string, JobMonitoringData>;
  metricsData: Map<string, ExecutionMetricsResponse>;
  loading: boolean;
  error: string | null;
  serverUrl: string | null;
  wsConnected: boolean;

  // Actions
  loadJobs: (serverUrl: string, workerId?: string | null) => Promise<void>;
  loadJob: (jobId: string, serverUrl: string) => Promise<JobResponse>;
  submitJob: (request: JobSubmitRequest, serverUrl: string) => Promise<JobResponse>;
  loadJobMonitoringData: (jobId: string, serverUrl: string) => Promise<void>;
  loadJobMetrics: (jobId: string, serverUrl: string) => Promise<void>;
  setJobs: (jobs: JobResponse[]) => void;

  // WebSocket actions
  connectWebSocket: (serverUrl: string) => Promise<void>;
  disconnectWebSocket: () => void;
  updateJobFromWS: (message: WebSocketMessage) => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: new Map(),
  monitoringData: new Map(),
  metricsData: new Map(),
  loading: false,
  error: null,
  serverUrl: null,
  wsConnected: false,

  loadJobs: async (serverUrl: string, workerId?: string | null) => {
    set({ loading: true, error: null, serverUrl });
    try {
      const jobs = await queryService.jobs.list({ workerId: workerId || undefined });
      const jobMap = new Map(jobs.map((j) => [j.job_id, j]));
      set({ jobs: jobMap, loading: false, serverUrl });
    } catch (error) {
      handleError(error, "Failed to load jobs");
      set({
        loading: false,
      });
    }
  },

  loadJob: async (jobId: string, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const job = await queryService.jobs.get(jobId);
      set((state) => ({
        jobs: new Map(state.jobs).set(jobId, job),
        loading: false,
      }));
      return job;
    } catch (error) {
      handleError(error, `Failed to load job ${jobId}`);
      set({
        error: error instanceof Error ? error.message : "Failed to load job",
        loading: false,
      });
      throw error;
    }
  },

  submitJob: async (request: JobSubmitRequest, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const job = await queryService.jobs.submit(request);
      set((state) => ({
        jobs: new Map(state.jobs).set(job.job_id, job),
        loading: false,
      }));
      return job;
    } catch (error) {
      handleError(error, "Failed to submit job");
      set({
        error: error instanceof Error ? error.message : "Failed to submit job",
        loading: false,
      });
      throw error;
    }
  },

  loadJobMonitoringData: async (jobId: string, serverUrl: string) => {
    try {
      const monitoringData = await queryService.jobs.getMonitoringData(jobId);
      set((state) => ({
        monitoringData: new Map(state.monitoringData).set(jobId, monitoringData),
      }));
    } catch (error) {
      handleError(error, "Failed to load job monitoring data");
    }
  },

  loadJobMetrics: async (jobId: string, serverUrl: string) => {
    try {
      const metrics = await queryService.jobs.getMetrics(jobId);
      set((state) => ({
        metricsData: new Map(state.metricsData).set(jobId, metrics),
      }));
    } catch (error) {
      handleError(error, "Failed to load job metrics");
    }
  },

  setJobs: (jobs: JobResponse[]) => {
    const jobMap = new Map(jobs.map((job) => [job.job_id, job]));
    set({ jobs: jobMap });
  },

  // WebSocket methods
  connectWebSocket: async (serverUrl: string) => {
    try {
      const wsManager = getWebSocketManager(serverUrl);

      if (!wsManager.isConnected()) {
        await wsManager.connect();
      }

      // Subscribe to all job events
      const events = [
        "job_started",
        "job_completed",
        "job_failed",
        "routine_started",
        "routine_completed",
        "routine_failed",
      ] as const;

      events.forEach((eventType) => {
        wsManager.on(eventType, (message: WebSocketMessage) => {
          get().updateJobFromWS(message);
        });
      });

      set({ wsConnected: true, serverUrl });
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      set({ wsConnected: false });
    }
  },

  disconnectWebSocket: () => {
    disposeWebSocketManager();
    set({ wsConnected: false });
  },

  updateJobFromWS: (message: WebSocketMessage) => {
    const { jobs, serverUrl } = get();

    // Handle job-level events
    if (message.type.startsWith("job_")) {
      // Reload the job from API to get full state
      queryService.jobs.get(message.job_id).then((job) => {
        set((state) => ({
          jobs: new Map(state.jobs).set(message.job_id, job),
        }));
      }).catch((error) => {
        handleError(error, "Failed to refresh job after WS event");
      });
    }
  },
}));
