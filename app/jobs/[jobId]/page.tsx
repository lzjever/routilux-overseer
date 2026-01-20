"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useJobStore } from "@/lib/stores/jobStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useJobStateStore } from "@/lib/stores/jobStateStore";
import { useJobEventsStore } from "@/lib/stores/jobEventsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { MetricsPanel } from "@/components/monitoring/MetricsPanel";
import { EventLog } from "@/components/monitoring/EventLog";
import { JobStateSummary } from "@/components/job/JobStateSummary";
import { RoutineStatesPanel } from "@/components/job/RoutineStatesPanel";
import { SharedDataViewer } from "@/components/job/SharedDataViewer";
import { ExecutionHistoryTimeline } from "@/components/job/ExecutionHistoryTimeline";
import { JobDetailHeader } from "@/components/job/JobDetailHeader";
import { QueueStatusPanel } from "@/components/job/QueueStatusPanel";
import { FloatingBreakpointPanel } from "@/components/job/FloatingBreakpointPanel";
import { Navbar } from "@/components/layout/Navbar";
import { useJobMonitor } from "@/lib/websocket/job-monitor";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { connected, serverUrl, hydrated } = useConnectionStore();
  const { jobs, loadJob, loadJobMonitoringData, loadJobMetrics, metricsData, wsConnected } = useJobStore();
  const { selectFlow } = useFlowStore();
  const { getEvents } = useJobEventsStore();
  const { loadJobState, getSharedData, getExecutionHistory, jobStates } = useJobStateStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"activity" | "metrics" | "history" | "queues">("activity");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeAnchor, setSelectedNodeAnchor] = useState<{ x: number; y: number } | null>(null);
  const historyPollingRef = useRef<NodeJS.Timeout | null>(null);

  const job = jobs.get(jobId);
  const jobState = jobStates.get(jobId);
  const events = getEvents(jobId);
  const metrics = metricsData.get(jobId) || null;

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

  useEffect(() => {
    if (!serverUrl || !job) return;
    if (historyPollingRef.current) {
      clearInterval(historyPollingRef.current);
    }
    const interval = setInterval(() => {
      loadJobState(jobId, serverUrl);
    }, 5000);
    historyPollingRef.current = interval;
    return () => {
      clearInterval(interval);
    };
  }, [serverUrl, job, jobId, loadJobState]);


  useEffect(() => {
    // Wait for hydration before checking connection
    if (!hydrated) return;
    
    if (!connected || !serverUrl) {
      router.push("/connect");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load job details
        const loadedJob = await loadJob(jobId, serverUrl);
        if (loadedJob) {
          await selectFlow(loadedJob.flow_id, serverUrl);
        }

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
  }, [hydrated, connected, serverUrl, jobId, loadJob, selectFlow, loadJobMonitoringData, loadJobMetrics, router]);


  const handleRefresh = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await loadJob(jobId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  // Show loading while hydrating or if not connected
  if (!hydrated || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }


  const normalizedEvents = (events.length ? events : getExecutionHistory(jobId)).map((event) => {
    const map: Record<string, string> = {
      routine_started: "routine_start",
      routine_completed: "routine_end",
      routine_failed: "error",
      event_emitted: "event_emit",
      slot_called: "slot_call",
      job_started: "job_start",
      job_completed: "job_end",
      job_failed: "error",
    };
    return {
      ...event,
      event_name: map[event.event_name] || event.event_name,
    };
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-app">
      <Navbar />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <JobDetailHeader
          job={job}
          serverUrl={serverUrl}
          onRefresh={handleRefresh}
          actionLoading={actionLoading}
          wsConnected={wsConnected}
        />

        <div className="flex-1 min-h-0 overflow-hidden px-4 py-4">
          <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col min-h-0">
              <Card className="flex flex-col flex-1 min-h-0 surface-panel">
                <CardHeader className="pb-4">
                  <CardTitle>Flow Execution</CardTitle>
                </CardHeader>
                <CardContent className="relative flex-1 min-h-0 p-0 overflow-hidden">
                  <FlowCanvas
                    flowId={job.flow_id}
                    jobId={jobId}
                    editable={false}
                    onNodeClick={(nodeId, anchor) => {
                      setSelectedNodeId(nodeId || null);
                      setSelectedNodeAnchor(nodeId ? anchor || null : null);
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="surface-panel flex flex-col h-full min-h-0">
              <div className="h-10 border-b flex items-center px-3 flex-shrink-0">
                <span className="text-sm font-semibold">Job Details</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
                <Card className="surface-panel">
                  <CardHeader>
                    <CardTitle>Job Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Job ID</span>
                      <span className="font-mono text-xs">{job.job_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Flow</span>
                      <span className="font-mono text-xs">{job.flow_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Worker</span>
                      <span className="font-mono text-xs">{job.worker_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={job.status === "running" ? "default" : job.status === "failed" ? "destructive" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="grid gap-2 pt-2 border-t text-xs text-muted-foreground">
                      {job.created_at && (
                        <div className="flex items-center justify-between">
                          <span>Created</span>
                          <span>{formatDistanceToNow(new Date(job.created_at * 1000), { addSuffix: true })}</span>
                        </div>
                      )}
                      {job.started_at && (
                        <div className="flex items-center justify-between">
                          <span>Started</span>
                          <span>{formatDistanceToNow(new Date(job.started_at * 1000), { addSuffix: true })}</span>
                        </div>
                      )}
                      {job.completed_at && (
                        <div className="flex items-center justify-between">
                          <span>Completed</span>
                          <span>{formatDistanceToNow(new Date(job.completed_at * 1000), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex flex-col">
                <TabsList className="grid w-full grid-cols-5 mb-3 h-auto bg-transparent p-0">
                    <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                    <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                    <TabsTrigger value="queues" className="text-xs">Queues</TabsTrigger>
                    <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="activity" className="pt-3 outline-none">
                    <EventLog events={normalizedEvents} loading={loading && normalizedEvents.length === 0} />
                  </TabsContent>

                  <TabsContent value="metrics" className="pt-3 outline-none">
                    <MetricsPanel job={job} metrics={metrics} eventsCount={events.length} loading={loading} />
                  </TabsContent>

                  <TabsContent value="history" className="pt-3 outline-none">
                    {jobState ? (
                      <ExecutionHistoryTimeline history={getExecutionHistory(jobId)} />
                    ) : (
                      <Card className="surface-panel">
                        <CardContent className="flex items-center justify-center min-h-[200px]">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="queues" className="pt-3 outline-none">
                    <Card className="surface-panel">
                      <CardContent>
                        {serverUrl && (
                          <QueueStatusPanel jobId={jobId} serverUrl={serverUrl} embedded />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details" className="pt-3 outline-none space-y-3">
                    {jobState && <JobStateSummary jobState={jobState} />}
                    {jobState && <RoutineStatesPanel jobState={jobState} />}
                    {jobState && <SharedDataViewer sharedData={getSharedData(jobId)} />}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Breakpoint Panel */}
      {selectedNodeId && serverUrl && (
        <FloatingBreakpointPanel
          routineId={selectedNodeId}
          jobId={jobId}
          serverUrl={serverUrl}
          anchor={selectedNodeAnchor}
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedNodeAnchor(null);
          }}
        />
      )}
    </div>
  );
}
