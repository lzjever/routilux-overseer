import { create } from "zustand";
import type { ExecutionRecord } from "@/lib/types/api";

interface JobEventsState {
  events: Map<string, ExecutionRecord[]>; // jobId -> events
  maxEventsPerJob: number;

  // Actions
  addEvent: (jobId: string, event: ExecutionRecord) => void;
  getEvents: (jobId: string) => ExecutionRecord[];
  clearEvents: (jobId: string) => void;
}

export const useJobEventsStore = create<JobEventsState>((set, get) => ({
  events: new Map(),
  maxEventsPerJob: 100, // Keep only the latest 100 events per job

  addEvent: (jobId: string, event: ExecutionRecord) => {
    set((state) => {
      const jobEvents = state.events.get(jobId) || [];
      const newEvents = [...jobEvents, event].slice(-state.maxEventsPerJob); // Keep only latest N events

      const updatedEvents = new Map(state.events);
      updatedEvents.set(jobId, newEvents);

      return { events: updatedEvents };
    });
  },

  getEvents: (jobId: string) => {
    const { events } = get();
    return events.get(jobId) || [];
  },

  clearEvents: (jobId: string) => {
    set((state) => {
      const updatedEvents = new Map(state.events);
      updatedEvents.delete(jobId);
      return { events: updatedEvents };
    });
  },
}));
