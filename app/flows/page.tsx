"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Network,
  ArrowRight,
  Loader2,
  Plug,
  RefreshCw,
  Download,
  CheckSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { FlowSearchBar } from "@/components/flow/FlowSearchBar";
import { BulkActionsToolbar } from "@/components/common/BulkActionsToolbar";
import { CreateFlowWizard } from "@/components/flow/CreateFlowWizard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { createAPI } from "@/lib/api";
import type { HealthReadinessSummary } from "@/lib/types/api";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FlowsPage() {
  const router = useRouter();
  const { connected, serverUrl } = useConnectionStore();
  const { flows, loading, loadFlows, error: flowError } = useFlowStore();
  const {
    discoveredFlows,
    syncingFlows,
    lastFlowSync,
    discoverFlows: discoverFlowsAction,
    syncFlows: syncFlowsAction,
  } = useDiscoveryStore();
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlows, setSelectedFlows] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [healthSummary, setHealthSummary] = useState<{
    status: string;
    activeWorkers?: number;
  } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    if (serverUrl && connected) {
      loadFlows(serverUrl);
      // Discover flows on mount
      discoverFlowsAction(serverUrl);
    }
  }, [serverUrl, connected, loadFlows, discoverFlowsAction]);

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
    if (serverUrl && connected) {
      loadHealthSummary();
    }
  }, [serverUrl, connected, loadHealthSummary]);

  const handleSync = async () => {
    if (!serverUrl || syncing) return;
    setSyncing(true);
    try {
      const count = await syncFlowsAction(serverUrl);
      console.log(`Sync completed, synced ${count} flows, reloading flows list...`);
      // Wait a bit to ensure server has processed the sync
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Reload flows after sync
      await loadFlows(serverUrl);
      // Show success message
      alert(`Successfully synced ${count} flow${count !== 1 ? "s" : ""} from registry`);
    } catch (error) {
      console.error("Sync error:", error);
      alert(`Failed to sync flows: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!serverUrl || bulkDeleting || selectedFlows.size === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedFlows.size} flow${selectedFlows.size !== 1 ? "s" : ""}?`
      )
    ) {
      return;
    }
    setBulkDeleting(true);
    try {
      const api = createAPI(serverUrl);
      await Promise.all(Array.from(selectedFlows).map((flowId) => api.flows.delete(flowId)));
      setSelectedFlows(new Set());
      await loadFlows(serverUrl);
      alert(
        `Successfully deleted ${selectedFlows.size} flow${selectedFlows.size !== 1 ? "s" : ""}`
      );
    } catch (error) {
      alert(`Failed to delete flows: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleFlowSelection = (flowId: string) => {
    setSelectedFlows((prev) => {
      const next = new Set(prev);
      if (next.has(flowId)) {
        next.delete(flowId);
      } else {
        next.add(flowId);
      }
      return next;
    });
  };

  const filteredFlows = Array.from(flows.values()).filter((flow) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      flow.flow_id.toLowerCase().includes(query) ||
      (flow as any).description?.toLowerCase().includes(query)
    );
  });

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md surface-panel" data-testid="flows-not-connected">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Not Connected
              </CardTitle>
              <CardDescription>Connect to a Routilux server to view flows</CardDescription>
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
    <div className="min-h-screen flex flex-col bg-app" data-testid="flows-page">
      <Navbar />
      <div className="w-full px-4 py-6 flex-1">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Flows</h1>
              <p className="text-muted-foreground">Manage and monitor your workflow definitions</p>
              <div className="text-sm text-muted-foreground mt-2">Connected to: {serverUrl}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                {healthLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : healthSummary ? (
                  <>
                    <Badge variant={healthSummary.status === "ready" ? "secondary" : "destructive"}>
                      {healthSummary.status}
                    </Badge>
                    {typeof healthSummary.activeWorkers === "number" && (
                      <span>{healthSummary.activeWorkers} active workers</span>
                    )}
                  </>
                ) : (
                  <Badge variant="outline">unknown</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {discoveredFlows.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Download className="h-3 w-3" />
                  {discoveredFlows.length} available
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => serverUrl && loadFlows(serverUrl)}
                disabled={loading}
                className="gap-2"
                data-testid="flows-button-refresh"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing || syncingFlows || discoveredFlows.length === 0}
                className="gap-2"
                data-testid="flows-button-sync"
              >
                {syncing || syncingFlows ? (
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
              {serverUrl && (
                <CreateFlowWizard
                  serverUrl={serverUrl}
                  onSuccess={() => {
                    if (serverUrl) {
                      loadFlows(serverUrl);
                    }
                  }}
                  trigger={
                    <Button size="sm" className="gap-2" data-testid="flows-button-create">
                      <Plus className="h-4 w-4" />
                      Create Flow
                    </Button>
                  }
                />
              )}
            </div>
          </div>
          {lastFlowSync && (
            <div className="text-xs text-muted-foreground mt-2">
              Last synced: {lastFlowSync.toLocaleString()}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <FlowSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            testId="flows-input-search"
          />
        </div>

        {/* Error Display */}
        {flowError && (
          <div className="mb-6" data-testid="flows-error">
            <ErrorDisplay
              error={{
                message: String(flowError),
                retry: () => {
                  if (serverUrl) loadFlows(serverUrl);
                },
              }}
              onDismiss={() => {
                if (serverUrl) loadFlows(serverUrl);
              }}
            />
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {selectedFlows.size > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedFlows.size}
            totalCount={filteredFlows.length}
            onSelectAll={() => {
              setSelectedFlows(new Set(filteredFlows.map((f) => f.flow_id)));
            }}
            onDeselectAll={() => setSelectedFlows(new Set())}
            actions={[
              {
                label: "Delete",
                icon: Trash2,
                onClick: handleBulkDelete,
                variant: "destructive",
                disabled: bulkDeleting,
                testId: "flows-button-bulk-delete",
              },
            ]}
            className="mb-4"
            testId="flows-toolbar"
            selectAllTestId="flows-checkbox-select-all"
          />
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="flows-loading">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredFlows.length === 0 ? (
          <Card className="surface-panel" data-testid="flows-empty-state">
            <EmptyState
              icon={Network}
              title={searchQuery ? "No flows found" : "No flows found"}
              description={
                searchQuery
                  ? `No flows match "${searchQuery}". Try a different search term.`
                  : "There are no flows available on the server. Create a new flow or sync from registry."
              }
              action={
                !searchQuery
                  ? serverUrl
                    ? {
                        label: "Create Flow",
                        onClick: () => {
                          // Trigger wizard - this will be handled by CreateFlowWizard
                        },
                      }
                    : {
                        label: "Sync from Registry",
                        onClick: handleSync,
                      }
                  : undefined
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="flows-list">
            {filteredFlows.map((flow) => (
              <Card
                key={flow.flow_id}
                className={cn(
                  "surface-panel group hover:shadow-lg transition-all duration-200",
                  selectedFlows.has(flow.flow_id) && "ring-2 ring-primary"
                )}
                data-testid={`flows-card-${flow.flow_id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlowSelection(flow.flow_id);
                        }}
                        className="mt-1"
                        data-testid={`flows-checkbox-${flow.flow_id}`}
                      >
                        <CheckSquare
                          className={cn(
                            "h-4 w-4",
                            selectedFlows.has(flow.flow_id)
                              ? "text-primary fill-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                      <div
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => router.push(`/flows/${flow.flow_id}`)}
                      >
                        <Activity className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base font-semibold font-mono">
                          {flow.flow_id}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {Object.keys(flow.routines).length} routines • {flow.connections.length}{" "}
                    connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/flows/${flow.flow_id}`);
                      }}
                      data-testid={`flows-button-view-${flow.flow_id}`}
                    >
                      View Flow
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
