import { create } from "zustand";
import { createAPI } from "@/lib/api";
import type { FlowListResponse, JobListResponse } from "@/lib/api/generated";

interface DiscoveryState {
  // Discovered items
  discoveredFlows: string[]; // Flow IDs
  discoveredJobs: string[]; // Job IDs
  discoveredWorkers: string[]; // Worker IDs
  
  // Sync status
  syncingFlows: boolean;
  syncingJobs: boolean;
  syncingWorkers: boolean;
  lastFlowSync: Date | null;
  lastJobSync: Date | null;
  lastWorkerSync: Date | null;
  
  // Auto-sync preference
  autoSync: boolean;
  
  // Actions
  discoverFlows: (serverUrl: string) => Promise<void>;
  syncFlows: (serverUrl: string) => Promise<number>; // Returns count of synced items
  discoverJobs: (serverUrl: string) => Promise<void>;
  syncJobs: (serverUrl: string) => Promise<number>; // Returns count of synced items
  discoverWorkers: (serverUrl: string) => Promise<void>;
  syncWorkers: (serverUrl: string) => Promise<number>; // Returns count of synced items
  setAutoSync: (enabled: boolean) => void;
  clear: () => void;
}

const AUTO_SYNC_KEY = "overseer_auto_sync";

const loadAutoSync = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(AUTO_SYNC_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
};

const saveAutoSync = (enabled: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTO_SYNC_KEY, JSON.stringify(enabled));
  } catch {
    // Ignore localStorage errors
  }
};

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  // Initial state
  discoveredFlows: [],
  discoveredJobs: [],
  discoveredWorkers: [],
  syncingFlows: false,
  syncingJobs: false,
  syncingWorkers: false,
  lastFlowSync: null,
  lastJobSync: null,
  lastWorkerSync: null,
  autoSync: loadAutoSync(),

  // Discover flows (read-only)
  discoverFlows: async (serverUrl: string) => {
    try {
      const api = createAPI(serverUrl);
      const response = await api.discovery.discoverFlows();
      if (response && response.flows) {
        const flowIds = response.flows.map((f) => f.flow_id);
        set({ discoveredFlows: flowIds });
      }
    } catch (error) {
      console.error("Failed to discover flows:", error);
      set({ discoveredFlows: [] });
    }
  },

  // Sync flows from registry to API store
  syncFlows: async (serverUrl: string) => {
    set({ syncingFlows: true });
    try {
      const api = createAPI(serverUrl);
      const response = await api.discovery.syncFlows();
      if (!response) {
        console.warn("Sync flows returned null response");
        set({ syncingFlows: false });
        return 0;
      }
      if (response && response.flows) {
        const flowIds = response.flows.map((f) => f.flow_id);
        console.log(`Synced ${flowIds.length} flows from registry:`, flowIds);
        set({
          discoveredFlows: [],
          lastFlowSync: new Date(),
          syncingFlows: false,
        });
        return flowIds.length;
      }
      console.warn("Sync flows response missing flows array:", response);
      set({ syncingFlows: false });
      return 0;
    } catch (error) {
      console.error("Failed to sync flows:", error);
      set({ syncingFlows: false });
      throw error;
    }
  },

  // Discover jobs (read-only)
  discoverJobs: async (serverUrl: string) => {
    try {
      const api = createAPI(serverUrl);
      const response = await api.discovery.discoverJobs();
      if (response && response.jobs) {
        const jobIds = response.jobs.map((j) => j.job_id);
        set({ discoveredJobs: jobIds });
      }
    } catch (error) {
      console.error("Failed to discover jobs:", error);
      set({ discoveredJobs: [] });
    }
  },

  // Sync jobs from registry to API store
  syncJobs: async (serverUrl: string) => {
    set({ syncingJobs: true });
    try {
      const api = createAPI(serverUrl);
      const response = await api.discovery.syncJobs();
      if (response && response.jobs) {
        const jobIds = response.jobs.map((j) => j.job_id);
        set({
          discoveredJobs: [],
          lastJobSync: new Date(),
          syncingJobs: false,
        });
        return jobIds.length;
      }
      set({ syncingJobs: false });
      return 0;
    } catch (error) {
      console.error("Failed to sync jobs:", error);
      set({ syncingJobs: false });
      throw error;
    }
  },

  // Discover workers (read-only)
  discoverWorkers: async (serverUrl: string) => {
    try {
      const api = createAPI(serverUrl);
      const response = await api.discovery.syncWorkers();
      const workers = response?.workers || response?.items || [];
      if (Array.isArray(workers)) {
        const workerIds = workers
          .map((w: any) => w.worker_id)
          .filter((id: any): id is string => typeof id === "string");
        set({ discoveredWorkers: workerIds });
      }
    } catch (error) {
      console.error("Failed to discover workers:", error);
      set({ discoveredWorkers: [] });
    }
  },

  // Sync workers from runtime to registry
  syncWorkers: async (serverUrl: string) => {
    set({ syncingWorkers: true });
    try {
      const api = createAPI(serverUrl);
      const response = await api.discovery.syncWorkers();
      const workers = response?.workers || response?.items || [];
      const workerIds = Array.isArray(workers)
        ? workers
            .map((w: any) => w.worker_id)
            .filter((id: any): id is string => typeof id === "string")
        : [];
      set({
        discoveredWorkers: [],
        lastWorkerSync: new Date(),
        syncingWorkers: false,
      });
      return workerIds.length;
    } catch (error) {
      console.error("Failed to sync workers:", error);
      set({ syncingWorkers: false });
      throw error;
    }
  },

  // Set auto-sync preference
  setAutoSync: (enabled: boolean) => {
    saveAutoSync(enabled);
    set({ autoSync: enabled });
  },

  // Clear all discovery state
  clear: () => {
    set({
      discoveredFlows: [],
      discoveredJobs: [],
      lastFlowSync: null,
      lastJobSync: null,
      lastWorkerSync: null,
    });
  },
}));
