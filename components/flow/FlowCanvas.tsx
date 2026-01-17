"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  Panel,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { RoutineNode } from "./RoutineNode";
import { ConnectionEdge, ConnectionEdgeData } from "./ConnectionEdge";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { useJobStateStore } from "@/lib/stores/jobStateStore";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { RoutineDetailPanel } from "@/components/job/RoutineDetailPanel";
import { layoutNodes } from "@/lib/utils/flow-layout";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { BreakpointCreateRequest } from "@/lib/api/generated";

interface FlowCanvasProps {
  flowId?: string;
  jobId?: string;
  editable?: boolean;
}

export function FlowCanvas({ flowId, jobId, editable = false }: FlowCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    updateNodeData,
    setEdges,
    serverUrl,
    selectedFlowId,
  } = useFlowStore();
  const { selectedRoutine, selectRoutine, closeDetailPanel } = useUIStore();
  const { jobStates } = useJobStateStore();
  const { breakpoints, addBreakpoint, removeBreakpoint } = useBreakpointStore();
  const [pendingConnectionBp, setPendingConnectionBp] = useState<Edge | null>(null);

  // Memoize nodeTypes and edgeTypes to prevent recreation on each render
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      routine: RoutineNode,
    }),
    []
  );

  const edgeTypes = useMemo<EdgeTypes>(
    () => ({
      connection: ConnectionEdge,
    }),
    []
  );

  // Auto-fit view when flow changes or nodes are loaded
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        if (typeof window !== "undefined" && (window as any).reactFlowInstance) {
          (window as any).reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }
      }, 100);
    }
  }, [flowId, nodes.length]);

  const handleFitView = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).reactFlowInstance) {
      (window as any).reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).reactFlowInstance) {
      (window as any).reactFlowInstance.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).reactFlowInstance) {
      (window as any).reactFlowInstance.zoomOut();
    }
  }, []);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();

    if (!jobId || !flowId) return;

    // Get serverUrl from flowStore
    const flowServerUrl = useFlowStore.getState().serverUrl;
    if (!flowServerUrl) return;

    // Select routine and show detail panel
    selectRoutine({
      routineId: node.id,
      jobId,
      flowId,
    });
  }, [jobId, flowId, selectRoutine]);

  // Handle edge click for connection breakpoints
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();

    if (!jobId || !serverUrl || !flowId) return;

    const edgeData = edge.data as ConnectionEdgeData;

    // Check if there's already a breakpoint on this connection
    const jobBreakpoints = breakpoints.get(jobId) || [];
    const existingBp = jobBreakpoints.find(
      (bp) =>
        bp.type === "connection" &&
        bp.source_event_name === edgeData?.sourceEvent &&
        bp.target_routine_id === edge.target &&
        bp.target_slot_name === edgeData?.targetSlot
    );

    if (existingBp) {
      // Remove the breakpoint
      removeBreakpoint(jobId, existingBp.breakpoint_id, serverUrl);
    } else {
      // Create a new connection breakpoint
      const request: BreakpointCreateRequest = {
        type: BreakpointCreateRequest.type.CONNECTION,
        source_routine_id: edge.source,
        source_event_name: edgeData?.sourceEvent || edge.sourceHandle,
        target_routine_id: edge.target,
        target_slot_name: edgeData?.targetSlot || edge.targetHandle,
      };

      addBreakpoint(jobId, request, serverUrl).catch((err) => {
        console.error("Failed to add connection breakpoint:", err);
      });
    }
  }, [jobId, serverUrl, flowId, breakpoints, addBreakpoint, removeBreakpoint]);

  // Update nodes with routine state and breakpoints
  // Use refs to track previous values and avoid unnecessary updates
  useEffect(() => {
    if (!jobId || !nodes.length) return;

    const jobState = jobStates.get(jobId);
    const jobBreakpoints = breakpoints.get(jobId) || [];

    // Update each node's data
    nodes.forEach((node) => {
      const routineId = node.id;
      const routineState = jobState?.routine_states[routineId];
      const nodeBreakpoints = jobBreakpoints.filter((bp) => bp.routine_id === routineId);

      updateNodeData(routineId, {
        routineState,
        breakpoints: nodeBreakpoints,
        onToggleBreakpoint: () => {
          if (jobId && flowId) {
            selectRoutine({ routineId, jobId, flowId });
          }
        },
        onViewDetails: () => {
          if (jobId && flowId) {
            selectRoutine({ routineId, jobId, flowId });
          }
        },
        onPauseAtRoutine: () => {
          console.log("Pause at routine:", routineId);
        },
      });
    });

    // Update edges to show connection breakpoints
    const updatedEdges = edges.map((edge) => {
      const edgeData = edge.data as ConnectionEdgeData;
      const hasBreakpoint = jobBreakpoints.some(
        (bp) =>
          bp.type === "connection" &&
          bp.source_event_name === (edgeData?.sourceEvent || edge.sourceHandle) &&
          bp.target_routine_id === edge.target &&
          bp.target_slot_name === (edgeData?.targetSlot || edge.targetHandle)
      );

      return {
        ...edge,
        data: {
          ...edgeData,
          hasBreakpoint,
        },
      };
    });

    setEdges(updatedEdges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, breakpoints]);

  // Debug logging
  useEffect(() => {
    console.log("FlowCanvas render:", {
      flowId,
      selectedFlowId,
      nodesCount: nodes.length,
      edgesCount: edges.length,
      match: flowId === selectedFlowId,
    });
  }, [flowId, selectedFlowId, nodes.length, edges.length]);

  // Show message if flow is not selected or no nodes/edges are loaded
  if (flowId && flowId !== selectedFlowId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Flow not loaded</p>
          <p className="text-xs mt-2">Loading flow {flowId}... (selectedFlowId: {selectedFlowId || "null"})</p>
        </div>
      </div>
    );
  }

  // Show message if no nodes/edges are loaded
  if (nodes.length === 0 && edges.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No flow data available</p>
          <p className="text-xs mt-2">
            {flowId ? (
              <>
                Flow {flowId} has no routines or connections
                <br />
                (selectedFlowId: {selectedFlowId || "null"}, nodes: {nodes.length}, edges: {edges.length})
              </>
            ) : (
              "Select a flow to view"
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          className="bg-background"
          onInit={(instance) => {
            (window as any).reactFlowInstance = instance;
            // Fit view after initialization
            setTimeout(() => {
              instance.fitView({ padding: 0.2, duration: 800 });
            }, 100);
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeColor="#888"
            maskColor="rgba(0, 0, 0, 0.1)"
            pannable
            zoomable
          />

          {/* Custom controls panel */}
          <Panel position="top-right" className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFitView}
              title="Fit view"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Routine Detail Panel */}
      {selectedRoutine && selectedRoutine.jobId === jobId && (
        <RoutineDetailPanel
          routineId={selectedRoutine.routineId}
          jobId={selectedRoutine.jobId}
          flowId={selectedRoutine.flowId}
          serverUrl={useFlowStore.getState().serverUrl || ""}
        />
      )}
    </>
  );
}
