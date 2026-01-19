import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConnectionState {
  // State
  connected: boolean;
  serverUrl: string;
  apiKey: string | null;
  connecting: boolean;
  error: string | null;
  lastConnected: string | null;
  hydrated: boolean; // Track if state has been hydrated from localStorage

  // Actions
  setServerUrl: (url: string) => void;
  setApiKey: (apiKey: string | null) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setLastConnected: (timestamp: string) => void;
  reset: () => void;
  disconnect: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      // Initial state
      connected: false,
      serverUrl: "http://localhost:20555",
      apiKey: null,
      connecting: false,
      error: null,
      lastConnected: null,
      hydrated: false,

      // Actions
      setServerUrl: (url) => set({ serverUrl: url }),
      setApiKey: (apiKey) => set({ apiKey }),

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
          apiKey: null,
        }),

      disconnect: () =>
        set({
          connected: false,
          connecting: false,
          error: null,
        }),

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "overseer-connection-storage",
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        lastConnected: state.lastConnected,
        connected: state.connected,
        apiKey: state.apiKey,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when state is rehydrated from localStorage
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
