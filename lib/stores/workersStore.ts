import { create } from "zustand";
import type { WorkerResponse, WorkerCreateRequest } from "@/lib/api/generated";
import { queryService } from "@/lib/services";
import { handleError } from "@/lib/errors";

interface WorkersState {
  workers: Map<string, WorkerResponse>;
  loading: boolean;
  error: string | null;
  serverUrl: string | null;

  // Actions
  loadWorkers: (serverUrl: string, flowId?: string | null, status?: string | null) => Promise<void>;
  loadWorker: (workerId: string, serverUrl: string) => Promise<WorkerResponse>;
  createWorker: (request: WorkerCreateRequest, serverUrl: string) => Promise<WorkerResponse>;
  stopWorker: (workerId: string, serverUrl: string) => Promise<void>;
  pauseWorker: (workerId: string, serverUrl: string) => Promise<void>;
  resumeWorker: (workerId: string, serverUrl: string) => Promise<void>;
}

export const useWorkersStore = create<WorkersState>((set, get) => ({
  workers: new Map(),
  loading: false,
  error: null,
  serverUrl: null,

  loadWorkers: async (serverUrl: string, flowId?: string | null, status?: string | null) => {
    set({ loading: true, error: null, serverUrl });
    try {
      const workers = await queryService.workers.list({ flowId: flowId || undefined, status: status || undefined });
      const workerMap = new Map(workers.map((w) => [w.worker_id, w]));
      set({ workers: workerMap, loading: false, serverUrl });
    } catch (error) {
      handleError(error, "Failed to load workers");
      set({
        loading: false,
      });
    }
  },

  loadWorker: async (workerId: string, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const worker = await queryService.workers.get(workerId);
      set((state) => ({
        workers: new Map(state.workers).set(workerId, worker),
        loading: false,
      }));
      return worker;
    } catch (error) {
      handleError(error, `Failed to load worker ${workerId}`);
      set({
        error: error instanceof Error ? error.message : "Failed to load worker",
        loading: false,
      });
      throw error;
    }
  },

  createWorker: async (request: WorkerCreateRequest, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const worker = await queryService.workers.create(request);
      set((state) => ({
        workers: new Map(state.workers).set(worker.worker_id, worker),
        loading: false,
      }));
      return worker;
    } catch (error) {
      handleError(error, "Failed to create worker");
      set({
        error: error instanceof Error ? error.message : "Failed to create worker",
        loading: false,
      });
      throw error;
    }
  },

  stopWorker: async (workerId: string, serverUrl: string) => {
    try {
      await queryService.workers.stop(workerId);
      set((state) => {
        const newWorkers = new Map(state.workers);
        newWorkers.delete(workerId);
        return { workers: newWorkers };
      });
    } catch (error) {
      handleError(error, "Failed to stop worker");
      set({
        error: error instanceof Error ? error.message : "Failed to stop worker",
      });
    }
  },

  pauseWorker: async (workerId: string, serverUrl: string) => {
    try {
      const worker = await queryService.workers.pause(workerId);
      set((state) => ({
        workers: new Map(state.workers).set(workerId, worker),
      }));
    } catch (error) {
      handleError(error, "Failed to pause worker");
      set({
        error: error instanceof Error ? error.message : "Failed to pause worker",
      });
    }
  },

  resumeWorker: async (workerId: string, serverUrl: string) => {
    try {
      const worker = await queryService.workers.resume(workerId);
      set((state) => ({
        workers: new Map(state.workers).set(workerId, worker),
      }));
    } catch (error) {
      handleError(error, "Failed to resume worker");
      set({
        error: error instanceof Error ? error.message : "Failed to resume worker",
      });
    }
  },
}));
