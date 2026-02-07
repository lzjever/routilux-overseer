import { create } from "zustand";
import { queryService } from "@/lib/services";
import { handleError } from "@/lib/errors";
import type { RuntimeInfo, RuntimeListResponse } from "@/lib/api/generated";

interface RuntimeStore {
  runtimes: Map<string, RuntimeInfo>;
  defaultRuntimeId: string | null;
  loading: boolean;
  error: Error | null;

  loadRuntimes: (serverUrl: string) => Promise<void>;
  getRuntime: (runtimeId: string) => RuntimeInfo | undefined;
  getDefaultRuntime: () => RuntimeInfo | undefined;
}

export const useRuntimeStore = create<RuntimeStore>((set, get) => ({
  // Initial state
  runtimes: new Map(),
  defaultRuntimeId: null,
  loading: false,
  error: null,

  // Load all runtimes
  loadRuntimes: async (serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const response: RuntimeListResponse = await queryService.runtimes.list();

      const runtimesMap = new Map<string, RuntimeInfo>();
      response.runtimes.forEach((runtime) => {
        runtimesMap.set(runtime.runtime_id, runtime);
      });

      set({
        runtimes: runtimesMap,
        defaultRuntimeId: response.default_runtime_id || null,
        loading: false,
      });
    } catch (error) {
      handleError(error, "Failed to load runtimes");
      set({
        error: error instanceof Error ? error : new Error("Failed to load runtimes"),
        loading: false,
      });
    }
  },

  // Get runtime by ID
  getRuntime: (runtimeId: string) => {
    return get().runtimes.get(runtimeId);
  },

  // Get default runtime
  getDefaultRuntime: () => {
    const { defaultRuntimeId, runtimes } = get();
    if (!defaultRuntimeId) return undefined;
    return runtimes.get(defaultRuntimeId);
  },
}));
