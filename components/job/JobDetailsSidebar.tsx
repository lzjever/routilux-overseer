"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useJobStore } from "@/lib/stores/jobStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import type {
  JobMonitoringData,
  ExecutionMetricsResponse,
  SlotQueueStatus,
  RoutineMonitoringData,
} from "@/lib/api/generated";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobDetailsSidebarProps {
  jobId: string;
  serverUrl: string;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
}

export function JobDetailsSidebar({
  jobId,
  serverUrl,
  selectedNodeId,
  selectedEdgeId,
}: JobDetailsSidebarProps) {
  const { monitoringData, metricsData, loadJobMonitoringData, loadJobMetrics } = useJobStore();
  const { edges } = useFlowStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "node" | "edge" | "metrics">("overview");

  const monitoring = monitoringData.get(jobId);
  const metrics = metricsData.get(jobId);

  // Load monitoring data
  useEffect(() => {
    if (jobId && serverUrl) {
      setLoading(true);
      Promise.all([
        loadJobMonitoringData(jobId, serverUrl),
        loadJobMetrics(jobId, serverUrl),
      ]).finally(() => setLoading(false));
    }
  }, [jobId, serverUrl, loadJobMonitoringData, loadJobMetrics]);

  // Switch tab based on selection
  useEffect(() => {
    if (selectedNodeId) {
      setActiveTab("node");
    } else if (selectedEdgeId) {
      setActiveTab("edge");
    }
  }, [selectedNodeId, selectedEdgeId]);

  if (loading && !monitoring) {
    return (
      <div className="w-80 border-l bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!monitoring) {
    return (
      <div className="w-80 border-l bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No monitoring data available</p>
      </div>
    );
  }

  const selectedRoutine = selectedNodeId ? monitoring.routines[selectedNodeId] : null;
  const selectedEdge = selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) : null;

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="flex-1 flex flex-col h-full"
      >
        <div className="border-b px-4 pt-3">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="node" className="text-xs" disabled={!selectedNodeId}>
              Node
            </TabsTrigger>
            <TabsTrigger value="edge" className="text-xs" disabled={!selectedEdgeId}>
              Edge
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">
              Metrics
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job ID:</span>
                    <span className="font-mono text-xs">{monitoring.job_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flow ID:</span>
                    <span className="font-mono text-xs">{monitoring.flow_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={monitoring.job_status === "running" ? "default" : "secondary"}>
                      {monitoring.job_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="text-xs">
                      {formatDistanceToNow(new Date(monitoring.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {metrics && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Execution Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Events:</span>
                      <span className="font-semibold">{metrics.total_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slot Calls:</span>
                      <span className="font-semibold">{metrics.total_slot_calls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Emits:</span>
                      <span className="font-semibold">{metrics.total_event_emits}</span>
                    </div>
                    {metrics.duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-semibold">{metrics.duration.toFixed(2)}s</span>
                      </div>
                    )}
                    {metrics.errors && metrics.errors.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-destructive">
                          <span>Errors:</span>
                          <span className="font-semibold">{metrics.errors.length}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Routines Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.values(monitoring.routines).map((routine: RoutineMonitoringData) => (
                      <div
                        key={routine.routine_id}
                        className="p-2 rounded border bg-muted/50 text-sm"
                      >
                        <div className="font-medium">{routine.routine_id}</div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Exec: {routine.execution_status.execution_count || 0}</span>
                          <span>Errors: {routine.execution_status.error_count || 0}</span>
                          <span>Threads: {routine.execution_status.active_thread_count || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Node Tab */}
            <TabsContent value="node" className="mt-0 space-y-4">
              {selectedRoutine ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        Routine: {selectedRoutine.routine_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-mono text-xs">
                          {selectedRoutine.info.routine_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={
                            selectedRoutine.execution_status.is_active ? "default" : "secondary"
                          }
                        >
                          {selectedRoutine.execution_status.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Execution Count:</span>
                        <span className="font-semibold">
                          {selectedRoutine.execution_status.execution_count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Error Count:</span>
                        <span className="font-semibold text-destructive">
                          {selectedRoutine.execution_status.error_count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Threads:</span>
                        <span className="font-semibold">
                          {selectedRoutine.execution_status.active_thread_count || 0}
                        </span>
                      </div>
                      {selectedRoutine.execution_status.last_execution_time && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Execution:</span>
                          <span className="text-xs">
                            {formatDistanceToNow(
                              new Date(selectedRoutine.execution_status.last_execution_time),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Queue Status */}
                  {selectedRoutine.queue_status.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Queue Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedRoutine.queue_status.map((queue: SlotQueueStatus) => (
                          <div key={queue.slot_name} className="p-2 rounded border bg-muted/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{queue.slot_name}</span>
                              <Badge
                                variant={
                                  queue.pressure_level === "critical"
                                    ? "destructive"
                                    : queue.pressure_level === "high"
                                      ? "default"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {queue.pressure_level}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Usage:</span>
                                <span>{(queue.usage_percentage * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Unconsumed:</span>
                                <span>
                                  {queue.unconsumed_count}/{queue.total_count}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Max Length:</span>
                                <span>{queue.max_length}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Routine Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Routine Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Slots:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedRoutine.info.slots.map((slot) => (
                            <Badge key={slot} variant="outline" className="text-xs">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Events:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedRoutine.info.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Select a node to view details
                </div>
              )}
            </TabsContent>

            {/* Edge Tab */}
            <TabsContent value="edge" className="mt-0 space-y-4">
              {selectedEdge && selectedRoutine ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Connection Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Source:</div>
                      <div className="font-mono text-xs">
                        {selectedEdge.source}.{selectedEdge.sourceHandle}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Target:</div>
                      <div className="font-mono text-xs">
                        {selectedEdge.target}.{selectedEdge.targetHandle}
                      </div>
                    </div>
                    {selectedRoutine.queue_status
                      .filter((q: SlotQueueStatus) => q.slot_name === selectedEdge.targetHandle)
                      .map((queue: SlotQueueStatus) => (
                        <div key={queue.slot_name} className="pt-2 border-t space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Queue Usage:</span>
                            <span className="font-semibold">
                              {(queue.usage_percentage * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unconsumed:</span>
                            <span>
                              {queue.unconsumed_count}/{queue.total_count}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pressure:</span>
                            <Badge
                              variant={
                                queue.pressure_level === "critical"
                                  ? "destructive"
                                  : queue.pressure_level === "high"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {queue.pressure_level}
                            </Badge>
                          </div>
                          {queue.is_full && (
                            <div className="text-xs text-destructive">Queue is full</div>
                          )}
                          {queue.is_near_full && (
                            <div className="text-xs text-yellow-600">Queue is near full</div>
                          )}
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Select an edge to view details
                </div>
              )}
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="mt-0 space-y-4">
              {metrics ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Job Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Time:</span>
                        <span className="text-xs">
                          {new Date(metrics.start_time).toLocaleString()}
                        </span>
                      </div>
                      {metrics.end_time && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End Time:</span>
                          <span className="text-xs">
                            {new Date(metrics.end_time).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {metrics.duration && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold">{metrics.duration.toFixed(2)}s</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Routine Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.values(metrics.routine_metrics).map((routineMetrics) => (
                          <div
                            key={routineMetrics.routine_id}
                            className="p-2 rounded border bg-muted/50"
                          >
                            <div className="font-medium text-sm mb-2">
                              {routineMetrics.routine_id}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Executions:</span>
                                <span className="ml-1 font-semibold">
                                  {routineMetrics.execution_count}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Errors:</span>
                                <span className="ml-1 font-semibold text-destructive">
                                  {routineMetrics.error_count}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Avg Duration:</span>
                                <span className="ml-1">
                                  {(routineMetrics.avg_duration * 1000).toFixed(2)}ms
                                </span>
                              </div>
                              {routineMetrics.min_duration && routineMetrics.max_duration && (
                                <>
                                  <div>
                                    <span className="text-muted-foreground">Min:</span>
                                    <span className="ml-1">
                                      {(routineMetrics.min_duration * 1000).toFixed(2)}ms
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Max:</span>
                                    <span className="ml-1">
                                      {(routineMetrics.max_duration * 1000).toFixed(2)}ms
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                            {routineMetrics.last_execution && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Last:{" "}
                                {formatDistanceToNow(new Date(routineMetrics.last_execution), {
                                  addSuffix: true,
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No metrics data available
                </div>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
