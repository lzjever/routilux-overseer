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
      if (!response) {
        throw new Error("No response from API");
      }
      if (!response.flows) {
        console.warn("API response missing flows array:", response);
        set({ flows: new Map(), loading: false, serverUrl });
        return;
      }
      const flowMap = new Map(response.flows.map((f) => [f.flow_id, f]));
      console.log(`Loaded ${flowMap.size} flows from server`);
      set({ flows: flowMap, loading: false, serverUrl });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load flows";
      console.error("Failed to load flows:", error);
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  // Select and load a specific flow
  selectFlow: async (flowId, serverUrl) => {
    set({ loading: true, error: null, selectedFlowId: flowId, serverUrl });
    try {
      const api = createAPI(serverUrl);
      const flow = await api.flows.get(flowId);

      if (!flow) {
        throw new Error("Flow not found");
      }

      console.log(`Loading flow ${flowId}:`, {
        routines: Object.keys(flow.routines).length,
        connections: flow.connections.length,
      });

      // Convert to ReactFlow format
      console.log("Flow data before conversion:", {
        flowId: flow.flow_id,
        routines: flow.routines,
        routinesKeys: Object.keys(flow.routines),
        routinesCount: Object.keys(flow.routines).length,
        connections: flow.connections,
        connectionsCount: flow.connections?.length || 0,
      });

      const nodes = convertFlowToNodes(flow);
      const edges = convertFlowToEdges(flow);

      console.log(`Converted to ReactFlow format:`, {
        nodes: nodes.length,
        edges: edges.length,
        nodeIds: nodes.map(n => n.id),
        edgeIds: edges.map(e => e.id),
      });

      // Calculate layout immediately to prevent ReactFlow from auto-positioning
      const { nodes: layoutedNodes, edges: layoutedEdges } = layoutNodes(
        nodes,
        edges,
        "TB"
      );

      console.log(`Layout calculated:`, {
        nodes: layoutedNodes.length,
        edges: layoutedEdges.length,
      });

      // Update flows map with the loaded flow
      const { flows } = get();
      flows.set(flowId, flow);

      set({
        flows,
        selectedFlowId: flowId,
        nodes: layoutedNodes,  // Set already-layouted nodes
        edges: layoutedEdges,
        loading: false,
        serverUrl,
      });
    } catch (error) {
      console.error(`Failed to load flow ${flowId}:`, error);
      set({
        error: error instanceof Error ? error.message : "Failed to load flow",
        loading: false,
        nodes: [],
        edges: [],
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
  if (!flow.routines || typeof flow.routines !== 'object') {
    console.error("Invalid flow.routines:", flow.routines);
    return [];
  }

  try {
    const nodes = Object.entries(flow.routines).map(([id, routine]) => {
      if (!routine) {
        console.warn(`Routine ${id} is null or undefined`);
        return null;
      }
      return {
        id,
        type: "routine",
        position: { x: 0, y: 0 }, // Will be set by layout
        data: {
          routineId: routine.routine_id || id,
          className: routine.class_name || "",
          slots: (routine.slots || []).map((name) => ({ name })) as Slot[],
          events: (routine.events || []).map((name) => ({ name })) as Event[],
          config: routine.config || {},
          status: "pending" as const,
          executionCount: 0,
          lastExecutionTime: null,
          breakpoints: [],
        },
      };
    }).filter((node): node is Node => node !== null);
    
    console.log(`convertFlowToNodes: converted ${nodes.length} nodes from ${Object.keys(flow.routines).length} routines`);
    return nodes;
  } catch (error) {
    console.error("Error converting flow to nodes:", error, flow);
    return [];
  }
}

function convertFlowToEdges(flow: FlowResponse): Edge[] {
  if (!flow.connections || !Array.isArray(flow.connections)) {
    console.error("Invalid flow.connections:", flow.connections);
    return [];
  }

  try {
    const edges = flow.connections.map((conn, index) => {
      if (!conn) {
        console.warn(`Connection at index ${index} is null or undefined`);
        return null;
      }
      return {
        id: conn.connection_id || `conn-${index}`,
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
          paramMapping: conn.param_mapping || null,
          active: false,
          lastActivity: null,
        },
      };
    }).filter((edge): edge is Edge => edge !== null);
    
    console.log(`convertFlowToEdges: converted ${edges.length} edges from ${flow.connections.length} connections`);
    return edges;
  } catch (error) {
    console.error("Error converting flow to edges:", error, flow);
    return [];
  }
}
