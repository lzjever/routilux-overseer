"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useJobStore } from "@/lib/stores/jobStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useJobEventsStore } from "@/lib/stores/jobEventsStore";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { useJobStateStore } from "@/lib/stores/jobStateStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { MetricsPanel } from "@/components/monitoring/MetricsPanel";
import { EventLog } from "@/components/monitoring/EventLog";
import { BreakpointControls } from "@/components/debug/BreakpointControls";
import { VariableInspector } from "@/components/debug/VariableInspector";
import { StepExecutionControls } from "@/components/debug/StepExecutionControls";
import { JobStateSummary } from "@/components/job/JobStateSummary";
import { RoutineStatesPanel } from "@/components/job/RoutineStatesPanel";
import { SharedDataViewer } from "@/components/job/SharedDataViewer";
import { ExecutionHistoryTimeline } from "@/components/job/ExecutionHistoryTimeline";
import { ExpressionEvaluator } from "@/components/debug/ExpressionEvaluator";
import { DebugSessionMonitor } from "@/components/debug/DebugSessionMonitor";
import { useJobMonitor } from "@/lib/websocket/job-monitor";
import { ArrowLeft, Loader2, Pause, Play, XCircle, RefreshCw, Wifi } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "state" | "history" | "debug">("overview");

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

      {/* Tabs Content */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-6 h-full">
              {/* Flow Canvas - Full width */}
              <div className="flex-1 min-h-0">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle>Flow Visualization</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 min-h-[500px]">
                    <FlowCanvas flowId={job.flow_id} editable={false} />
                  </CardContent>
                </Card>
              </div>

              {/* Metrics and Event Log */}
              <div className="space-y-6">
                <MetricsPanel job={job} eventsCount={events.length} loading={loading} />
                <EventLog events={events} loading={loading && events.length === 0} />
              </div>
            </div>
          </TabsContent>

          {/* State Tab */}
          <TabsContent value="state" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-6">
              {jobState && (
                <>
                  <JobStateSummary jobState={jobState} />

                  <RoutineStatesPanel jobState={jobState} />

                  <SharedDataViewer sharedData={getSharedData(jobId)} />
                </>
              )}

              {!jobState && (
                <Card>
                    <CardContent className="flex items-center justify-center min-h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 min-h-0 overflow-auto">
            {jobState && (
              <ExecutionHistoryTimeline
                history={getExecutionHistory(jobId)}
              />
            )}

            {!jobState && (
              <Card>
                <CardContent className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-6">
              {/* Debug Session Monitor */}
              <DebugSessionMonitor jobId={jobId} serverUrl={serverUrl} />

              {/* Expression Evaluator */}
              {serverUrl && (
                <ExpressionEvaluator
                  jobId={jobId}
                  serverUrl={serverUrl}
                  jobStatus={job.status}
                  availableRoutines={availableRoutines}
                />
              )}

              {/* Legacy Debug Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>Debug Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serverUrl && (
                      <>
                        <div>
                          <h3 className="font-medium mb-2">Breakpoints</h3>
                          <BreakpointControls
                            jobId={jobId}
                            serverUrl={serverUrl}
                            availableRoutines={availableRoutines}
                          />
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Variables</h3>
                          <VariableInspector
                            jobId={jobId}
                            serverUrl={serverUrl}
                              availableRoutines={availableRoutines}
                            />
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Steps</h3>
                            <StepExecutionControls
                              jobId={jobId}
                              serverUrl={serverUrl}
                              status={job.status}
                              onStep={() => {
                                // Reload state after step
                                loadJobState(jobId, serverUrl);
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
