"use client";

import { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { RoutineNode } from "./RoutineNode";
import { ConnectionEdge } from "./ConnectionEdge";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/stores/flowStore";
import { layoutNodes } from "@/lib/utils/flow-layout";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

// Define nodeTypes and edgeTypes outside component to prevent recreation
// This is required by ReactFlow to avoid warnings
const nodeTypes: NodeTypes = {
  routine: RoutineNode,
};

const edgeTypes: EdgeTypes = {
  connection: ConnectionEdge,
};

interface FlowCanvasProps {
  flowId?: string;
  editable?: boolean;
}

export function FlowCanvas({ flowId, editable = false }: FlowCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    selectFlow,
    setNodes,
    setEdges,
  } = useFlowStore();

  // Auto-fit view when flow changes
  useEffect(() => {
    console.log('[FlowCanvas] Flow mounted or changed', {
      flowId,
      nodesCount: nodes.length,
      edgesCount: edges.length
    });

    // Auto-fit view after a short delay to ensure rendering is complete
    if (nodes.length > 0) {
      setTimeout(() => {
        if (typeof window !== "undefined" && (window as any).reactFlowInstance) {
          (window as any).reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }
      }, 100);
    }
  }, [flowId]);  // Only re-run when flowId changes, not when nodes/edges change

  const handleFitView = useCallback(() => {
    // This will be called when fit view button is clicked
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

  return (
    <div className="w-full h-full min-h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
  );
}
