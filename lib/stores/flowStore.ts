import { create } from "zustand";
import { Edge, Node, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from "reactflow";
import type { Slot, Event, FlowResponse, ConnectionInfo } from "@/lib/types/flow";
import type { RoutineInfo } from "@/lib/types/api";
import { createAPI } from "@/lib/api";
import { layoutNodes } from "@/lib/utils/flow-layout";

interface FlowState {
  // State
  flows: Map<string, FlowResponse>;
  selectedFlowId: string | null;
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
  error: string | null;
  serverUrl: string | null;

  // Actions
  loadFlows: (serverUrl: string) => Promise<void>;
  selectFlow: (flowId: string, serverUrl: string) => Promise<void>;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  updateNodeData: (nodeId: string, data: Partial<Node["data"]>) => void;
  clearFlow: () => void;
  setServerUrl: (url: string) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  // Initial state
  flows: new Map(),
  selectedFlowId: null,
  nodes: [],
  edges: [],
  loading: false,
  error: null,
  serverUrl: null,

  // Set server URL
  setServerUrl: (url) => set({ serverUrl: url }),

  // Load all flows
  loadFlows: async (serverUrl) => {
    set({ loading: true, error: null, serverUrl });
    try {
      const api = createAPI(serverUrl);
      const response = await api.flows.list();
      const flowMap = new Map(response.flows.map((f) => [f.flow_id, f]));
      set({ flows: flowMap, loading: false, serverUrl });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load flows",
        loading: false,
      });
    }
  },

  // Select and load a specific flow
  selectFlow: async (flowId, serverUrl) => {
    set({ loading: true, error: null, selectedFlowId: flowId });
    try {
      const api = createAPI(serverUrl);
      const flow = await api.flows.get(flowId);

      // Convert to ReactFlow format
      const nodes = convertFlowToNodes(flow);
      const edges = convertFlowToEdges(flow);

      // Calculate layout immediately to prevent ReactFlow from auto-positioning
      const { nodes: layoutedNodes, edges: layoutedEdges } = layoutNodes(
        nodes,
        edges,
        "TB"
      );

      // Update flows map with the loaded flow
      const { flows } = get();
      flows.set(flowId, flow);

      set({
        flows,
        selectedFlowId: flowId,
        nodes: layoutedNodes,  // Set already-layouted nodes
        edges: layoutedEdges,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load flow",
        loading: false,
      });
    }
  },

  // Set nodes
  setNodes: (nodes) => set({ nodes }),

  // Set edges
  setEdges: (edges) => set({ edges }),

  // Handle node changes
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  // Handle edge changes
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  // Update node data
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },

  // Clear flow
  clearFlow: () => {
    set({
      selectedFlowId: null,
      nodes: [],
      edges: [],
    });
  },
}));

// Helper functions
function convertFlowToNodes(flow: FlowResponse): Node[] {
  return Object.entries(flow.routines).map(([id, routine]) => ({
    id,
    type: "routine",
    position: { x: 0, y: 0 }, // Will be set by layout
    data: {
      routineId: routine.routine_id,
      className: routine.class_name,
      slots: routine.slots.map((name) => ({ name })) as Slot[],
      events: routine.events.map((name) => ({ name })) as Event[],
      config: routine.config,
      status: "pending" as const,
      executionCount: 0,
      lastExecutionTime: null,
      breakpoints: [],
    },
  }));
}

function convertFlowToEdges(flow: FlowResponse): Edge[] {
  return flow.connections.map((conn) => ({
    id: conn.connection_id,
    source: conn.source_routine,
    sourceHandle: conn.source_event,
    target: conn.target_routine,
    targetHandle: conn.target_slot,
    type: "connection",
    animated: false,
    data: {
      sourceRoutine: conn.source_routine,
      sourceEvent: conn.source_event,
      targetRoutine: conn.target_routine,
      targetSlot: conn.target_slot,
      paramMapping: conn.param_mapping,
      active: false,
      lastActivity: null,
    },
  }));
}
