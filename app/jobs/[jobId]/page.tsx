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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useJobMonitor } from "@/lib/websocket/job-monitor";
import { ArrowLeft, Loader2, Pause, Play, XCircle, RefreshCw, Wifi, Bug } from "lucide-react";
import Link from "next/link";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { connected, serverUrl } = useConnectionStore();
  const { jobs, loadJob, pauseJob, resumeJob, cancelJob } = useJobStore();
  const { selectFlow, nodes, flows } = useFlowStore();
  const { getEvents } = useJobEventsStore();
  const { loadBreakpoints } = useBreakpointStore();
  const { loadJobState, getSharedData, getExecutionHistory, jobStates } = useJobStateStore();
  const { selectRoutine } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "history">("main");
  const [debugSidebarOpen, setDebugSidebarOpen] = useState(true);

  const job = jobs.get(jobId);
  const events = getEvents(jobId);
  const jobState = jobStates.get(jobId);

  // Get available routines from flow
  const availableRoutines = nodes.map((n) => n.id);

  // Get flow routines for RoutineStatesPanel
  const currentFlow = job ? flows.get(job.flow_id) : null;

  // Start job monitoring
  useJobMonitor(jobId, serverUrl);

  // Load complete job state
  useEffect(() => {
    if (job && serverUrl) {
      loadJobState(jobId, serverUrl);
    }
  }, [job, serverUrl, jobId]);

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
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [connected, serverUrl, jobId]);

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

  const isRunning = job.status === "running";
  const isPaused = job.status === "paused";

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{jobId}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                Flow: {job.flow_id}
              </p>
              <span className="text-muted-foreground">•</span>
              <Badge variant={isRunning ? "default" : isPaused ? "secondary" : "outline"}>
                {job.status}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Live Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={actionLoading}
          >
            <RefreshCw className={`h-4 w-4 ${actionLoading ? "animate-spin" : ""}`} />
          </Button>

          {/* Debug Sidebar Toggle */}
          <Button
            variant={debugSidebarOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setDebugSidebarOpen(!debugSidebarOpen)}
          >
            <Bug className="mr-2 h-4 w-4" />
            Debug
            {debugSidebarOpen && " Panel"}
          </Button>

          {isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              disabled={actionLoading}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}

          {isPaused && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResume}
              disabled={actionLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}

          {(isRunning || isPaused) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - With right padding for debug sidebar */}
      <div className="flex-1 min-h-0" style={{ paddingRight: debugSidebarOpen ? "400px" : "0" }}>
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
                    <FlowCanvas flowId={job.flow_id} jobId={jobId} editable={false} />
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
