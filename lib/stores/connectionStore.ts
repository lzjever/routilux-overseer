import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const RECENT_SERVERS_MAX = 3;

export interface ConnectionState {
  // State
  connected: boolean;
  serverUrl: string;
  serverVersion: string | null; // Routilux server version (from GET /)
  apiKey: string | null;
  connecting: boolean;
  error: string | null;
  lastConnected: string | null;
  hydrated: boolean; // Track if state has been hydrated from storage
  recentServerUrls: string[]; // Last N unique server URLs (sessionStorage)
  connectionDisplayName: string | null; // Optional label e.g. "Local", "Staging"
  connectionLost: boolean; // True when API/WS failed (network error or unexpected disconnect)

  // Actions
  setServerUrl: (url: string) => void;
  setServerVersion: (version: string | null) => void;
  setApiKey: (apiKey: string | null) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setLastConnected: (timestamp: string) => void;
  addRecentServerUrl: (url: string) => void;
  setConnectionDisplayName: (name: string | null) => void;
  setConnectionLost: (lost: boolean) => void;
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
      serverVersion: null,
      apiKey: null,
      connecting: false,
      error: null,
      lastConnected: null,
      hydrated: false,
      recentServerUrls: [],
      connectionDisplayName: null,
      connectionLost: false,

      // Actions
      setServerUrl: (url) => set({ serverUrl: url }),
      setServerVersion: (version) => set({ serverVersion: version }),
      setApiKey: (apiKey) => set({ apiKey }),

      setConnecting: (connecting) => set({ connecting }),

      setConnected: (connected) => set({ connected }),

      setError: (error) => set({ error }),

      setLastConnected: (timestamp) => set({ lastConnected: timestamp }),

      addRecentServerUrl: (url) =>
        set((state) => {
          const normalized = url.replace(/\/$/, "");
          const next = [
            normalized,
            ...state.recentServerUrls.filter((u) => u !== normalized),
          ].slice(0, RECENT_SERVERS_MAX);
          return { recentServerUrls: next };
        }),

      setConnectionDisplayName: (name) => set({ connectionDisplayName: name || null }),

      setConnectionLost: (lost) => set({ connectionLost: lost }),

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
          serverVersion: null,
          connectionLost: false,
        }),

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "overseer-connection-storage",
      // Use sessionStorage for better security (cleared when tab closes)
      storage: createJSONStorage(() => sessionStorage),
      // Only persist non-sensitive data; apiKey is kept in memory only
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        serverVersion: state.serverVersion,
        lastConnected: state.lastConnected,
        connected: state.connected,
        recentServerUrls: state.recentServerUrls,
        connectionDisplayName: state.connectionDisplayName,
        // Note: apiKey is intentionally NOT persisted for security
      }),
      onRehydrateStorage: () => (state) => {
        // Called when state is rehydrated from storage
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
