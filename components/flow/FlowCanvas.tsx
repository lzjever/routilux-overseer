"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
  Node,
  Edge,
  Connection,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { RoutineNode } from "./RoutineNode";
import { ConnectionEdgeData } from "./ConnectionEdge";
import { nodeTypes, edgeTypes, defaultEdgeOptions } from "./flowTypes";
import {
  DeleteConfirmDialog,
  DeleteItem,
  getAffectedConnections,
} from "./DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { useJobStateStore } from "@/lib/stores/jobStateStore";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { useJobStore } from "@/lib/stores/jobStore";
import { RoutineDetailPanel } from "@/components/job/RoutineDetailPanel";
import { layoutNodes } from "@/lib/utils/flow-layout";
import { ZoomIn, ZoomOut, Maximize, Lock } from "lucide-react";
import { BreakpointCreateRequest } from "@/lib/api/generated";
import { calculateNodeHeat, calculateEdgeHeat, getHeatBorderColor, getHeatStrokeColor, getHeatStrokeWidth } from "@/lib/utils/heatmap";
import { createAPI } from "@/lib/api";
import { toast } from "sonner";

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
    selectFlow,
    updateEditMode,
  } = useFlowStore();
  const { selectedRoutine, selectRoutine, closeDetailPanel } = useUIStore();
  const { jobStates } = useJobStateStore();
  const { breakpoints, addBreakpoint, removeBreakpoint } = useBreakpointStore();
  const { monitoringData } = useJobStore();
  const [pendingConnectionBp, setPendingConnectionBp] = useState<Edge | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItems, setDeleteItems] = useState<DeleteItem[]>([]);
  const [affectedConnections, setAffectedConnections] = useState<
    { sourceRoutine: string; sourceEvent: string; targetRoutine: string; targetSlot: string }[]
  >([]);

  // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
  const stableNodeTypes = useMemo(() => nodeTypes, []);
  const stableEdgeTypes = useMemo(() => edgeTypes, []);
  const stableDefaultEdgeOptions = useMemo(() => defaultEdgeOptions, []);

  // Determine if flow is actually editable (must be unlocked AND editable prop is true)
  const isEditable = editable && flowId ? !isFlowLocked(flowId) : false;
  // In lock mode, allow dragging and viewing but not editing (connect/delete)
  const isLocked = flowId ? isFlowLocked(flowId) : false;
  
  // Update edit mode in store when isEditable changes
  useEffect(() => {
    if (flowId && flowId === selectedFlowId) {
      updateEditMode(isEditable);
    }
  }, [isEditable, flowId, selectedFlowId, updateEditMode]);

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

  // Handle connection creation via drag-and-drop
  const handleConnect = useCallback(async (connection: Connection) => {
    if (!flowId || !serverUrl || isFlowLocked(flowId) || !connection.sourceHandle || !connection.targetHandle) {
      return;
    }

    try {
      const api = createAPI(serverUrl);
      await api.flows.addConnection(flowId, {
        source_routine: connection.source,
        source_event: connection.sourceHandle,
        target_routine: connection.target,
        target_slot: connection.targetHandle,
      });
      
      // Add edge to existing edges without re-layout
      // Get the new connection index from the API response or calculate it
      const flow = await api.flows.get(flowId);
      const connectionIndex = flow.connections.length - 1;
      const newConn = flow.connections[connectionIndex];
      
      const newEdge: Edge = {
        id: newConn.connection_id || `conn-${connectionIndex}`,
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        target: connection.target,
        targetHandle: connection.targetHandle,
        type: "connection",
        selectable: true,
        focusable: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          sourceEvent: connection.sourceHandle,
          targetSlot: connection.targetHandle,
          active: false,
        },
      };
      
      // Add edge to existing edges without re-layout
      const { edges: currentEdges, flows: currentFlows } = useFlowStore.getState();
      const newEdgeWithDeletable: Edge = {
        ...newEdge,
        deletable: isEditable, // Use current edit mode
      };
      const updatedFlows = new Map(currentFlows);
      updatedFlows.set(flowId, flow);
      
      useFlowStore.setState({
        edges: [...currentEdges, newEdgeWithDeletable],
        flows: updatedFlows,
      });
    } catch (error) {
      // Show error message
      const errorMessage = error instanceof Error ? error.message : "Failed to create connection";
      toast.error("Failed to create connection", {
        description: errorMessage,
      });
      console.error("Connection creation error:", error);
    }
  }, [flowId, serverUrl, isFlowLocked]);

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
    if (!nodes.length) return;

    // If no jobId, just set mode to 'flow' for all nodes
    if (!jobId) {
      nodes.forEach((node) => {
        updateNodeData(node.id, {
          mode: 'flow',
        });
      });
      return;
    }

    // Job mode: update with job-specific data
    const jobState = jobStates.get(jobId);
    const jobBreakpoints = breakpoints.get(jobId) || [];
    const monitoring = monitoringData.get(jobId);

    // Update each node's data with heat visualization
    nodes.forEach((node) => {
      const routineId = node.id;
      const routineState = jobId ? jobState?.routine_states?.[routineId] : undefined;
      const nodeBreakpoints = jobId ? jobBreakpoints.filter((bp) => bp.routine_id === routineId) : [];

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
        mode: jobId ? 'job' : 'flow', // Set mode based on jobId
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

    // Update edges with heat visualization (only if jobId is provided)
    if (jobId && monitoring) {
      const updatedEdges = edges.map((edge) => {
        const edgeData = edge.data as ConnectionEdgeData;

        // Calculate edge heat if monitoring data is available
        let strokeColor = "";
        let strokeWidth = 2;
        if (monitoring.routines[edge.target]) {
          const targetRoutine = monitoring.routines[edge.target];
          const queueStatus = targetRoutine.queue_status.find(
            (q) => q.slot_name === (edgeData?.targetSlot || edge.targetHandle)
          );
          if (queueStatus) {
            const heat = calculateEdgeHeat(queueStatus);
            strokeColor = getHeatStrokeColor(heat);
            strokeWidth = getHeatStrokeWidth(heat);
          }
        }

        return {
          ...edge,
          style: strokeColor ? { stroke: strokeColor, strokeWidth } : edge.style,
        };
      });

      setEdges(updatedEdges);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, breakpoints, monitoringData, nodes.length]);

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

  // Keyboard deletion support - opens confirmation dialog
  useEffect(() => {
    if (!isEditable || !flowId || !serverUrl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Delete or Backspace key (but not when typing in input fields)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        // Don't delete if user is typing in an input field
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        const instance = (window as any).reactFlowInstance;
        if (!instance) return;

        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          e.preventDefault();
          
          // Build delete items list
          const items: DeleteItem[] = [];
          
          // Add selected connections
          for (const edge of selectedEdges) {
            items.push({
              type: 'connection',
              id: edge.id,
              sourceRoutine: edge.source,
              sourceEvent: edge.sourceHandle || '',
              targetRoutine: edge.target,
              targetSlot: edge.targetHandle || '',
            });
          }
          
          // Add selected routines
          for (const node of selectedNodes) {
            items.push({
              type: 'routine',
              id: node.id,
              routineId: node.id,
            });
          }
          
          // Calculate affected connections for routine deletions
          const { flows } = useFlowStore.getState();
          const flow = flows.get(flowId);
          if (flow && selectedNodes.length > 0) {
            const routineIds = selectedNodes.map(n => n.id);
            const affected = getAffectedConnections(routineIds, flow.connections);
            setAffectedConnections(affected);
          } else {
            setAffectedConnections([]);
          }
          
          setDeleteItems(items);
          setDeleteDialogOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditable, flowId, serverUrl, nodes, edges]);

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
        {/* Lock indicator - subtle badge instead of blocking overlay */}
        {flowId && isLocked && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="bg-background/95 border border-border rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Locked - View Only</span>
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={stableNodeTypes}
          edgeTypes={stableEdgeTypes}
          defaultEdgeOptions={stableDefaultEdgeOptions}
          fitView
          nodesDraggable={true}
          nodesConnectable={isEditable}
          elementsSelectable={true}
          edgesFocusable={true}
          selectNodesOnDrag={false}
          deleteKeyCode={null}
          connectionLineType="smoothstep"
          connectionRadius={10}
          elevateEdgesOnSelect={true}
          className="bg-background [&_.react-flow__edges]:z-[1000]"
          onInit={(instance) => {
            (window as any).reactFlowInstance = instance;
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

      {/* Delete Confirmation Dialog */}
      {flowId && serverUrl && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          items={deleteItems}
          flowId={flowId}
          serverUrl={serverUrl}
          affectedConnections={affectedConnections}
          onSuccess={async () => {
            // Refresh flow after deletion
            await selectFlow(flowId, serverUrl);
            // Clear selection
            const instance = (window as any).reactFlowInstance;
            if (instance) {
              instance.setNodes((nds: Node[]) => nds.map(n => ({ ...n, selected: false })));
              instance.setEdges((eds: Edge[]) => eds.map(e => ({ ...e, selected: false })));
            }
          }}
        />
      )}
    </>
  );
}
