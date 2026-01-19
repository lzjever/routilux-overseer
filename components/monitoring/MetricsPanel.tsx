"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobResponse, ExecutionMetricsResponse } from "@/lib/api/generated";
import { Clock, Activity, Zap, AlertCircle, Calendar, Timer, GitCommit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MetricsPanelProps {
  job: JobResponse;
  metrics?: ExecutionMetricsResponse | null;
  eventsCount: number;
  loading?: boolean;
}

export function MetricsPanel({ job, metrics, eventsCount, loading }: MetricsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Metrics</CardTitle>
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

  // Calculate duration (prefer metrics, fallback to timestamps)
  const calculateDuration = () => {
    if (metrics?.duration != null) {
      return `${metrics.duration.toFixed(2)}s`;
    }
    if (job.started_at && job.completed_at) {
      const start = new Date(job.started_at * 1000);
      const end = new Date(job.completed_at * 1000);
      return `${((end.getTime() - start.getTime()) / 1000).toFixed(2)}s`;
    }
    if (job.started_at) {
      const start = new Date(job.started_at * 1000);
      const now = new Date();
      return `${((now.getTime() - start.getTime()) / 1000).toFixed(2)}s`;
    }
    return null;
  };

  const duration = calculateDuration();
  const totalEvents = metrics?.total_events ?? eventsCount;
  const totalSlotCalls = metrics?.total_slot_calls;
  const totalEventEmits = metrics?.total_event_emits;
  const errorCount = metrics?.errors?.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={job.status === "running" ? "default" : job.status === "failed" ? "destructive" : "secondary"}>
            {job.status}
          </Badge>
        </div>

        {/* Duration */}
        {duration && (
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold">{duration}</p>
            </div>
          </div>
        )}

        {/* Total Events */}
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-purple-500" />
          <div>
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>
        </div>

        {typeof totalSlotCalls === "number" && (
          <div className="flex items-center gap-3">
            <GitCommit className="h-5 w-5 text-sky-500" />
            <div>
              <p className="text-sm text-muted-foreground">Slot Calls</p>
              <p className="text-2xl font-bold">{totalSlotCalls}</p>
            </div>
          </div>
        )}

        {typeof totalEventEmits === "number" && (
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-sm text-muted-foreground">Event Emits</p>
              <p className="text-2xl font-bold">{totalEventEmits}</p>
            </div>
          </div>
        )}

        {/* Created Time */}
        {job.created_at && (
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-semibold">
                {formatDistanceToNow(new Date(job.created_at * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {/* Started Time */}
        {job.started_at && (
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Started</p>
              <p className="text-sm font-semibold">
                {formatDistanceToNow(new Date(job.started_at * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {(job.error || (errorCount && errorCount > 0)) && (
          <div className="flex items-start gap-3 pt-2 border-t">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Error</p>
              <p className="text-sm font-semibold text-red-600 break-words">
                {job.error || `${errorCount} errors`}
              </p>
            </div>
          </div>
        )}

        {/* System Health */}
        {!job.error && (
          <div className="flex items-center gap-3 pt-2 border-t">
            <Zap className="h-5 w-5 text-green-500" />
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
