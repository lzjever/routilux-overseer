import { create } from "zustand";
import type { JobResponse, JobStartRequest } from "@/lib/types/api";
import { createAPI } from "@/lib/api";
import { getWebSocketManager, disposeWebSocketManager, WebSocketMessage } from "@/lib/websocket/websocket-manager";

interface JobState {
  jobs: Map<string, JobResponse>;
  loading: boolean;
  error: string | null;
  serverUrl: string | null;
  wsConnected: boolean;

  // Actions
  loadJobs: (serverUrl: string) => Promise<void>;
  loadJob: (jobId: string, serverUrl: string) => Promise<void>;
  startJob: (request: JobStartRequest, serverUrl: string) => Promise<JobResponse>;
  pauseJob: (jobId: string, serverUrl: string) => Promise<void>;
  resumeJob: (jobId: string, serverUrl: string) => Promise<void>;
  cancelJob: (jobId: string, serverUrl: string) => Promise<void>;

  // WebSocket actions
  connectWebSocket: (serverUrl: string) => Promise<void>;
  disconnectWebSocket: () => void;
  updateJobFromWS: (message: WebSocketMessage) => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: new Map(),
  loading: false,
  error: null,
  serverUrl: null,
  wsConnected: false,

  loadJobs: async (serverUrl: string) => {
    set({ loading: true, error: null, serverUrl });
    try {
      const api = createAPI(serverUrl);
      const response = await api.jobs.list(null, null, 100);
      const jobMap = new Map(response.jobs.map((j) => [j.job_id, j]));
      set({ jobs: jobMap, loading: false, serverUrl });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load jobs",
        loading: false,
      });
    }
  },

  loadJob: async (jobId: string, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const api = createAPI(serverUrl);
      const job = await api.jobs.get(jobId);
      set((state) => ({
        jobs: new Map(state.jobs).set(jobId, job),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load job",
        loading: false,
      });
    }
  },

  startJob: async (request: JobStartRequest, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const api = createAPI(serverUrl);
      const job = await api.jobs.start(request);
      set((state) => ({
        jobs: new Map(state.jobs).set(job.job_id, job),
        loading: false,
      }));
      return job;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to start job",
        loading: false,
      });
      throw error;
    }
  },

  pauseJob: async (jobId: string, serverUrl: string) => {
    try {
      const api = createAPI(serverUrl);
      await api.jobs.pause(jobId);
      // Refresh job state via API
      const job = await api.jobs.get(jobId);
      set((state) => ({
        jobs: new Map(state.jobs).set(jobId, job),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to pause job",
      });
    }
  },

  resumeJob: async (jobId: string, serverUrl: string) => {
    try {
      const api = createAPI(serverUrl);
      await api.jobs.resume(jobId);
      // Refresh job state via API
      const job = await api.jobs.get(jobId);
      set((state) => ({
        jobs: new Map(state.jobs).set(jobId, job),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to resume job",
      });
    }
  },

  cancelJob: async (jobId: string, serverUrl: string) => {
    try {
      const api = createAPI(serverUrl);
      await api.jobs.cancel(jobId);
      // Refresh job state via API
      const job = await api.jobs.get(jobId);
      set((state) => ({
        jobs: new Map(state.jobs).set(jobId, job),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to cancel job",
      });
    }
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
        "job_paused",
        "job_resumed",
        "job_cancelled",
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
      if (serverUrl) {
        const api = createAPI(serverUrl);
        api.jobs.get(message.job_id).then((job) => {
          set((state) => ({
            jobs: new Map(state.jobs).set(message.job_id, job),
          }));
        }).catch((error) => {
          console.error("Failed to refresh job after WS event:", error);
        });
      }
    }
  },
}));
