import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRuntimeStore } from "@/lib/stores/runtimeStore";
import { configureAPI, resetAPI } from "@/lib/services/api-client";
import { queryService } from "@/lib/services/query-service";

// Mock queryService
vi.mock("@/lib/services/query-service", () => ({
  queryService: {
    runtimes: {
      list: vi.fn(() =>
        Promise.resolve({
          runtimes: [
            { runtime_id: "python-3.11", name: "Python 3.11", version: "3.11.0" },
            { runtime_id: "node-18", name: "Node.js 18", version: "18.0.0" },
          ],
          default_runtime_id: "python-3.11",
        })
      ),
      get: vi.fn((id: string) =>
        Promise.resolve({
          runtime_id: id,
          name: `Runtime ${id}`,
          version: "1.0.0",
        })
      ),
    },
  },
}));

// Mock handleError
vi.mock("@/lib/errors", () => ({
  handleError: vi.fn((error: Error, context: string) => {
    console.error(`[${context}]`, error.message);
  }),
}));

describe("useRuntimeStore", () => {
  beforeEach(() => {
    resetAPI();
    configureAPI("http://localhost:8000");
    vi.clearAllMocks();
  });

  describe("loadRuntimes", () => {
    it("should load runtimes successfully", async () => {
      const { result } = renderHook(() => useRuntimeStore());

      await act(async () => {
        await result.current.loadRuntimes("http://localhost:8000");
      });

      expect(result.current.runtimes.size).toBe(2);
      expect(result.current.runtimes.get("python-3.11")?.name).toBe("Python 3.11");
      expect(result.current.runtimes.get("node-18")?.name).toBe("Node.js 18");
      expect(result.current.defaultRuntimeId).toBe("python-3.11");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should set loading state during load", async () => {
      const { result } = renderHook(() => useRuntimeStore());

      act(() => {
        result.current.loadRuntimes("http://localhost:8000");
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should handle API errors", async () => {
      vi.mocked(queryService.runtimes.list).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useRuntimeStore());

      await act(async () => {
        await result.current.loadRuntimes("http://localhost:8000");
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
    });
  });

  describe("getRuntime", () => {
    it("should get runtime by ID", async () => {
      const { result } = renderHook(() => useRuntimeStore());

      // First load runtimes
      await act(async () => {
        await result.current.loadRuntimes("http://localhost:8000");
      });

      const runtime = result.current.getRuntime("python-3.11");
      expect(runtime).toBeDefined();
      expect(runtime?.name).toBe("Python 3.11");
    });

    it("should return undefined for non-existent runtime", async () => {
      const { result } = renderHook(() => useRuntimeStore());

      await act(async () => {
        await result.current.loadRuntimes("http://localhost:8000");
      });

      const runtime = result.current.getRuntime("non-existent");
      expect(runtime).toBeUndefined();
    });
  });

  describe("getDefaultRuntime", () => {
    it("should get default runtime", async () => {
      const { result } = renderHook(() => useRuntimeStore());

      await act(async () => {
        await result.current.loadRuntimes("http://localhost:8000");
      });

      const defaultRuntime = result.current.getDefaultRuntime();
      expect(defaultRuntime).toBeDefined();
      expect(defaultRuntime?.runtime_id).toBe("python-3.11");
    });

    it("should return undefined when no default runtime", async () => {
      vi.mocked(queryService.runtimes.list).mockResolvedValueOnce({
        runtimes: [],
        default_runtime_id: null,
      });

      const { result } = renderHook(() => useRuntimeStore());

      await act(async () => {
        await result.current.loadRuntimes("http://localhost:8000");
      });

      const defaultRuntime = result.current.getDefaultRuntime();
      expect(defaultRuntime).toBeUndefined();
    });
  });
});
