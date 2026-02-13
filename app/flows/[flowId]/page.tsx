"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { FlowDetailHeader } from "@/components/flow/FlowDetailHeader";
import { FlowInfoSidebar } from "@/components/flow/FlowInfoSidebar";
import { FlowDetailsSidebar } from "@/components/flow/FlowDetailsSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";
import { createAPI } from "@/lib/api";
import { StartWorkerDialog } from "@/components/worker/StartWorkerDialog";
import { Edge, Node } from "reactflow";
import { toast } from "sonner";

export default function FlowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const flowId = params.flowId as string;
  const { connected, serverUrl, hydrated } = useConnectionStore();
  const { selectedFlowId, nodes, selectFlow, loading, flows, loadFlows, isFlowLocked } =
    useFlowStore();
  const [routines, setRoutines] = useState<Record<string, any>>({});
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    errors?: string[];
  } | null>(null);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [startWorkerDialogOpen, setStartWorkerDialogOpen] = useState(false);

  const flow = flows.get(flowId);

  useEffect(() => {
    // Wait for hydration before checking connection
    if (!hydrated) return;

    if (!connected) {
      router.push("/connect");
      return;
    }

    // Always reload flow if flowId changes or if not selected
    if (flowId && serverUrl) {
      if (flowId !== selectedFlowId || !flow) {
        console.log(
          `Loading flow ${flowId}, selectedFlowId: ${selectedFlowId}, hasFlow: ${!!flow}`
        );
        selectFlow(flowId, serverUrl);
      }
    }
  }, [hydrated, connected, flowId, selectedFlowId, selectFlow, serverUrl, flow, router]);

  useEffect(() => {
    const loadRoutines = async () => {
      if (!serverUrl || !flowId) return;
      try {
        const api = createAPI(serverUrl);
        const routinesData = await api.flows.getRoutines(flowId);
        setRoutines(routinesData);
      } catch (error) {
        console.error("Failed to load routines:", error);
      }
    };
    loadRoutines();
  }, [flowId, serverUrl]);

  useEffect(() => {
    const loadValidationAndJobs = async () => {
      if (!serverUrl || !flowId) return;
      try {
        const api = createAPI(serverUrl);
        // Load validation status
        try {
          await api.flows.validate(flowId);
          setValidationStatus({ valid: true });
        } catch (error) {
          setValidationStatus({
            valid: false,
            errors: [error instanceof Error ? error.message : "Validation failed"],
          });
        }
        // Load job count
        const jobsResponse = await api.jobs.list(null, flowId, null, 100);
        setJobCount(jobsResponse.total || 0);
      } catch (error) {
        console.error("Failed to load validation/jobs:", error);
      }
    };
    loadValidationAndJobs();
  }, [flowId, serverUrl]);

  // Keyboard shortcuts for panel collapse/expand
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B: Toggle left sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setLeftSidebarCollapsed(!leftSidebarCollapsed);
      }
      // Cmd/Ctrl + ]: Toggle right sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "]") {
        e.preventDefault();
        setRightSidebarCollapsed(!rightSidebarCollapsed);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leftSidebarCollapsed, rightSidebarCollapsed]);

  const handleRefresh = async () => {
    if (serverUrl) {
      await loadFlows(serverUrl);
      await selectFlow(flowId, serverUrl);
    }
  };

  const handleStartWorker = () => {
    setStartWorkerDialogOpen(true);
  };

  const handleWorkerCreated = (workerId: string) => {
    router.push(`/workers/${workerId}`);
  };

  const handleExportDSL = async () => {
    if (!serverUrl) return;
    try {
      const api = createAPI(serverUrl);
      const exportResponse = await api.flows.exportDSL(flowId, "yaml");
      // Extract the DSL string from the response object
      const dslString =
        typeof exportResponse === "string" ? exportResponse : exportResponse.dsl || "";
      const blob = new Blob([dslString], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${flowId}.yaml`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("DSL exported successfully", {
        description: `Downloaded ${flowId}.yaml`,
      });
    } catch (error) {
      toast.error("Failed to export DSL", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleValidate = async () => {
    if (!serverUrl) return;
    try {
      const api = createAPI(serverUrl);
      await api.flows.validate(flowId);
      setValidationStatus({ valid: true });
    } catch (error) {
      setValidationStatus({
        valid: false,
        errors: [error instanceof Error ? error.message : "Validation failed"],
      });
    }
  };

  // Canvas ↔ Sidebar sync handlers
  const handleRoutineClick = useCallback(
    (routineId: string) => {
      // Highlight node in canvas
      if (typeof window !== "undefined" && (window as any).reactFlowInstance) {
        const instance = (window as any).reactFlowInstance;
        const node = nodes.find((n) => n.id === routineId);
        if (node) {
          instance.fitView({ padding: 0.2, duration: 800, nodes: [node] });
          // TODO: Add visual highlight effect
        }
      }
    },
    [nodes]
  );

  const handleConnectionClick = useCallback(
    (connectionIndex: number) => {
      // Highlight edge in canvas and zoom to it
      if (typeof window !== "undefined" && (window as any).reactFlowInstance) {
        const instance = (window as any).reactFlowInstance;
        const { edges: currentEdges } = useFlowStore.getState();
        const edge = currentEdges[connectionIndex] || null;
        if (edge) {
          // Select the edge in ReactFlow
          instance.setEdges((eds: Edge[]) =>
            eds.map((e) => ({ ...e, selected: e.id === edge.id }))
          );
          // Deselect all nodes
          instance.setNodes((nds: Node[]) => nds.map((n) => ({ ...n, selected: false })));
          // Zoom to edge by zooming to connected nodes
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (sourceNode && targetNode) {
            instance.fitView({ padding: 0.2, duration: 800, nodes: [sourceNode, targetNode] });
          }
        }
      }
    },
    [nodes]
  );

  // Show loading while hydrating or if not connected
  if (!hydrated || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading || !flow) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-app">
      <Navbar />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col w-full px-4 py-4">
          {/* Compact Header */}
          <FlowDetailHeader
            flow={flow}
            flowId={flowId}
            serverUrl={serverUrl}
            validationStatus={validationStatus}
            jobCount={jobCount}
            onStartJob={handleStartWorker}
            onExportDSL={handleExportDSL}
            onRefresh={handleRefresh}
            onValidate={handleValidate}
          />

          {/* Three-Panel Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Flow Information */}
            <FlowInfoSidebar
              flow={flow}
              flowId={flowId}
              serverUrl={serverUrl}
              collapsed={leftSidebarCollapsed}
              onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            />

            {/* Center Panel - Flow Visualization (Primary Focus) */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
              <div className="flex-1 relative">
                <FlowCanvas flowId={flowId} editable={!isFlowLocked(flowId)} />
              </div>
            </div>

            {/* Right Sidebar - Routines & Connections */}
            <FlowDetailsSidebar
              flow={flow}
              flowId={flowId}
              serverUrl={serverUrl}
              routines={routines}
              collapsed={rightSidebarCollapsed}
              onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              onRefresh={handleRefresh}
              onRoutineClick={handleRoutineClick}
              onConnectionClick={handleConnectionClick}
            />
          </div>
        </div>

        {/* Start Worker Dialog */}
        {serverUrl && (
          <StartWorkerDialog
            open={startWorkerDialogOpen}
            onOpenChange={setStartWorkerDialogOpen}
            flowId={flowId}
            serverUrl={serverUrl}
            onSuccess={handleWorkerCreated}
          />
        )}
      </div>
    </div>
  );
}
