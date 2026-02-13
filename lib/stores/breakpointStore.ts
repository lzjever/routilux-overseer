import { create } from "zustand";
import type { Breakpoint, BreakpointCreateRequest } from "@/lib/types/api";
import { queryService } from "@/lib/services";
import { handleError } from "@/lib/errors";

interface BreakpointState {
  breakpoints: Map<string, Breakpoint[]>;
  loading: boolean;
  error: string | null;

  // Actions
  loadBreakpoints: (jobId: string, serverUrl: string) => Promise<void>;
  addBreakpoint: (
    jobId: string,
    request: BreakpointCreateRequest,
    serverUrl: string
  ) => Promise<void>;
  removeBreakpoint: (jobId: string, breakpointId: string, serverUrl: string) => Promise<void>;
  toggleBreakpoint: (
    jobId: string,
    breakpointId: string,
    workerId: string,
    serverUrl: string
  ) => Promise<void>;
  clearBreakpoints: () => void;
}

export const useBreakpointStore = create<BreakpointState>((set, get) => ({
  breakpoints: new Map(),
  loading: false,
  error: null,

  loadBreakpoints: async (jobId: string, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const response = await queryService.breakpoints.list(jobId);

      set((state) => ({
        breakpoints: new Map(state.breakpoints).set(jobId, response.breakpoints),
        loading: false,
      }));
    } catch (error) {
      handleError(error, "Failed to load breakpoints");
      set({
        loading: false,
      });
    }
  },

  addBreakpoint: async (jobId: string, request: BreakpointCreateRequest, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      const response = await queryService.breakpoints.create(jobId, request);

      const currentBreakpoints = get().breakpoints.get(jobId) || [];
      set((state) => ({
        breakpoints: new Map(state.breakpoints).set(jobId, [...currentBreakpoints, response]),
        loading: false,
      }));
    } catch (error) {
      handleError(error, "Failed to add breakpoint");
      set({
        error: error instanceof Error ? error.message : "Failed to add breakpoint",
        loading: false,
      });
      throw error;
    }
  },

  removeBreakpoint: async (jobId: string, breakpointId: string, serverUrl: string) => {
    set({ loading: true, error: null });
    try {
      await queryService.breakpoints.delete(jobId, breakpointId);

      const currentBreakpoints = get().breakpoints.get(jobId) || [];
      set((state) => ({
        breakpoints: new Map(state.breakpoints).set(
          jobId,
          currentBreakpoints.filter((bp) => bp.breakpoint_id !== breakpointId)
        ),
        loading: false,
      }));
    } catch (error) {
      handleError(error, "Failed to remove breakpoint");
      set({
        error: error instanceof Error ? error.message : "Failed to remove breakpoint",
        loading: false,
      });
    }
  },

  toggleBreakpoint: async (
    jobId: string,
    breakpointId: string,
    workerId: string,
    serverUrl: string
  ) => {
    const currentBreakpoints = get().breakpoints.get(jobId) || [];
    const breakpoint = currentBreakpoints.find((bp) => bp.breakpoint_id === breakpointId);

    if (!breakpoint) return;

    try {
      // Use workers API for breakpoint enable/disable
      await queryService.workers.updateBreakpoint(workerId, breakpointId, !breakpoint.enabled);

      set((state) => {
        const updatedBreakpoints = currentBreakpoints.map((bp) =>
          bp.breakpoint_id === breakpointId ? { ...bp, enabled: !bp.enabled } : bp
        );
        return {
          breakpoints: new Map(state.breakpoints).set(jobId, updatedBreakpoints),
        };
      });
    } catch (error) {
      handleError(error, "Failed to toggle breakpoint");
      set({
        error: error instanceof Error ? error.message : "Failed to toggle breakpoint",
      });
    }
  },

  clearBreakpoints: () => {
    set({ breakpoints: new Map() });
  },
}));
