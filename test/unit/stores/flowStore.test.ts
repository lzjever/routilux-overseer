import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFlowStore } from "@/lib/stores/flowStore";
import { configureAPI, resetAPI } from "@/lib/services/api-client";
import { queryService } from "@/lib/services/query-service";

// Mock queryService
vi.mock("@/lib/services/query-service", () => ({
  queryService: {
    flows: {
      list: vi.fn(() =>
        Promise.resolve({
          flows: [
            { flow_id: "1", name: "Flow 1", routines: {}, connections: [] },
            { flow_id: "2", name: "Flow 2", routines: {}, connections: [] },
          ],
        })
      ),
      get: vi.fn((id: string) =>
        Promise.resolve({
          flow_id: id,
          name: `Flow ${id}`,
          routines: {
            routine1: {
              routine_id: "routine1",
              class_name: "TestRoutine",
              slots: ["slot1"],
              events: ["event1"],
              config: {},
            },
          },
          connections: [],
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

describe("useFlowStore", () => {
  beforeEach(() => {
    resetAPI();
    configureAPI("http://localhost:8000");
    vi.clearAllMocks();
  });

  describe("loadFlows", () => {
    it("should load flows successfully", async () => {
      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.loadFlows("http://localhost:8000");
      });

      expect(result.current.flows.size).toBe(2);
      expect(result.current.flows.get("1")?.name).toBe("Flow 1");
      expect(result.current.flows.get("2")?.name).toBe("Flow 2");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should set loading state during load", async () => {
      const { result } = renderHook(() => useFlowStore());

      act(() => {
        result.current.loadFlows("http://localhost:8000");
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should handle empty flows response", async () => {
      vi.mocked(queryService.flows.list).mockResolvedValueOnce({ flows: [] });

      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.loadFlows("http://localhost:8000");
      });

      expect(result.current.flows.size).toBe(0);
      expect(result.current.loading).toBe(false);
    });

    it("should handle API errors", async () => {
      vi.mocked(queryService.flows.list).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.loadFlows("http://localhost:8000");
      });

      expect(result.current.loading).toBe(false);
      // Error should be handled by handleError
    });
  });

  describe("selectFlow", () => {
    it("should load and select a flow", async () => {
      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.selectFlow("1", "http://localhost:8000");
      });

      expect(result.current.selectedFlowId).toBe("1");
      expect(result.current.flows.get("1")).toBeDefined();
      expect(result.current.nodes.length).toBe(1);
      expect(result.current.edges).toBeInstanceOf(Array);
      expect(result.current.loading).toBe(false);
    });

    it("should convert flow to nodes and edges", async () => {
      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.selectFlow("1", "http://localhost:8000");
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].id).toBe("routine1");
      expect(result.current.nodes[0].data.routineId).toBe("routine1");
      expect(result.current.nodes[0].data.className).toBe("TestRoutine");
    });

    it("should handle missing flow", async () => {
      vi.mocked(queryService.flows.get).mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.selectFlow("999", "http://localhost:8000");
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.nodes).toEqual([]);
      expect(result.current.edges).toEqual([]);
    });
  });

  describe("lock management", () => {
    it("should lock flow by default", () => {
      const { result } = renderHook(() => useFlowStore());

      expect(result.current.isFlowLocked("test-flow")).toBe(true);
    });

    it("should unlock flow", () => {
      const { result } = renderHook(() => useFlowStore());

      act(() => {
        result.current.unlockFlow("test-flow");
      });

      expect(result.current.isFlowLocked("test-flow")).toBe(false);
    });

    it("should lock unlocked flow", () => {
      const { result } = renderHook(() => useFlowStore());

      act(() => {
        result.current.unlockFlow("test-flow");
      });
      expect(result.current.isFlowLocked("test-flow")).toBe(false);

      act(() => {
        result.current.lockFlow("test-flow");
      });
      expect(result.current.isFlowLocked("test-flow")).toBe(true);
    });

    it("should update node deletable when unlocking selected flow", async () => {
      const { result } = renderHook(() => useFlowStore());

      // First select a flow
      await act(async () => {
        await result.current.selectFlow("1", "http://localhost:8000");
      });

      // Nodes should be locked initially (not deletable)
      expect(result.current.nodes[0].deletable).toBe(false);

      // Unlock the flow
      act(() => {
        result.current.unlockFlow("1");
      });

      // Nodes should now be deletable
      expect(result.current.nodes[0].deletable).toBe(true);
    });
  });

  describe("node and edge management", () => {
    it("should update nodes", () => {
      const { result } = renderHook(() => useFlowStore());

      const newNodes = [{ id: "test", type: "routine", position: { x: 0, y: 0 }, data: {} }];

      act(() => {
        result.current.setNodes(newNodes);
      });

      expect(result.current.nodes).toEqual(newNodes);
    });

    it("should update edges", () => {
      const { result } = renderHook(() => useFlowStore());

      const newEdges = [{ id: "e1", source: "n1", target: "n2" }];

      act(() => {
        result.current.setEdges(newEdges);
      });

      expect(result.current.edges).toEqual(newEdges);
    });

    it("should update node data", () => {
      const { result } = renderHook(() => useFlowStore());
      const initialNodes = [
        { id: "n1", type: "routine", position: { x: 0, y: 0 }, data: { name: "Node 1" } },
      ];

      act(() => {
        result.current.setNodes(initialNodes);
      });

      act(() => {
        result.current.updateNodeData("n1", { status: "active" });
      });

      expect(result.current.nodes[0].data).toEqual({ name: "Node 1", status: "active" });
    });
  });

  describe("clearFlow", () => {
    it("should clear selected flow", async () => {
      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.selectFlow("1", "http://localhost:8000");
      });

      expect(result.current.selectedFlowId).toBe("1");

      act(() => {
        result.current.clearFlow();
      });

      expect(result.current.selectedFlowId).toBe(null);
      expect(result.current.nodes).toEqual([]);
      expect(result.current.edges).toEqual([]);
    });
  });

  describe("updateEditMode", () => {
    it("should update all nodes and edges to editable", async () => {
      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.selectFlow("1", "http://localhost:8000");
      });

      act(() => {
        result.current.updateEditMode(true);
      });

      expect(result.current.nodes[0].deletable).toBe(true);
    });

    it("should update all nodes and edges to non-editable", async () => {
      const { result } = renderHook(() => useFlowStore());

      await act(async () => {
        await result.current.selectFlow("1", "http://localhost:8000");
      });

      act(() => {
        result.current.updateEditMode(true);
      });
      expect(result.current.nodes[0].deletable).toBe(true);

      act(() => {
        result.current.updateEditMode(false);
      });
      expect(result.current.nodes[0].deletable).toBe(false);
    });
  });
});
