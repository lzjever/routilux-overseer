import { create } from "zustand";
import { Edge, Node, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, MarkerType } from "reactflow";
import type { Slot, Event, FlowResponse, ConnectionInfo } from "@/lib/types/flow";
import type { RoutineInfo } from "@/lib/types/api";
import { queryService } from "@/lib/services";
import { handleError } from "@/lib/errors";
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
  lockedFlows: Set<string>;  // Default locked flows (all flows are locked by default)
  unlockedFlows: Set<string>;  // User-unlocked flows

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
  
  // Lock management
  isFlowLocked: (flowId: string) => boolean;
  unlockFlow: (flowId: string) => void;
  lockFlow: (flowId: string) => void;
  
  // Edit mode management
  updateEditMode: (isEditable: boolean) => void;
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
  lockedFlows: new Set<string>(),  // All flows are locked by default
  unlockedFlows: new Set<string>(),

  // Set server URL
  setServerUrl: (url) => set({ serverUrl: url }),

  // Load all flows
  loadFlows: async (serverUrl) => {
    set({ loading: true, error: null, serverUrl });
    try {
      const flows = await queryService.flows.list();
      if (!flows) {
        console.warn("API returned empty flows array");
        set({ flows: new Map(), loading: false, serverUrl });
        return;
      }
      const flowMap = new Map(flows.map((f) => [f.flow_id, f]));
      console.log(`Loaded ${flowMap.size} flows from server`);
      set({ flows: flowMap, loading: false, serverUrl });
    } catch (error) {
      handleError(error, "Failed to load flows");
      set({
        loading: false,
      });
    }
  },

  // Select and load a specific flow
  selectFlow: async (flowId, serverUrl) => {
    set({ loading: true, error: null, selectedFlowId: flowId, serverUrl });
    try {
      const flow = await queryService.flows.get(flowId);

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

      // Determine if flow is editable (unlocked)
      const isEditable = !get().isFlowLocked(flowId);
      const nodes = convertFlowToNodes(flow, isEditable);
      const edges = convertFlowToEdges(flow, isEditable);

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
      set((state) => ({
        flows: new Map(state.flows).set(flowId, flow),
        selectedFlowId: flowId,
        nodes: layoutedNodes,  // Set already-layouted nodes
        edges: layoutedEdges,
        loading: false,
        serverUrl,
      }));
    } catch (error) {
      handleError(error, `Failed to load flow ${flowId}`);
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

  // Check if flow is locked
  isFlowLocked: (flowId: string) => {
    const { unlockedFlows } = get();
    // Flow is locked if it's not in unlockedFlows (default locked)
    return !unlockedFlows.has(flowId);
  },

  // Unlock flow (user confirmed)
  unlockFlow: (flowId: string) => {
    const { unlockedFlows, nodes, edges, selectedFlowId } = get();
    const updated = new Set(unlockedFlows);
    updated.add(flowId);
    
    // Update deletable property when flow is unlocked (only for selected flow)
    if (selectedFlowId === flowId) {
      const updatedNodes = nodes.map(node => ({ ...node, deletable: true }));
      const updatedEdges = edges.map(edge => ({ ...edge, deletable: true }));
      set({ 
        unlockedFlows: updated,
        nodes: updatedNodes,
        edges: updatedEdges,
      });
    } else {
      set({ unlockedFlows: updated });
    }
  },

  // Lock flow
  lockFlow: (flowId: string) => {
    const { unlockedFlows, nodes, edges, selectedFlowId } = get();
    const updated = new Set(unlockedFlows);
    updated.delete(flowId);
    
    // Update deletable property when flow is locked (only for selected flow)
    if (selectedFlowId === flowId) {
      const updatedNodes = nodes.map(node => ({ ...node, deletable: false }));
      const updatedEdges = edges.map(edge => ({ ...edge, deletable: false }));
      set({ 
        unlockedFlows: updated,
        nodes: updatedNodes,
        edges: updatedEdges,
      });
    } else {
      set({ unlockedFlows: updated });
    }
  },
  
  // Update edit mode for all nodes and edges
  updateEditMode: (isEditable: boolean) => {
    const { nodes, edges } = get();
    const updatedNodes = nodes.map(node => ({ ...node, deletable: isEditable }));
    const updatedEdges = edges.map(edge => ({ ...edge, deletable: isEditable }));
    set({ nodes: updatedNodes, edges: updatedEdges });
  },
}));

// Helper functions
function convertFlowToNodes(flow: FlowResponse, isEditable: boolean = false): Node[] {
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
        deletable: isEditable, // Set deletable at creation time
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
    }).filter((node) => node !== null) as Node[];
    
    console.log(`convertFlowToNodes: converted ${nodes.length} nodes from ${Object.keys(flow.routines).length} routines`);
    return nodes;
  } catch (error) {
    console.error("Error converting flow to nodes:", error, flow);
    return [];
  }
}

function convertFlowToEdges(flow: FlowResponse, isEditable: boolean = false): Edge[] {
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
        deletable: isEditable,
        selectable: true,
        focusable: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          sourceEvent: conn.source_event,
          targetSlot: conn.target_slot,
          active: false,
        },
      };
    }).filter((edge) => edge !== null) as Edge[];
    
    console.log(`convertFlowToEdges: converted ${edges.length} edges from ${flow.connections.length} connections`);
    return edges;
  } catch (error) {
    console.error("Error converting flow to edges:", error, flow);
    return [];
  }
}
