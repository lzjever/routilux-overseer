"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useJobStore } from "@/lib/stores/jobStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { MetricsPanel } from "@/components/monitoring/MetricsPanel";
import { EventLog } from "@/components/monitoring/EventLog";
import { useJobMonitor } from "@/lib/websocket/job-monitor";
import { ArrowLeft, Loader2, Pause, Play, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { JobStateResponse } from "@/lib/types/api";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { connected, serverUrl } = useConnectionStore();
  const { jobs, loadJob, pauseJob, resumeJob, cancelJob } = useJobStore();
  const { selectFlow } = useFlowStore();
  const [jobState, setJobState] = useState<JobStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const job = jobs.get(jobId);

  // Start job monitoring
  useJobMonitor(jobId, serverUrl);

  useEffect(() => {
    if (!connected || !serverUrl) {
      router.push("/connect");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load job details
        await loadJob(jobId, serverUrl);

        // Load flow visualization
        if (job) {
          await selectFlow(job.flow_id, serverUrl);
        }

        // Load job state (for metrics and events)
        // TODO: This endpoint might need to be added to the API
        // For now, we'll track state through WebSocket
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [connected, serverUrl, jobId, job, loadJob, selectFlow, router]);

  const handlePause = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await pauseJob(jobId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await resumeJob(jobId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!serverUrl) return;
    if (!confirm("Are you sure you want to cancel this job?")) return;

    setActionLoading(true);
    try {
      await cancelJob(jobId, serverUrl);
      router.push("/jobs");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!serverUrl) return;
    setActionLoading(true);
    try {
      await loadJob(jobId, serverUrl);
    } finally {
      setActionLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  if (loading || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isRunning = job.status === "running";
  const isPaused = job.status === "paused";

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{jobId}</h1>
            <p className="text-muted-foreground">
              Flow: {job.flow_id} •{" "}
              <Badge variant={isRunning ? "default" : "secondary"}>
                {job.status}
              </Badge>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={actionLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              disabled={actionLoading}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}

          {isPaused && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResume}
              disabled={actionLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}

          {(isRunning || isPaused) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Flow Canvas */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Flow Visualization</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <FlowCanvas flowId={job.flow_id} editable={false} />
            </CardContent>
          </Card>
        </div>

        {/* Metrics and Event Log */}
        <div className="space-y-6 overflow-y-auto">
          <MetricsPanel jobState={jobState} loading={loading} />

          <EventLog events={jobState?.execution_history || []} loading={loading} />
        </div>
      </div>
    </div>
  );
}
