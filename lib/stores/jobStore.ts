import { create } from "zustand";
import type { JobResponse, JobStartRequest } from "@/lib/types/api";
import { createAPI } from "@/lib/api";

interface JobState {
  jobs: Map<string, JobResponse>;
  loading: boolean;
  error: string | null;
  serverUrl: string | null;

  // Actions
  loadJobs: (serverUrl: string) => Promise<void>;
  loadJob: (jobId: string, serverUrl: string) => Promise<void>;
  startJob: (request: JobStartRequest, serverUrl: string) => Promise<JobResponse>;
  pauseJob: (jobId: string, serverUrl: string) => Promise<void>;
  resumeJob: (jobId: string, serverUrl: string) => Promise<void>;
  cancelJob: (jobId: string, serverUrl: string) => Promise<void>;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: new Map(),
  loading: false,
  error: null,
  serverUrl: null,

  loadJobs: async (serverUrl: string) => {
    set({ loading: true, error: null, serverUrl });
    try {
      const api = createAPI(serverUrl);
      const response = await api.jobs.list();
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
      await api.jobs.get(jobId); // Refresh job state
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
      await api.jobs.get(jobId); // Refresh job state
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
      await api.jobs.get(jobId); // Refresh job state
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to cancel job",
      });
    }
  },
}));
