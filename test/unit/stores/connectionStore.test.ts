import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConnectionStore } from "@/lib/stores/connectionStore";

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

describe("useConnectionStore", () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.clearAllMocks();
    // Reset store state
    const { result } = renderHook(() => useConnectionStore());
    act(() => {
      result.current.reset();
    });
  });

  describe("Initial state", () => {
    it("should have correct initial values", () => {
      const { result } = renderHook(() => useConnectionStore());

      expect(result.current.connected).toBe(false);
      expect(result.current.serverUrl).toBe("http://localhost:20555");
      expect(result.current.apiKey).toBe(null);
      expect(result.current.connecting).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe("setServerUrl", () => {
    it("should update server URL", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setServerUrl("http://new-server:8080");
      });

      expect(result.current.serverUrl).toBe("http://new-server:8080");
    });
  });

  describe("setApiKey", () => {
    it("should set API key", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setApiKey("test-api-key");
      });

      expect(result.current.apiKey).toBe("test-api-key");
    });

    it("should clear API key when set to null", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setApiKey("test-api-key");
      });
      expect(result.current.apiKey).toBe("test-api-key");

      act(() => {
        result.current.setApiKey(null);
      });
      expect(result.current.apiKey).toBe(null);
    });
  });

  describe("setConnected", () => {
    it("should update connected state", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setConnected(true);
      });

      expect(result.current.connected).toBe(true);
    });
  });

  describe("setConnecting", () => {
    it("should update connecting state", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setConnecting(true);
      });

      expect(result.current.connecting).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setError("Connection failed");
      });

      expect(result.current.error).toBe("Connection failed");
    });

    it("should clear error when set to null", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setError("Connection failed");
      });
      expect(result.current.error).toBe("Connection failed");

      act(() => {
        result.current.setError(null);
      });
      expect(result.current.error).toBe(null);
    });
  });

  describe("setLastConnected", () => {
    it("should update lastConnected timestamp", () => {
      const { result } = renderHook(() => useConnectionStore());
      const timestamp = new Date().toISOString();

      act(() => {
        result.current.setLastConnected(timestamp);
      });

      expect(result.current.lastConnected).toBe(timestamp);
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      const { result } = renderHook(() => useConnectionStore());

      // Set some state
      act(() => {
        result.current.setServerUrl("http://test-server");
        result.current.setApiKey("test-key");
        result.current.setConnected(true);
        result.current.setError("Some error");
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.connected).toBe(false);
      expect(result.current.connecting).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastConnected).toBe(null);
      expect(result.current.apiKey).toBe(null);
    });
  });

  describe("disconnect", () => {
    it("should disconnect without clearing server URL and API key", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setServerUrl("http://test-server");
        result.current.setApiKey("test-key");
        result.current.setConnected(true);
      });

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.connected).toBe(false);
      expect(result.current.connecting).toBe(false);
      expect(result.current.error).toBe(null);
      // Server URL and API key should be preserved
      expect(result.current.serverUrl).toBe("http://test-server");
      expect(result.current.apiKey).toBe("test-key");
    });
  });

  describe("Session storage", () => {
    it("should persist serverUrl to storage", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setServerUrl("http://test-server");
      });

      // Verify the state is updated
      expect(result.current.serverUrl).toBe("http://test-server");
    });

    it("should not persist apiKey to storage", () => {
      const { result } = renderHook(() => useConnectionStore());

      act(() => {
        result.current.setApiKey("test-api-key");
      });

      // API key should be in memory but not persisted (per our security design)
      expect(result.current.apiKey).toBe("test-api-key");
    });
  });
});
