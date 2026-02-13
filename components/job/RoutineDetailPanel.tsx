"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Settings,
  Database,
  ScrollText,
  Zap,
  MapPin,
  Pause,
  Play,
  SkipForward,
  X,
  Hash,
  Repeat,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useJobStateStore } from "@/lib/stores/jobStateStore";
import { useJobEventsStore } from "@/lib/stores/jobEventsStore";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { createAPI } from "@/lib/api";

interface RoutineDetailPanelProps {
  routineId: string;
  jobId: string;
  flowId: string;
  serverUrl: string;
}

export function RoutineDetailPanel({
  routineId,
  jobId,
  flowId,
  serverUrl,
}: RoutineDetailPanelProps) {
  const { closeDetailPanel } = useUIStore();
  const routineState = useJobStateStore((s) => s.getRoutineState(jobId, routineId));
  const events = useJobEventsStore((s) =>
    s
      .getEvents(jobId)
      .filter((e) => e.routine_id === routineId)
      .slice(-20)
  );
  const { breakpoints } = useBreakpointStore();
  const jobBreakpoints = breakpoints.get(jobId) || [];
  const routineSlots = useFlowStore((state) => {
    const node = state.nodes.find((item) => item.id === routineId);
    return (node?.data as { slots?: { name: string }[] } | undefined)?.slots ?? [];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const hasBreakpoint = jobBreakpoints.some(
    (bp) => bp.routine_id === routineId && bp.slot_name === selectedSlot
  );

  const config = (routineState as any)?._config;
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!routineSlots.length) {
      setSelectedSlot("");
      return;
    }
    if (!routineSlots.some((slot) => slot.name === selectedSlot)) {
      setSelectedSlot(routineSlots[0].name);
    }
  }, [routineSlots, selectedSlot]);

  // Get status from routine state
  const status = routineState?.status || "pending";
  const getStatusConfig = () => {
    const configs = {
      pending: { color: "text-slate-500", icon: Clock },
      running: { color: "text-blue-500", icon: Activity },
      paused: { color: "text-yellow-500", icon: Pause },
      completed: { color: "text-green-500", icon: CheckCircle },
      failed: { color: "text-red-500", icon: XCircle },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Quick actions
  const handleToggleBreakpoint = async () => {
    if (!serverUrl) return;
    setIsLoading(true);
    try {
      const api = createAPI(serverUrl);
      if (hasBreakpoint) {
        const bp = jobBreakpoints.find(
          (item) => item.routine_id === routineId && item.slot_name === selectedSlot
        );
        if (bp) {
          await api.breakpoints.delete(jobId, bp.breakpoint_id);
        }
      } else {
        await api.breakpoints.create(jobId, {
          routine_id: routineId,
          slot_name: selectedSlot,
          enabled: true,
        });
      }
      // Reload breakpoints
      const { loadBreakpoints } = useBreakpointStore.getState();
      await loadBreakpoints(jobId, serverUrl);
    } catch (error) {
      console.error("Failed to toggle breakpoint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full bg-white shadow-2xl z-50",
        "transform transition-all duration-300 ease-in-out",
        "md:w-96 lg:w-[480px] w-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div>
          <h2 className="text-lg font-bold">{routineId}</h2>
          <p className="text-xs text-slate-500">
            {(routineState as any)?._config?.className || "Unknown Routine"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(statusConfig.color, "capitalize")}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status}
          </Badge>
          <Button variant="ghost" size="sm" onClick={closeDetailPanel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-60px)] p-4 space-y-6">
        {/* Status Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Execution Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
              <div>
                <div className="font-semibold capitalize">{status}</div>
                {(routineState as any)?.start_time && (
                  <div className="text-xs text-slate-500">
                    Started{" "}
                    {formatDistanceToNow(
                      new Date(((routineState as any).start_time as number) * 1000)
                    )}{" "}
                    ago
                  </div>
                )}
              </div>
            </div>

            {((routineState as any)?.processed_count !== undefined ||
              routineState?.execution_count !== undefined) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Executions</span>
                <Badge variant="secondary">
                  {(routineState as any)?.processed_count || routineState?.execution_count || 0}x
                </Badge>
              </div>
            )}

            {(routineState as any)?.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span className="font-mono">
                    {((routineState as any).progress as number).toFixed(0)}%
                  </span>
                </div>
                <Progress value={(routineState as any).progress as number} className="h-2" />
              </div>
            )}

            {(routineState as any)?.current_iteration !== undefined && (
              <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg">
                <Repeat className="h-4 w-4 text-cyan-500" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-cyan-900">Loop Iteration</div>
                  <div className="text-sm font-mono text-cyan-700">
                    {(routineState as any).current_iteration} /{" "}
                    {(routineState as any).max_iterations}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakpoint Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-500" />
              Breakpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {routineSlots.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No input slots available for this routine.
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(event) => setSelectedSlot(event.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border bg-background"
                  >
                    {routineSlots.map((slot) => (
                      <option key={slot.name} value={slot.name}>
                        {slot.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant={hasBreakpoint ? "default" : "outline"}
                  size="sm"
                  className={cn(hasBreakpoint && "bg-violet-500 hover:bg-violet-600")}
                  onClick={handleToggleBreakpoint}
                  disabled={isLoading || !selectedSlot}
                >
                  {hasBreakpoint ? "Remove BP" : "Set BP"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Configuration Card */}
        {config && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-600" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <pre className="text-xs bg-slate-50 p-3 rounded font-mono overflow-auto">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Execution State Card */}
        {routineState && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                Execution State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <pre className="text-xs bg-slate-50 p-3 rounded font-mono overflow-auto">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(routineState).filter(([key]) => key !== "_config")
                    ),
                    null,
                    2
                  )}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Events Card */}
        {events.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-orange-600" />
                Recent Events ({events.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {events.map((event, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 bg-slate-50 rounded font-mono hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Clock className="h-3 w-3" />
                        {new Date(
                          (typeof event.timestamp === "number"
                            ? event.timestamp
                            : new Date(event.timestamp).getTime() / 1000) * 1000
                        ).toLocaleTimeString()}
                      </div>
                      <div className="text-slate-700">{JSON.stringify(event.data || event)}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start" disabled={status !== "running"}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>

              <Button variant="outline" className="justify-start" disabled={status !== "paused"}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>

              <Button variant="outline" className="justify-start" disabled={status !== "paused"}>
                <SkipForward className="h-4 w-4 mr-2" />
                Step Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
}
