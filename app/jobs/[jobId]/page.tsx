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
  const { jobs, loadJob, loadJobMonitoringData, loadJobMetrics, wsConnected } = useJobStore();
  const { selectFlow } = useFlowStore();
  const { getEvents } = useJobEventsStore();
  const { loadJobState, getSharedData, getExecutionHistory, jobStates } = useJobStateStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"activity" | "metrics" | "history" | "queues">("activity");
  const historyPollingRef = useRef<NodeJS.Timeout | null>(null);

  const job = jobs.get(jobId);
  const jobState = jobStates.get(jobId);
  const events = getEvents(jobId);

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
  }, [hydrated, connected, serverUrl, jobId, loadJob, selectFlow, loadJobMonitoringData, loadJobMetrics]);


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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <JobDetailHeader
        job={job}
        serverUrl={serverUrl}
        onRefresh={handleRefresh}
        actionLoading={actionLoading}
        wsConnected={wsConnected}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full w-full px-4 py-4">
          <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col min-h-0 gap-4">
              <Card className="flex-1 min-h-[420px]">
                <CardHeader className="pb-4">
                  <CardTitle>Flow Execution</CardTitle>
                </CardHeader>
                <CardContent className="relative flex-1 p-0 min-h-[500px] overflow-hidden">
                  <FlowCanvas
                    flowId={job.flow_id}
                    jobId={jobId}
                    editable={false}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col min-h-0 gap-4 overflow-hidden border-l bg-muted/30 p-4 rounded-lg">
              <div className="text-sm font-semibold">Job Details</div>
              <Card>
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

              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                  <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                  <TabsTrigger value="queues" className="text-xs">Queues</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-3 flex-1 min-h-0">
                  <EventLog events={events} loading={loading && events.length === 0} />
                </TabsContent>

                <TabsContent value="metrics" className="mt-3 flex-1 min-h-0">
                  <MetricsPanel job={job} eventsCount={events.length} loading={loading} />
                </TabsContent>

                <TabsContent value="history" className="mt-3 flex-1 min-h-0">
                  {jobState ? (
                    <ExecutionHistoryTimeline history={getExecutionHistory(jobId)} />
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center min-h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="queues" className="mt-3 flex-1 min-h-0">
                  <Card>
                    <CardContent className="pt-6">
                      {serverUrl && (
                        <QueueStatusPanel jobId={jobId} serverUrl={serverUrl} embedded />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {jobState && <JobStateSummary jobState={jobState} />}
              {jobState && <RoutineStatesPanel jobState={jobState} />}
              {jobState && <SharedDataViewer sharedData={getSharedData(jobId)} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
