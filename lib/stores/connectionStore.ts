import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConnectionState {
  // State
  connected: boolean;
  serverUrl: string;
  connecting: boolean;
  error: string | null;
  lastConnected: string | null;

  // Actions
  setServerUrl: (url: string) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setLastConnected: (timestamp: string) => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      // Initial state
      connected: false,
      serverUrl: "http://localhost:20555",
      connecting: false,
      error: null,
      lastConnected: null,

      // Actions
      setServerUrl: (url) => set({ serverUrl: url }),

      setConnecting: (connecting) => set({ connecting }),

      setConnected: (connected) => set({ connected }),

      setError: (error) => set({ error }),

      setLastConnected: (timestamp) => set({ lastConnected: timestamp }),

      reset: () =>
        set({
          connected: false,
          connecting: false,
          error: null,
          lastConnected: null,
        }),
    }),
    {
      name: "routilux-connection-storage",
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        lastConnected: state.lastConnected,
        connected: state.connected,
      }),
    }
  )
);
