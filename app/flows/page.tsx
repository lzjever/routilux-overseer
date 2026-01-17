"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Network, ArrowRight, Loader2, Plug, RefreshCw, Download, CheckSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { FlowSearchBar } from "@/components/flow/FlowSearchBar";
import { BulkActionsToolbar } from "@/components/common/BulkActionsToolbar";
import { CreateFlowWizard } from "@/components/flow/CreateFlowWizard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { createAPI } from "@/lib/api";
import { Plus } from "lucide-react";

export default function FlowsPage() {
  const router = useRouter();
  const { connected, serverUrl } = useConnectionStore();
  const { flows, loading, loadFlows } = useFlowStore();
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

  useEffect(() => {
    if (serverUrl && connected) {
      loadFlows(serverUrl);
      // Discover flows on mount
      discoverFlowsAction(serverUrl);
    }
  }, [serverUrl, connected, loadFlows, discoverFlowsAction]);

  const handleSync = async () => {
    if (!serverUrl || syncing) return;
    setSyncing(true);
    try {
      const count = await syncFlowsAction(serverUrl);
      // Reload flows after sync
      await loadFlows(serverUrl);
      // Show success message
      alert(`Successfully synced ${count} flow${count !== 1 ? "s" : ""} from registry`);
    } catch (error) {
      alert(`Failed to sync flows: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!serverUrl || bulkDeleting || selectedFlows.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFlows.size} flow${selectedFlows.size !== 1 ? "s" : ""}?`)) {
      return;
    }
    setBulkDeleting(true);
    try {
      const api = createAPI(serverUrl);
      await Promise.all(
        Array.from(selectedFlows).map((flowId) => api.flows.deleteFlow(flowId))
      );
      setSelectedFlows(new Set());
      await loadFlows(serverUrl);
      alert(`Successfully deleted ${selectedFlows.size} flow${selectedFlows.size !== 1 ? "s" : ""}`);
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Not Connected
              </CardTitle>
              <CardDescription>
                Connect to a Routilux server to view flows
              </CardDescription>
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Flows</h1>
            <p className="text-muted-foreground">
              Manage and monitor your workflow definitions
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              Connected to: {serverUrl}
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
              onClick={handleSync}
              disabled={syncing || syncingFlows || discoveredFlows.length === 0}
              className="gap-2"
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
                  <Button size="sm" className="gap-2">
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
        <FlowSearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

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
            },
          ]}
          className="mb-4"
        />
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredFlows.length === 0 ? (
        <Card>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlows.map((flow) => (
            <Card
              key={flow.flow_id}
              className={cn(
                "group hover:shadow-lg transition-all duration-200",
                selectedFlows.has(flow.flow_id) && "ring-2 ring-primary"
              )}
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
                      <CardTitle className="text-lg">{flow.flow_id}</CardTitle>
                    </div>
                  </div>
                </div>
                <CardDescription>
                  {Object.keys(flow.routines).length} routines •{" "}
                  {flow.connections.length} connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Execution</span>
                    <Badge variant="outline">
                      {flow.execution_strategy}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Workers</span>
                    <span className="font-mono">{flow.max_workers}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/flows/${flow.flow_id}`);
                    }}
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
