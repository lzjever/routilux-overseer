"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useJobStore } from "@/lib/stores/jobStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Play, Wifi, WifiOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function JobsPage() {
  const router = useRouter();
  const { connected, serverUrl } = useConnectionStore();
  const { jobs, loading, loadJobs, wsConnected, connectWebSocket, disconnectWebSocket } = useJobStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!connected) {
      router.push("/connect");
      return;
    }

    if (serverUrl) {
      // Load initial jobs
      loadJobs(serverUrl);

      // Connect to WebSocket for real-time updates
      connectWebSocket(serverUrl);
    }

    // Cleanup on unmount
    return () => {
      if (wsConnected) {
        disconnectWebSocket();
      }
    };
  }, [connected, serverUrl]);

  const handleRefresh = async () => {
    if (!serverUrl) return;
    setIsRefreshing(true);
    try {
      await loadJobs(serverUrl);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "running":
        return "default";
      case "completed":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/flows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Flows
            </Button>
          </Link>
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
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.size === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-muted-foreground mb-4">No jobs yet</p>
            <Link href="/flows">
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Start a Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {[...jobs.values()].map((job) => (
            <Card
              key={job.job_id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/jobs/${job.job_id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.job_id}</CardTitle>
                    <CardDescription className="mt-1">
                      Flow: {job.flow_id}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {job.created_at && (
                    <span>
                      Created {formatDistanceToNow(new Date(job.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                  {job.started_at && (
                    <span>• Started {formatDistanceToNow(new Date(job.started_at), {
                      addSuffix: true,
                    })}</span>
                  )}
                  {job.completed_at && (
                    <span>• Completed {formatDistanceToNow(new Date(job.completed_at), {
                      addSuffix: true,
                    })}</span>
                  )}
                </div>
                {job.error && (
                  <div className="mt-2 text-sm text-destructive">
                    Error: {job.error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
