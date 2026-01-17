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
import { useJobStore } from "@/lib/stores/jobStore";
import { RoutineDetailPanel } from "@/components/job/RoutineDetailPanel";
import { layoutNodes } from "@/lib/utils/flow-layout";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { BreakpointCreateRequest } from "@/lib/api/generated";
import { calculateNodeHeat, calculateEdgeHeat, getHeatBorderColor, getHeatStrokeColor, getHeatStrokeWidth } from "@/lib/utils/heatmap";

interface FlowCanvasProps {
  flowId?: string;
  jobId?: string;
  editable?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
}

export function FlowCanvas({
  flowId,
  jobId,
  editable = false,
  onNodeClick: onNodeClickProp,
  onEdgeClick: onEdgeClickProp,
}: FlowCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    updateNodeData,
    setEdges,
    serverUrl,
    selectedFlowId,
    isFlowLocked,
  } = useFlowStore();
  const { selectedRoutine, selectRoutine, closeDetailPanel } = useUIStore();
  const { jobStates } = useJobStateStore();
  const { breakpoints, addBreakpoint, removeBreakpoint } = useBreakpointStore();
  const { monitoringData } = useJobStore();
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
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();

      // If onNodeClickProp is provided, use it (for job page selection)
      if (onNodeClickProp) {
        onNodeClickProp(node.id);
        return;
      }

      // Otherwise, use existing behavior (for routine detail panel)
      if (!jobId || !flowId) return;

      const flowServerUrl = useFlowStore.getState().serverUrl;
      if (!flowServerUrl) return;

      selectRoutine({
        routineId: node.id,
        jobId,
        flowId,
      });
    },
    [jobId, flowId, selectRoutine, onNodeClickProp]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();

      // If onEdgeClickProp is provided, use it (for job page selection)
      if (onEdgeClickProp) {
        onEdgeClickProp(edge.id);
        return;
      }

      // Otherwise, use existing behavior (for breakpoints - but breakpoints are now routine-only)
      // Edge clicks in job context should just select the edge
      if (jobId && flowId) {
        // Could still show edge details if needed
      }
    },
    [jobId, flowId, onEdgeClickProp]
  );

  // Update nodes with routine state, breakpoints, and heat visualization
  useEffect(() => {
    if (!jobId || !nodes.length) return;

    const jobState = jobStates.get(jobId);
    const jobBreakpoints = breakpoints.get(jobId) || [];
    const monitoring = monitoringData.get(jobId);

    // Update each node's data with heat visualization
    nodes.forEach((node) => {
      const routineId = node.id;
      const routineState = jobState?.routine_states?.[routineId];
      const nodeBreakpoints = jobBreakpoints.filter((bp) => bp.routine_id === routineId);

      // Calculate heat if monitoring data is available
      let heat = 0;
      let heatBorderColor = "";
      if (monitoring && monitoring.routines[routineId]) {
        heat = calculateNodeHeat(monitoring.routines[routineId]);
        heatBorderColor = getHeatBorderColor(heat);
      }

      updateNodeData(routineId, {
        routineState,
        breakpoints: nodeBreakpoints,
        heat,
        heatBorderColor,
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
      });
    });

    // Update edges with heat visualization
    const updatedEdges = edges.map((edge) => {
      const edgeData = edge.data as ConnectionEdgeData;
      const hasBreakpoint = jobBreakpoints.some(
        (bp) =>
          bp.type === "connection" &&
          bp.source_event_name === (edgeData?.sourceEvent || edge.sourceHandle) &&
          bp.target_routine_id === edge.target &&
          bp.target_slot_name === (edgeData?.targetSlot || edge.targetHandle)
      );

      // Calculate edge heat if monitoring data is available
      let heat = 0;
      let strokeColor = "";
      let strokeWidth = 1;
      if (monitoring && monitoring.routines[edge.target]) {
        const targetRoutine = monitoring.routines[edge.target];
        const queueStatus = targetRoutine.queue_status.find(
          (q) => q.slot_name === (edgeData?.targetSlot || edge.targetHandle)
        );
        if (queueStatus) {
          heat = calculateEdgeHeat(queueStatus);
          strokeColor = getHeatStrokeColor(heat);
          strokeWidth = getHeatStrokeWidth(heat);
        }
      }

      return {
        ...edge,
        style: {
          ...edge.style,
          stroke: strokeColor || edge.style?.stroke,
          strokeWidth: strokeWidth,
        },
        data: {
          ...edgeData,
          hasBreakpoint,
          heat,
        },
      };
    });

    setEdges(updatedEdges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, breakpoints, monitoringData]);

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

  // Determine if flow is actually editable (must be unlocked AND editable prop is true)
  const isEditable = editable && flowId ? !isFlowLocked(flowId) : false;

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
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          edgesDeletable={isEditable}
          nodesDeletable={isEditable}
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
