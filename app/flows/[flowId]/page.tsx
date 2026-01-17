"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { FlowMetadata } from "@/components/flow/FlowMetadata";
import { RoutineDetails } from "@/components/flow/RoutineDetails";
import { FlowDSLExport } from "@/components/flow/FlowDSLExport";
import { FlowValidationCard } from "@/components/flow/FlowValidationCard";
import { FlowMetricsCard } from "@/components/flow/FlowMetricsCard";
import { AddRoutineDialog } from "@/components/flow/AddRoutineDialog";
import { AddConnectionDialog } from "@/components/flow/AddConnectionDialog";
import { ArrowLeft, Play, Loader2, MoreVertical, Download, Upload, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useJobStore } from "@/lib/stores/jobStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createAPI } from "@/lib/api";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function FlowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const flowId = params.flowId as string;
  const { connected, serverUrl } = useConnectionStore();
  const { selectedFlowId, nodes, selectFlow, loading, flows, loadFlows } = useFlowStore();
  const { startJob } = useJobStore();
  const [activeTab, setActiveTab] = useState<"overview" | "routines" | "metrics">("overview");
  const [connectionsExpanded, setConnectionsExpanded] = useState(false);
  const [routines, setRoutines] = useState<Record<string, any>>({});

  const flow = flows.get(flowId);

  useEffect(() => {
    if (!connected) {
      router.push("/connect");
      return;
    }

    if (flowId && flowId !== selectedFlowId && serverUrl) {
      selectFlow(flowId, serverUrl);
    }
  }, [connected, flowId, selectedFlowId, selectFlow, serverUrl]);

  useEffect(() => {
    const loadRoutines = async () => {
      if (!serverUrl || !flowId) return;
      try {
        const api = createAPI(serverUrl);
        const routinesData = await api.flows.getFlowRoutines(flowId);
        setRoutines(routinesData);
      } catch (error) {
        console.error("Failed to load routines:", error);
      }
    };
    loadRoutines();
  }, [flowId, serverUrl]);

  const handleRefresh = async () => {
    if (serverUrl) {
      await loadFlows(serverUrl);
      await selectFlow(flowId, serverUrl);
    }
  };

  const handleStartJob = async () => {
    if (!flow || !serverUrl) return;

    // Find entry routine (source)
    const entryRoutine = Object.keys(flow.routines).find((id) =>
      id.includes("source")
    );

    if (!entryRoutine) {
      alert("No entry routine found for this flow");
      return;
    }

    try {
      const job = await startJob(
        {
          flow_id: flowId,
          entry_routine_id: entryRoutine,
          entry_params: { data: "Test from debugger" },
        },
        serverUrl
      );

      // Navigate to job page
      router.push(`/jobs/${job.job_id}`);
    } catch (error) {
      alert(
        `Failed to start job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (!connected) {
    return null;
  }

  if (loading || !flow) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/flows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Flows
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{flow.flow_id}</h1>
            <p className="text-muted-foreground">
              {Object.keys(flow.routines).length} routines •{" "}
              {flow.connections.length} connections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={async () => {
                  if (!serverUrl) return;
                  try {
                    const api = createAPI(serverUrl);
                    const dsl = await api.flows.exportFlowDSL(flowId, "yaml");
                    const dslString = typeof dsl === "string" ? dsl : JSON.stringify(dsl, null, 2);
                    const blob = new Blob([dslString], { type: "text/yaml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${flowId}.yaml`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    alert(`Failed to export DSL: ${error instanceof Error ? error.message : "Unknown error"}`);
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export DSL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRefresh}>
                <Upload className="mr-2 h-4 w-4" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleStartJob}>
            <Play className="mr-2 h-4 w-4" />
            Start Job
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routines">Routines</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-6 h-full">
              {/* Validation and Metrics Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {serverUrl && (
                  <>
                    <FlowValidationCard flowId={flowId} serverUrl={serverUrl} />
                    <FlowMetricsCard flowId={flowId} serverUrl={serverUrl} />
                  </>
                )}
              </div>

              {/* Flow Metadata */}
              <div>
                <FlowMetadata flow={flow} />
              </div>

              {/* Connections Section */}
              {serverUrl && (
                <Card>
                  <Collapsible open={connectionsExpanded} onOpenChange={setConnectionsExpanded}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {connectionsExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            Connections ({flow.connections.length})
                          </CardTitle>
                          <AddConnectionDialog
                            flowId={flowId}
                            serverUrl={serverUrl}
                            routines={routines}
                            onSuccess={handleRefresh}
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-2">
                          {flow.connections.length === 0 ? (
                            <div className="text-sm text-muted-foreground py-4 text-center">
                              No connections. Add a connection to link routines.
                            </div>
                          ) : (
                            flow.connections.map((conn: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="text-sm">
                                  <span className="font-medium">{conn.source_routine}</span>
                                  <span className="text-muted-foreground">.</span>
                                  <span className="font-medium">{conn.source_event}</span>
                                  <span className="text-muted-foreground"> → </span>
                                  <span className="font-medium">{conn.target_routine}</span>
                                  <span className="text-muted-foreground">.</span>
                                  <span className="font-medium">{conn.target_slot}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    if (!serverUrl) return;
                                    try {
                                      const api = createAPI(serverUrl);
                                      await api.flows.removeConnection(flowId, index);
                                      await handleRefresh();
                                    } catch (error) {
                                      alert(
                                        `Failed to remove connection: ${
                                          error instanceof Error ? error.message : "Unknown error"
                                        }`
                                      );
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Flow Canvas */}
              <div className="flex-1 min-h-0">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle>Flow Visualization</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 min-h-[500px]">
                    <FlowCanvas flowId={flowId} editable={false} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Routines Tab */}
          <TabsContent value="routines" className="flex-1 min-h-0 overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Routines</h2>
                {serverUrl && (
                  <AddRoutineDialog
                    flowId={flowId}
                    serverUrl={serverUrl}
                    onSuccess={handleRefresh}
                  />
                )}
              </div>
              <RoutineDetails
                routines={flow.routines}
                flowId={flowId}
                serverUrl={serverUrl}
                onRoutineRemoved={handleRefresh}
              />
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="flex-1 min-h-0 overflow-auto">
            {serverUrl && (
              <FlowMetricsCard flowId={flowId} serverUrl={serverUrl} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
