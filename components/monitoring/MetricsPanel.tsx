"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobStateResponse } from "@/lib/types/api";
import { Clock, Activity, Zap, AlertCircle } from "lucide-react";

interface MetricsPanelProps {
  jobState: JobStateResponse | null;
  loading?: boolean;
}

export function MetricsPanel({ jobState, loading }: MetricsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No metrics available</p>
        </CardContent>
      </Card>
    );
  }

  const totalEvents = jobState.execution_history.length;
  const routineCount = Object.keys(jobState.routine_states).length;
  const activeRoutines = Object.values(jobState.routine_states).filter(
    (r) => r.status === "running"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={jobState.status === "running" ? "default" : "secondary"}>
            {jobState.status}
          </Badge>
        </div>

        {/* Total Events */}
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>
        </div>

        {/* Active Routines */}
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm text-muted-foreground">Active Routines</p>
            <p className="text-2xl font-bold">
              {activeRoutines} / {routineCount}
            </p>
          </div>
        </div>

        {/* Routine States */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Routine Execution Counts
          </p>
          <div className="space-y-1">
            {Object.entries(jobState.routine_states).map(([routineId, state]) => (
              <div
                key={routineId}
                className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
              >
                <span className="font-mono text-xs">{routineId}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {state.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    {state.execution_count}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Errors */}
        {totalEvents > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">System Health</p>
              <p className="text-sm font-semibold text-green-600">All systems operational</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
