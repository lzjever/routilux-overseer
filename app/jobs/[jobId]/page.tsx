"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useJobStore } from "@/lib/stores/jobStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useJobEventsStore } from "@/lib/stores/jobEventsStore";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { useJobStateStore } from "@/lib/stores/jobStateStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { MetricsPanel } from "@/components/monitoring/MetricsPanel";
import { EventLog } from "@/components/monitoring/EventLog";
import { JobStateSummary } from "@/components/job/JobStateSummary";
import { RoutineStatesPanel } from "@/components/job/RoutineStatesPanel";
import { SharedDataViewer } from "@/components/job/SharedDataViewer";
import { ExecutionHistoryTimeline } from "@/components/job/ExecutionHistoryTimeline";
import { MiniEventLog } from "@/components/monitoring/MiniEventLog";
import { DebugSidebar } from "@/components/debug/DebugSidebar";
import { JobDetailHeader } from "@/components/job/JobDetailHeader";
import { JobDetailsSidebar } from "@/components/job/JobDetailsSidebar";
import { useJobMonitor } from "@/lib/websocket/job-monitor";
import { Loader2 } from "lucide-react";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { connected, serverUrl } = useConnectionStore();
  const { jobs, loadJob, pauseJob, resumeJob, cancelJob, loadJobMonitoringData, loadJobMetrics, wsConnected } = useJobStore();
  const { selectFlow, nodes, flows } = useFlowStore();
  const { getEvents } = useJobEventsStore();
  const { loadBreakpoints } = useBreakpointStore();
  const { loadJobState, getSharedData, getExecutionHistory, jobStates } = useJobStateStore();
  const { selectRoutine } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "history">("main");
  const [debugSidebarOpen, setDebugSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const job = jobs.get(jobId);
  const events = getEvents(jobId);
  const jobState = jobStates.get(jobId);

  // Get available routines from flow
  const availableRoutines = nodes.map((n) => n.id);

  // Get flow routines for RoutineStatesPanel
  const currentFlow = job ? flows.get(job.flow_id) : null;

  // Start job monitoring
  useJobMonitor(jobId, serverUrl);

  // Load complete job state and monitoring data
  useEffect(() => {
    if (job && serverUrl) {
      loadJobState(jobId, serverUrl);
      loadJobMonitoringData(jobId, serverUrl);
      loadJobMetrics(jobId, serverUrl);
    }
  }, [job, serverUrl, jobId, loadJobState, loadJobMonitoringData, loadJobMetrics]);

  // Auto-open debug sidebar when job is paused
  useEffect(() => {
    if (job?.status === "paused") {
      setDebugSidebarOpen(true);
    }
  }, [job?.status]);

  useEffect(() => {
    if (!connected || !serverUrl) {
      router.push("/connect");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load job details
        await loadJob(jobId, serverUrl);

        // Load flow visualization
        const loadedJob = jobs.get(jobId);
        if (loadedJob) {
          await selectFlow(loadedJob.flow_id, serverUrl);
        }

        // Load breakpoints
        await loadBreakpoints(jobId, serverUrl);

        // Load monitoring data for heatmap visualization
        await loadJobMonitoringData(jobId, serverUrl);
        await loadJobMetrics(jobId, serverUrl);
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [connected, serverUrl, jobId, loadJob, selectFlow, loadBreakpoints, loadJobMonitoringData, loadJobMetrics]);

  const handlePause = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await pauseJob(jobId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await resumeJob(jobId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!serverUrl) return;
    if (!confirm("Are you sure you want to cancel this job?")) return;

    setActionLoading(true);
    try {
      await cancelJob(jobId, serverUrl);
      router.push("/jobs");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await loadJob(jobId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFocusRoutine = (routineId: string) => {
    if (!job) return;
    selectRoutine({
      routineId,
      jobId,
      flowId: job.flow_id,
    });
  };

  const handleStep = () => {
    if (serverUrl) {
      loadJobState(jobId, serverUrl);
    }
  };

  if (!connected) {
    return null;
  }

  if (loading || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <JobDetailHeader
        job={job}
        serverUrl={serverUrl}
        onRefresh={handleRefresh}
        onPause={handlePause}
        onResume={handleResume}
        onCancel={handleCancel}
        onToggleDebug={() => setDebugSidebarOpen(!debugSidebarOpen)}
        debugSidebarOpen={debugSidebarOpen}
        actionLoading={actionLoading}
        wsConnected={wsConnected}
      />

      {/* Main Content - With right padding for sidebars */}
      <div
        className="flex-1 min-h-0 overflow-hidden flex"
        style={{
          paddingRight: (debugSidebarOpen ? 400 : 0) + (selectedNodeId || selectedEdgeId ? 320 : 0),
        }}
      >
        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Main Tab */}
            <TabsContent value="main" className="flex-1 min-h-0 overflow-auto">
              <div className="flex flex-col gap-6 h-full">
                {/* Flow Canvas - Full width */}
                <div className="flex-1 min-h-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-4">
                      <CardTitle>Flow Visualization</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 min-h-[500px]">
                      <FlowCanvas
                        flowId={job.flow_id}
                        jobId={jobId}
                        editable={false}
                        onNodeClick={(nodeId) => {
                          setSelectedNodeId(nodeId);
                          setSelectedEdgeId(null);
                        }}
                        onEdgeClick={(edgeId) => {
                          setSelectedEdgeId(edgeId);
                          setSelectedNodeId(null);
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>

              {/* Job State Summary */}
              {jobState && (
                <JobStateSummary jobState={jobState} />
              )}

              {/* Routine States Panel */}
              {jobState && (
                <RoutineStatesPanel jobState={jobState} />
              )}

              {/* Shared Data Viewer */}
              {jobState && (
                <SharedDataViewer sharedData={getSharedData(jobId)} />
              )}

              {/* Metrics and Event Log */}
              <div className="space-y-6">
                <MetricsPanel job={job} eventsCount={events.length} loading={loading} />
                <EventLog events={events} loading={loading && events.length === 0} />
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 min-h-0 overflow-auto">
            {jobState ? (
              <ExecutionHistoryTimeline
                history={getExecutionHistory(jobId)}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Job Details Sidebar */}
      {serverUrl && (selectedNodeId || selectedEdgeId) && (
        <div className="fixed right-0 top-14 bottom-0" style={{ right: debugSidebarOpen ? "400px" : "0" }}>
          <JobDetailsSidebar
            jobId={jobId}
            serverUrl={serverUrl}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
          />
        </div>
      )}

      {/* Debug Sidebar */}
      {serverUrl && debugSidebarOpen && (
        <DebugSidebar
          jobId={jobId}
          serverUrl={serverUrl}
          jobStatus={job.status}
          availableRoutines={availableRoutines}
          isOpen={debugSidebarOpen}
          onToggle={() => setDebugSidebarOpen(!debugSidebarOpen)}
          onStep={handleStep}
        />
      )}

      {/* Mini Event Log */}
      <MiniEventLog jobId={jobId} onFocusRoutine={handleFocusRoutine} />
    </div>
  );
}
