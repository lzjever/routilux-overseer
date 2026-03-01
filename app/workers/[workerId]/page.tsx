"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWorkersStore } from "@/lib/stores/workersStore";
import { useJobStore } from "@/lib/stores/jobStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubmitJobDialog } from "@/components/job/SubmitJobDialog";
import { ArrowLeft, Loader2, Pause, PlayCircle, XCircle, Send, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createAPI } from "@/lib/api";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function WorkerDetailPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const params = useParams();
  const workerId = params.workerId as string;
  const { connected, serverUrl, hydrated } = useConnectionStore();
  const { workers, loadWorker, pauseWorker, resumeWorker, stopWorker } = useWorkersStore();
  const { jobs, loadJobs } = useJobStore();
  const { selectFlow, flows } = useFlowStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "statistics" | "history" | "routines"
  >("overview");
  const [submitJobDialogOpen, setSubmitJobDialogOpen] = useState(false);
  const [workerJobs, setWorkerJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [routineStates, setRoutineStates] = useState<Record<string, any>>({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingRoutines, setLoadingRoutines] = useState(false);

  const worker = workers.get(workerId);

  const loadWorkerJobs = useCallback(async () => {
    if (!serverUrl) return;
    setLoadingJobs(true);
    try {
      const api = createAPI(serverUrl);
      const response = await api.workers.listJobs(workerId, null, 100);
      setWorkerJobs(response.jobs || []);
    } catch (error) {
      console.error("Failed to load worker jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  }, [serverUrl, workerId]);

  const loadStatistics = useCallback(async () => {
    if (!serverUrl) return;
    setLoadingStats(true);
    try {
      const api = createAPI(serverUrl);
      const stats = await api.workers.getStatistics(workerId);
      setStatistics(stats);
    } catch (error) {
      console.error("Failed to load worker statistics:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [serverUrl, workerId]);

  const loadHistory = useCallback(async () => {
    if (!serverUrl) return;
    setLoadingHistory(true);
    try {
      const api = createAPI(serverUrl);
      const hist = await api.workers.getHistory(workerId);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (error) {
      console.error("Failed to load worker history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [serverUrl, workerId]);

  const loadRoutineStates = useCallback(async () => {
    if (!serverUrl) return;
    setLoadingRoutines(true);
    try {
      const api = createAPI(serverUrl);
      const states = await api.workers.getRoutineStates(workerId);
      setRoutineStates(states || {});
    } catch (error) {
      console.error("Failed to load routine states:", error);
    } finally {
      setLoadingRoutines(false);
    }
  }, [serverUrl, workerId]);

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
        const loadedWorker = await loadWorker(workerId, serverUrl);
        if (loadedWorker) {
          await selectFlow(loadedWorker.flow_id, serverUrl);
          await Promise.all([
            loadWorkerJobs(),
            loadStatistics(),
            loadHistory(),
            loadRoutineStates(),
          ]);
        }
      } catch (error) {
        console.error("Failed to load worker:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    hydrated,
    connected,
    serverUrl,
    workerId,
    loadWorker,
    selectFlow,
    loadWorkerJobs,
    loadStatistics,
    loadHistory,
    loadRoutineStates,
    router,
  ]);

  const handlePause = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await pauseWorker(workerId, serverUrl);
      await loadWorker(workerId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await resumeWorker(workerId, serverUrl);
      await loadWorker(workerId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    if (!serverUrl) return;
    const ok = await confirm.openConfirm({
      title: "Stop worker?",
      description: "All jobs in progress on this worker may be interrupted.",
      confirmLabel: "Stop",
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setActionLoading(true);
    try {
      await stopWorker(workerId, serverUrl);
      router.push("/workers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to stop worker");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await loadWorker(workerId, serverUrl);
      await Promise.all([loadWorkerJobs(), loadStatistics(), loadHistory(), loadRoutineStates()]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJobSubmitted = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  // Show loading while hydrating or if not connected
  if (!hydrated || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading || !worker) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const currentFlow = flows.get(worker.flow_id);
  const isRunning = worker.status === "running";
  const isPaused = worker.status === "paused";
  const isIdle = worker.status === "idle";

  return (
    <div className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <div className="w-full px-4 py-6 flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Workers
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold font-mono">{worker.worker_id}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">Flow: {worker.flow_id}</p>
                <span className="text-muted-foreground">•</span>
                <StatusBadge status={worker.status} showSpinner={isRunning} />
                {worker.created_at && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      Created{" "}
                      {formatDistanceToNow(new Date(worker.created_at * 1000), {
                        addSuffix: true,
                      })}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={actionLoading}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${actionLoading ? "animate-spin" : ""}`} />
            </Button>
            {isRunning && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                disabled={actionLoading}
                className="h-8"
              >
                <Pause className="mr-2 h-3 w-3" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResume}
                disabled={actionLoading}
                className="h-8"
              >
                <PlayCircle className="mr-2 h-3 w-3" />
                Resume
              </Button>
            )}
            {(isRunning || isPaused || isIdle) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
                disabled={actionLoading}
                className="h-8"
              >
                <XCircle className="mr-2 h-3 w-3" />
                Stop
              </Button>
            )}
            {serverUrl && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setSubmitJobDialogOpen(true)}
                className="h-8"
              >
                <Send className="mr-2 h-3 w-3" />
                Submit Job
              </Button>
            )}
          </div>
        </div>

        {/* Worker Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="surface-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Jobs Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{worker.jobs_processed || 0}</div>
            </CardContent>
          </Card>
          <Card className="surface-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Jobs Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{worker.jobs_failed || 0}</div>
            </CardContent>
          </Card>
          <Card className="surface-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={worker.status} showSpinner={isRunning} />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v: any) => setActiveTab(v)}
          className="w-full flex-1 min-h-0 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-5 mb-4 h-auto bg-transparent p-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({workerJobs.length})</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="routines">Routines</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 min-h-0 mt-4 outline-none flex flex-col">
            {/* Flow Visualization */}
            {currentFlow ? (
              <Card className="flex-1 min-h-[420px] surface-panel flex flex-col">
                <CardHeader>
                  <CardTitle>Flow Visualization</CardTitle>
                  <CardDescription>Flow: {worker.flow_id}</CardDescription>
                </CardHeader>
                <CardContent className="relative flex-1 min-h-[500px] p-0 overflow-hidden">
                  <FlowCanvas flowId={worker.flow_id} editable={false} />
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1 min-h-[420px] surface-panel">
                <CardContent className="flex items-center justify-center min-h-[500px]">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Loading flow visualization...
                    </p>
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="flex-1 min-h-0 space-y-4 mt-4 outline-none">
            {loadingJobs ? (
              <Card className="surface-panel">
                <CardContent className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : workerJobs.length === 0 ? (
              <Card className="surface-panel">
                <EmptyState
                  icon={Send}
                  title="No jobs yet"
                  description="Submit a job to this worker to get started."
                  action={{
                    label: "Submit Job",
                    onClick: () => setSubmitJobDialogOpen(true),
                  }}
                />
              </Card>
            ) : (
              <div className="grid gap-4">
                {workerJobs.map((job) => (
                  <Card
                    key={job.job_id}
                    className="surface-panel group hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.job_id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-mono">{job.job_id}</CardTitle>
                          <CardDescription className="mt-1">Status: {job.status}</CardDescription>
                        </div>
                        <StatusBadge
                          status={job.status}
                          showSpinner={job.status === "running"}
                          errorMessage={job.error ?? undefined}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {job.created_at && (
                          <span>
                            Created{" "}
                            {formatDistanceToNow(new Date(job.created_at * 1000), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                        {job.started_at && (
                          <span>
                            • Started{" "}
                            {formatDistanceToNow(new Date(job.started_at * 1000), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                        {job.completed_at && (
                          <span>
                            • Completed{" "}
                            {formatDistanceToNow(new Date(job.completed_at * 1000), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      {job.error && (
                        <div className="mt-2 text-sm text-destructive">Error: {job.error}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="flex-1 min-h-0 space-y-4 mt-4 outline-none">
            {loadingStats ? (
              <Card className="surface-panel">
                <CardContent className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : statistics ? (
              <Card className="surface-panel">
                <CardHeader>
                  <CardTitle>Worker Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Jobs Processed</div>
                        <div className="text-2xl font-bold">
                          {statistics.jobs_processed || worker.jobs_processed || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Jobs Failed</div>
                        <div className="text-2xl font-bold text-destructive">
                          {statistics.jobs_failed || worker.jobs_failed || 0}
                        </div>
                      </div>
                      {statistics.success_rate !== undefined && (
                        <div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                          <div className="text-2xl font-bold">
                            {(statistics.success_rate * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {statistics.avg_job_duration !== undefined && (
                        <div>
                          <div className="text-sm text-muted-foreground">Avg Job Duration</div>
                          <div className="text-2xl font-bold">
                            {statistics.avg_job_duration.toFixed(2)}s
                          </div>
                        </div>
                      )}
                    </div>
                    {statistics.routine_statistics &&
                      Object.keys(statistics.routine_statistics).length > 0 && (
                        <div className="mt-6">
                          <CardTitle className="text-lg mb-4">Routine Statistics</CardTitle>
                          <div className="space-y-2">
                            {Object.entries(statistics.routine_statistics).map(
                              ([routineId, stats]: [string, any]) => (
                                <Card key={routineId} className="surface-panel">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-mono">{routineId}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Executions:</span>
                                      <span className="font-semibold">
                                        {stats.execution_count || 0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Errors:</span>
                                      <span className="font-semibold text-destructive">
                                        {stats.error_count || 0}
                                      </span>
                                    </div>
                                    {stats.avg_duration !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Avg Duration:</span>
                                        <span>{(stats.avg_duration * 1000).toFixed(2)}ms</span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="surface-panel">
                <EmptyState
                  icon={RefreshCw}
                  title="No statistics available"
                  description="Statistics will be available after the worker processes some jobs."
                />
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 min-h-0 space-y-4 mt-4 outline-none">
            {loadingHistory ? (
              <Card className="surface-panel">
                <CardContent className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : history.length > 0 ? (
              <div className="space-y-2">
                {history.map((record: any, index: number) => (
                  <Card key={index} className="surface-panel">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-mono">{record.routine_id || "Unknown"}</span>
                          <Badge
                            variant={
                              record.status === "completed"
                                ? "secondary"
                                : record.status === "failed"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {record.status || "unknown"}
                          </Badge>
                        </div>
                        {record.timestamp && (
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                          </div>
                        )}
                        {record.error && (
                          <div className="text-xs text-destructive mt-1">Error: {record.error}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="surface-panel">
                <EmptyState
                  icon={RefreshCw}
                  title="No history available"
                  description="Execution history will appear here as the worker processes jobs."
                />
              </Card>
            )}
          </TabsContent>

          {/* Routines Tab */}
          <TabsContent value="routines" className="flex-1 min-h-0 space-y-4 mt-4 outline-none">
            {loadingRoutines ? (
              <Card className="surface-panel">
                <CardContent className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : Object.keys(routineStates).length > 0 ? (
              <div className="grid gap-4">
                {Object.entries(routineStates).map(([routineId, state]: [string, any]) => (
                  <Card key={routineId} className="surface-panel">
                    <CardHeader>
                      <CardTitle className="text-base font-mono">{routineId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={state.status === "idle" ? "secondary" : "default"}>
                            {state.status || "unknown"}
                          </Badge>
                        </div>
                        {state.execution_count !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Execution Count:</span>
                            <span className="font-semibold">{state.execution_count}</span>
                          </div>
                        )}
                        {state.error_count !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Error Count:</span>
                            <span className="font-semibold text-destructive">
                              {state.error_count}
                            </span>
                          </div>
                        )}
                        {state.last_execution_time && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Execution:</span>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(state.last_execution_time), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="surface-panel">
                <EmptyState
                  icon={RefreshCw}
                  title="No routine states available"
                  description="Routine states will appear here once the worker starts processing."
                />
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Job Dialog */}
      {serverUrl && worker && (
        <SubmitJobDialog
          open={submitJobDialogOpen}
          onOpenChange={setSubmitJobDialogOpen}
          flowId={worker.flow_id}
          workerId={worker.worker_id}
          serverUrl={serverUrl}
          onSuccess={handleJobSubmitted}
        />
      )}
    </div>
  );
}
