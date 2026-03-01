"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkersStore } from "@/lib/stores/workersStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Play,
  RefreshCw,
  Plug,
  CheckSquare,
  Pause,
  PlayCircle,
  XCircle,
  Download,
} from "lucide-react";
import { ActiveFiltersBar } from "@/components/job/ActiveFiltersBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { createAPI } from "@/lib/api";
import type { HealthReadinessSummary } from "@/lib/types/api";

function WorkersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, serverUrl } = useConnectionStore();
  const { workers, loading, loadWorkers, stopWorker, pauseWorker, resumeWorker } =
    useWorkersStore();
  const { lastWorkerSync, syncWorkers: syncWorkersAction } = useDiscoveryStore();
  const { flows } = useFlowStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterFlowId, setFilterFlowId] = useState<string>(searchParams.get("flowId") || "all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [syncingWorkers, setSyncingWorkers] = useState(false);
  const [healthSummary, setHealthSummary] = useState<{
    status: string;
    activeWorkers?: number;
  } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const loadWorkersWithFilters = useCallback(async () => {
    if (!serverUrl) return;

    try {
      await loadWorkers(
        serverUrl,
        filterFlowId !== "all" ? filterFlowId : null,
        filterStatus !== "all" ? filterStatus : null
      );
    } catch (error) {
      console.error("Failed to load workers:", error);
    }
  }, [serverUrl, filterFlowId, filterStatus, loadWorkers]);

  const loadHealthSummary = useCallback(async () => {
    if (!serverUrl) return;
    setHealthLoading(true);
    try {
      const api = createAPI(serverUrl);
      const readiness = (await api.health.readiness()) as HealthReadinessSummary | null;
      const activeWorkers = readiness?.runtime?.active_workers;
      const status = readiness?.status || "unknown";
      setHealthSummary({ status, activeWorkers });
    } catch (error) {
      setHealthSummary(null);
    } finally {
      setHealthLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    if (serverUrl) {
      loadWorkersWithFilters();
    }
  }, [serverUrl, loadWorkersWithFilters]);

  useEffect(() => {
    if (serverUrl && connected) {
      loadHealthSummary();
    }
  }, [serverUrl, connected, loadHealthSummary]);

  const handleRefresh = async () => {
    if (!serverUrl) return;
    setIsRefreshing(true);
    try {
      await loadWorkersWithFilters();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStop = async (workerId: string) => {
    if (!serverUrl) return;
    if (
      !confirm(
        "Are you sure you want to stop this worker? All jobs in progress may be interrupted."
      )
    )
      return;

    setActionLoading(workerId);
    try {
      await stopWorker(workerId, serverUrl);
      await loadWorkersWithFilters();
    } catch (error) {
      alert(`Failed to stop worker: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncWorkers = async () => {
    if (!serverUrl || syncingWorkers) return;
    setSyncingWorkers(true);
    try {
      await syncWorkersAction(serverUrl);
      await loadWorkersWithFilters();
      alert("Workers synced from runtime.");
    } catch (error) {
      alert(`Failed to sync workers: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncingWorkers(false);
    }
  };

  const handlePause = async (workerId: string) => {
    if (!serverUrl) return;
    setActionLoading(workerId);
    try {
      await pauseWorker(workerId, serverUrl);
      await loadWorkersWithFilters();
    } catch (error) {
      alert(`Failed to pause worker: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (workerId: string) => {
    if (!serverUrl) return;
    setActionLoading(workerId);
    try {
      await resumeWorker(workerId, serverUrl);
      await loadWorkersWithFilters();
    } catch (error) {
      alert(`Failed to resume worker: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers((prev) => {
      const next = new Set(prev);
      if (next.has(workerId)) {
        next.delete(workerId);
      } else {
        next.add(workerId);
      }
      return next;
    });
  };

  const activeFilters = [
    filterFlowId !== "all" && {
      key: "flow",
      label: "Flow",
      value: filterFlowId,
    },
    filterStatus !== "all" && {
      key: "status",
      label: "Status",
      value: filterStatus,
    },
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  const filteredWorkers = Array.from(workers.values()).filter((worker) => {
    if (filterFlowId !== "all" && worker.flow_id !== filterFlowId) return false;
    if (filterStatus !== "all" && worker.status !== filterStatus) return false;
    return true;
  });

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md surface-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Not Connected
              </CardTitle>
              <CardDescription>Connect to a Routilux server to view workers</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/connect")} className="w-full">
                Connect to Server
              </Button>
            </CardContent>
          </Card>
        </div>
        {lastWorkerSync && (
          <div className="text-xs text-muted-foreground mt-2">
            Last synced: {lastWorkerSync.toLocaleString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app" data-testid="workers-page">
      <Navbar />
      <div className="w-full px-4 py-6 flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workers</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                {workers.size} worker{workers.size !== 1 ? "s" : ""}
              </p>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2 text-xs">
                {healthLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : healthSummary ? (
                  <>
                    <Badge variant={healthSummary.status === "ready" ? "secondary" : "destructive"}>
                      {healthSummary.status}
                    </Badge>
                    {typeof healthSummary.activeWorkers === "number" && (
                      <span className="text-muted-foreground">
                        {healthSummary.activeWorkers} active workers
                      </span>
                    )}
                  </>
                ) : (
                  <Badge variant="outline">unknown</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncWorkers}
              disabled={syncingWorkers}
              data-testid="workers-button-sync"
            >
              {syncingWorkers ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Sync Workers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              data-testid="workers-button-refresh"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFilters.length > 0 && (
          <ActiveFiltersBar
            filters={activeFilters}
            onRemove={(key) => {
              if (key === "flow") setFilterFlowId("all");
              if (key === "status") setFilterStatus("all");
            }}
            onClearAll={() => {
              setFilterFlowId("all");
              setFilterStatus("all");
            }}
            className="mb-4"
          />
        )}

        {/* Filter Summary */}
        {filteredWorkers.length !== workers.size && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredWorkers.length} of {workers.size} workers
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 surface-panel">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Flow</Label>
                <Select value={filterFlowId} onValueChange={setFilterFlowId}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Flows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flows</SelectItem>
                    {Array.from(flows.values()).map((flow) => (
                      <SelectItem key={flow.flow_id} value={flow.flow_id}>
                        {flow.flow_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workers List */}
        {loading ? (
          <div
            className="flex items-center justify-center min-h-[200px]"
            data-testid="workers-loading"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredWorkers.length === 0 ? (
          <Card className="surface-panel" data-testid="workers-empty-state">
            <EmptyState
              icon={Play}
              title={workers.size === 0 ? "No workers yet" : "No workers match filters"}
              description={
                workers.size === 0
                  ? "Get started by creating a worker from one of your flows."
                  : "Try adjusting your filters to see more workers."
              }
              action={
                workers.size === 0
                  ? {
                      label: "Create a Worker",
                      href: "/flows",
                    }
                  : undefined
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4" data-testid="workers-list">
            {filteredWorkers.map((worker) => (
              <Card
                key={worker.worker_id}
                className={cn(
                  "surface-panel group hover:shadow-lg transition-all duration-200",
                  selectedWorkers.has(worker.worker_id) && "ring-2 ring-primary"
                )}
                data-testid={`workers-card-${worker.worker_id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkerSelection(worker.worker_id);
                        }}
                      >
                        <CheckSquare
                          className={cn(
                            "h-4 w-4",
                            selectedWorkers.has(worker.worker_id)
                              ? "text-primary fill-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/workers/${worker.worker_id}`)}
                      >
                        <CardTitle className="text-base font-semibold font-mono">
                          {worker.worker_id}
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          Flow: {worker.flow_id}
                        </CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={worker.status} showSpinner={worker.status === "running"} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {worker.created_at && (
                      <span>
                        Created{" "}
                        {formatDistanceToNow(new Date(worker.created_at * 1000), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                    {worker.started_at && (
                      <span>
                        • Started{" "}
                        {formatDistanceToNow(new Date(worker.started_at * 1000), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs mb-3">
                    {worker.jobs_processed !== undefined && (
                      <span>
                        <span className="text-muted-foreground">Jobs Processed:</span>{" "}
                        <span className="font-medium">{worker.jobs_processed}</span>
                      </span>
                    )}
                    {worker.jobs_failed !== undefined && worker.jobs_failed > 0 && (
                      <span>
                        <span className="text-muted-foreground">Jobs Failed:</span>{" "}
                        <span className="font-medium text-destructive">{worker.jobs_failed}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {worker.status === "running" && (
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`workers-button-pause-${worker.worker_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePause(worker.worker_id);
                        }}
                        disabled={actionLoading === worker.worker_id}
                      >
                        {actionLoading === worker.worker_id ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Pause className="mr-2 h-3 w-3" />
                        )}
                        Pause
                      </Button>
                    )}
                    {worker.status === "paused" && (
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`workers-button-resume-${worker.worker_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResume(worker.worker_id);
                        }}
                        disabled={actionLoading === worker.worker_id}
                      >
                        {actionLoading === worker.worker_id ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <PlayCircle className="mr-2 h-3 w-3" />
                        )}
                        Resume
                      </Button>
                    )}
                    {(worker.status === "running" ||
                      worker.status === "paused" ||
                      worker.status === "idle") && (
                      <Button
                        variant="destructive"
                        size="sm"
                        data-testid={`workers-button-stop-${worker.worker_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStop(worker.worker_id);
                        }}
                        disabled={actionLoading === worker.worker_id}
                      >
                        {actionLoading === worker.worker_id ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-3 w-3" />
                        )}
                        Stop
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <WorkersPageContent />
    </Suspense>
  );
}
