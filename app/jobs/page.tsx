"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobStore } from "@/lib/stores/jobStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Play,
  Wifi,
  WifiOff,
  RefreshCw,
  Plug,
  Trash2,
  Download,
  CheckSquare,
  X,
} from "lucide-react";
import { ActiveFiltersBar } from "@/components/job/ActiveFiltersBar";
import { QuickFilters } from "@/components/job/QuickFilters";
import { BulkActionsToolbar } from "@/components/common/BulkActionsToolbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createAPI } from "@/lib/api";
import type { HealthReadinessSummary } from "@/lib/types/api";
import { cn } from "@/lib/utils";

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, serverUrl } = useConnectionStore();
  const { jobs, loading, loadJobs, setJobs, wsConnected, connectWebSocket, disconnectWebSocket } =
    useJobStore();
  const { flows } = useFlowStore();
  const {
    discoveredJobs,
    syncingJobs,
    lastJobSync,
    discoverJobs: discoverJobsAction,
    syncJobs: syncJobsAction,
  } = useDiscoveryStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterFlowId, setFilterFlowId] = useState<string>(searchParams.get("flowId") || "all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [syncing, setSyncing] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [bulkCancelling, setBulkCancelling] = useState(false);
  const [healthSummary, setHealthSummary] = useState<{
    status: string;
    activeWorkers?: number;
  } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const loadJobsWithFilters = useCallback(async () => {
    if (!serverUrl) return;

    try {
      const api = createAPI(serverUrl);
      const params: any = {};
      if (filterFlowId !== "all") params.flow_id = filterFlowId;
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await api.jobs.list(
        null, // workerId
        params.flow_id || null, // flowId
        params.status || null, // status
        params.limit || 100, // limit
        params.offset // offset
      );

      setJobs(response.jobs || []);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  }, [serverUrl, filterFlowId, filterStatus, setJobs]);

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
      // Load initial jobs
      loadJobsWithFilters();

      // Connect to WebSocket for real-time updates
      if (connected) {
        connectWebSocket(serverUrl);
      }

      // Discover jobs on mount
      if (connected) {
        discoverJobsAction(serverUrl);
      }
    }

    // Cleanup on unmount
    return () => {
      if (wsConnected) {
        disconnectWebSocket();
      }
    };
  }, [
    serverUrl,
    connected,
    discoverJobsAction,
    connectWebSocket,
    disconnectWebSocket,
    loadJobsWithFilters,
    wsConnected,
  ]);

  useEffect(() => {
    if (serverUrl && connected) {
      loadHealthSummary();
    }
  }, [serverUrl, connected, loadHealthSummary]);

  const handleRefresh = async () => {
    if (!serverUrl) return;
    setIsRefreshing(true);
    try {
      await loadJobsWithFilters();
      // Also refresh discovery
      await discoverJobsAction(serverUrl);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSync = async () => {
    if (!serverUrl || syncing) return;
    setSyncing(true);
    try {
      const count = await syncJobsAction(serverUrl);
      // Reload jobs after sync
      await loadJobsWithFilters();
      // Show success message
      alert(`Successfully synced ${count} job${count !== 1 ? "s" : ""} from registry`);
    } catch (error) {
      alert(`Failed to sync jobs: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkCancel = async () => {
    if (!serverUrl || bulkCancelling || selectedJobs.size === 0) return;
    // Note: cancel API is no longer available at Job level
    // To cancel jobs, navigate to the Worker page and stop the worker
    alert(
      "Job cancellation is no longer available at Job level. Please navigate to the Worker page to manage jobs."
    );
    setSelectedJobs(new Set());
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
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

  const filteredJobs = Array.from(jobs.values()).filter((job) => {
    if (filterFlowId !== "all" && job.flow_id !== filterFlowId) return false;
    if (filterStatus !== "all" && job.status !== filterStatus) return false;
    return true;
  });

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md surface-panel" data-testid="jobs-not-connected">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Not Connected
              </CardTitle>
              <CardDescription>Connect to a Routilux server to view jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/connect")} className="w-full">
                Connect to Server
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app" data-testid="jobs-page">
      <Navbar />
      <div className="w-full px-4 py-6 flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                {jobs.size} job{jobs.size !== 1 ? "s" : ""}
              </p>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-muted-foreground">Offline</span>
                  </>
                )}
              </div>
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
            {discoveredJobs.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Download className="h-3 w-3" />
                {discoveredJobs.length} available
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing || syncingJobs || discoveredJobs.length === 0}
              className="gap-2"
              data-testid="jobs-button-sync"
            >
              {syncing || syncingJobs ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync from Registry
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              data-testid="jobs-button-refresh"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          {lastJobSync && (
            <div className="text-xs text-muted-foreground mt-2">
              Last synced: {lastJobSync.toLocaleString()}
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div className="mb-4">
          <QuickFilters activeFilter={filterStatus} onFilterChange={setFilterStatus} />
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
        {filteredJobs.length !== jobs.size && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.size} jobs
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {selectedJobs.size > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedJobs.size}
            totalCount={filteredJobs.length}
            onSelectAll={() => {
              setSelectedJobs(new Set(filteredJobs.map((j) => j.job_id)));
            }}
            onDeselectAll={() => setSelectedJobs(new Set())}
            actions={[
              {
                label: "Cancel (worker only)",
                icon: X,
                onClick: handleBulkCancel,
                variant: "destructive",
                disabled: bulkCancelling,
              },
            ]}
            className="mb-4"
          />
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
                  <SelectTrigger className="h-10" data-testid="jobs-select-status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Job pause/cancel events are not emitted. Use Worker controls for pause/stop.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <div
            className="flex items-center justify-center min-h-[200px]"
            data-testid="jobs-loading"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="surface-panel" data-testid="jobs-empty-state">
            <EmptyState
              icon={Play}
              title={jobs.size === 0 ? "No jobs yet" : "No jobs match filters"}
              description={
                jobs.size === 0
                  ? "Get started by creating a job from one of your flows."
                  : "Try adjusting your filters to see more jobs."
              }
              action={
                jobs.size === 0
                  ? {
                      label: "Start a Job",
                      href: "/flows",
                    }
                  : undefined
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4" data-testid="jobs-table-list">
            {filteredJobs.map((job) => (
              <Card
                key={job.job_id}
                className={cn(
                  "surface-panel group hover:shadow-lg transition-all duration-200",
                  selectedJobs.has(job.job_id) && "ring-2 ring-primary"
                )}
                data-testid={`jobs-row-${job.job_id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleJobSelection(job.job_id);
                        }}
                      >
                        <CheckSquare
                          className={cn(
                            "h-4 w-4",
                            selectedJobs.has(job.job_id)
                              ? "text-primary fill-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/jobs/${job.job_id}`)}
                      >
                        <CardTitle className="text-base font-semibold font-mono">
                          {job.job_id}
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          Flow: {job.flow_id}
                        </CardDescription>
                      </div>
                    </div>
                    <StatusBadge
                      status={job.status}
                      showSpinner={job.status === "running"}
                      errorMessage={job.error ?? undefined}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {job.created_at && (
                      <span>
                        Created{" "}
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                    {job.started_at && (
                      <span>
                        • Started{" "}
                        {formatDistanceToNow(new Date(job.started_at), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                    {job.completed_at && (
                      <span>
                        • Completed{" "}
                        {formatDistanceToNow(new Date(job.completed_at), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  {job.error && (
                    <div className="mt-2 text-xs text-destructive">Error: {job.error}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
