import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebSocketStore } from "@/lib/stores/websocket-store";

describe("useWebSocketStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useWebSocketStore());
    act(() => {
      result.current.reset();
    });
  });

  describe("initial state", () => {
    it("should have default values", () => {
      const { result } = renderHook(() => useWebSocketStore());

      expect(result.current.connected).toBe(false);
      expect(result.current.reconnectAttempts).toBe(0);
      expect(result.current.isReconnecting).toBe(false);
      expect(result.current.lastError).toBe(null);
    });
  });

  describe("setConnected", () => {
    it("should set connected state", () => {
      const { result } = renderHook(() => useWebSocketStore());

      act(() => {
        result.current.setConnected(true);
      });

      expect(result.current.connected).toBe(true);
      expect(result.current.lastError).toBe(null);
    });

    it("should clear lastError when setting connected", () => {
      const { result } = renderHook(() => useWebSocketStore());

      // First set an error
      const error = new Error("Test error");
      act(() => {
        result.current.setLastError(error);
      });
      expect(result.current.lastError).toBe(error);

      // Setting connected should clear the error
      act(() => {
        result.current.setConnected(true);
      });
      expect(result.current.lastError).toBe(null);
    });
  });

  describe("setReconnectState", () => {
    it("should set reconnect state", () => {
      const { result } = renderHook(() => useWebSocketStore());

      act(() => {
        result.current.setReconnectState(3, true);
      });

      expect(result.current.reconnectAttempts).toBe(3);
      expect(result.current.isReconnecting).toBe(true);
    });

    it("should update reconnect attempts", () => {
      const { result } = renderHook(() => useWebSocketStore());

      act(() => {
        result.current.setReconnectState(1, true);
      });
      expect(result.current.reconnectAttempts).toBe(1);

      act(() => {
        result.current.setReconnectState(2, true);
      });
      expect(result.current.reconnectAttempts).toBe(2);
    });

    it("should set isReconnecting to false", () => {
      const { result } = renderHook(() => useWebSocketStore());

      act(() => {
        result.current.setReconnectState(5, true);
      });
      expect(result.current.isReconnecting).toBe(true);

      act(() => {
        result.current.setReconnectState(0, false);
      });
      expect(result.current.isReconnecting).toBe(false);
    });
  });

  describe("setLastError", () => {
    it("should set last error", () => {
      const { result } = renderHook(() => useWebSocketStore());

      const error = new Error("Connection failed");
      act(() => {
        result.current.setLastError(error);
      });

      expect(result.current.lastError).toBe(error);
      expect(result.current.lastError?.message).toBe("Connection failed");
    });

    it("should clear error when setting null", () => {
      const { result } = renderHook(() => useWebSocketStore());

      const error = new Error("Test error");
      act(() => {
        result.current.setLastError(error);
      });
      expect(result.current.lastError).toBe(error);

      act(() => {
        result.current.setLastError(null);
      });
      expect(result.current.lastError).toBe(null);
    });
  });

  describe("reset", () => {
    it("should reset all state to default values", () => {
      const { result } = renderHook(() => useWebSocketStore());

      // Set some non-default values
      act(() => {
        result.current.setConnected(true);
        result.current.setReconnectState(3, true);
        result.current.setLastError(new Error("Test error"));
      });

      expect(result.current.connected).toBe(true);
      expect(result.current.reconnectAttempts).toBe(3);
      expect(result.current.isReconnecting).toBe(true);
      expect(result.current.lastError).not.toBe(null);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.connected).toBe(false);
      expect(result.current.reconnectAttempts).toBe(0);
      expect(result.current.isReconnecting).toBe(false);
      expect(result.current.lastError).toBe(null);
    });
  });
});
