import { create } from "zustand";

interface WebSocketState {
  connected: boolean;
  reconnectAttempts: number;
  isReconnecting: boolean;
  lastError: Error | null;

  setConnected: (connected: boolean) => void;
  setReconnectState: (attempts: number, isReconnecting: boolean) => void;
  setLastError: (error: Error | null) => void;
  reset: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  reconnectAttempts: 0,
  isReconnecting: false,
  lastError: null,

  setConnected: (connected) => set({ connected, lastError: null }),

  setReconnectState: (attempts, isReconnecting) =>
    set({ reconnectAttempts: attempts, isReconnecting }),

  setLastError: (error) => set({ lastError: error }),

  reset: () =>
    set({
      connected: false,
      reconnectAttempts: 0,
      isReconnecting: false,
      lastError: null,
    }),
}));
