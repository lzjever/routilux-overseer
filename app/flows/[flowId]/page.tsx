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
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { useJobStore } from "@/lib/stores/jobStore";

export default function FlowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const flowId = params.flowId as string;
  const { connected, serverUrl } = useConnectionStore();
  const { selectedFlowId, nodes, selectFlow, loading, flows } = useFlowStore();
  const { startJob } = useJobStore();
  const [activeTab, setActiveTab] = useState<"overview" | "routines" | "export">("overview");

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
        <Button onClick={handleStartJob}>
          <Play className="mr-2 h-4 w-4" />
          Start Job
        </Button>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routines">Routines</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-6 h-full">
              {/* Flow Metadata - Full width at top */}
              <div>
                <FlowMetadata flow={flow} />
              </div>

              {/* Flow Canvas - Full width below */}
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
            <RoutineDetails routines={flow.routines} />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="flex-1 min-h-0 overflow-auto">
            {serverUrl && (
              <FlowDSLExport flowId={flowId} serverUrl={serverUrl} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
