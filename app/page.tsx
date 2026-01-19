"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useJobStore } from "@/lib/stores/jobStore";
import { useDiscoveryStore } from "@/lib/stores/discoveryStore";
import { createAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Activity, Zap, ArrowRight, Play, Plug, Settings, RefreshCw } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { connected, serverUrl } = useConnectionStore();
  const { flows } = useFlowStore();
  const { jobs } = useJobStore();
  const { lastFlowSync, lastJobSync, lastWorkerSync } = useDiscoveryStore();
  const [loading, setLoading] = useState(true);
  const [healthStats, setHealthStats] = useState<Record<string, any> | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthUpdatedAt, setHealthUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (serverUrl) {
        setLoading(true);
        try {
          // Load flows and jobs data
          await Promise.all([
            useFlowStore.getState().loadFlows(serverUrl),
            useJobStore.getState().loadJobs(serverUrl),
          ]);
        } catch (error) {
          console.error("Failed to load data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [serverUrl]);

  const loadHealthStats = async () => {
    if (!serverUrl) return;
    setHealthLoading(true);
    setHealthError(null);
    try {
      const api = createAPI(serverUrl);
      const stats = await api.health.stats();
      setHealthStats(stats || {});
      setHealthUpdatedAt(new Date().toISOString());
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : "Failed to load health stats");
      setHealthStats(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (serverUrl && connected) {
      loadHealthStats();
    }
  }, [serverUrl, connected]);

  // Show connection prompt if not connected
  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Not Connected
              </CardTitle>
              <CardDescription>
                Connect to a Routilux server to view flows and jobs
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

  // Calculate statistics
  const flowCount = flows.size;
  const jobCount = jobs.size;
  const runningJobs = [...jobs.values()].filter((j) => j.status === "running").length;
  const recentJobs = [...jobs.values()]
    .filter((j) => j.created_at)
    .sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="w-full px-4 py-8">
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Routilux Overseer
          </h1>
          <p className="text-xl text-muted-foreground mx-auto">
            Comprehensive observability, debugging, and control for Routilux workflows
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8 mx-auto">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
            onClick={() => router.push("/flows")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Flows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{flowCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Available workflows</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
            onClick={() => router.push("/jobs")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Total Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobCount}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
            onClick={() => router.push("/jobs?status=running")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Play className="h-4 w-4" />
                Running Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{runningJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" size="sm">
                <Link href="/flows">
                  <Play className="h-4 w-4 mr-2" />
                  Start Job
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/flows">
                  <Activity className="h-4 w-4 mr-2" />
                  Create Flow
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Live health stats from the connected runtime.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadHealthStats} disabled={healthLoading}>
              {healthLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading health stats...
              </div>
            ) : healthError ? (
              <div className="text-sm text-destructive">{healthError}</div>
            ) : healthStats ? (
              <div className="space-y-3">
                {Object.keys(healthStats).length === 0 ? (
                  <div className="text-sm text-muted-foreground">No health stats available.</div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-3">
                    {Object.entries(healthStats)
                      .slice(0, 9)
                      .map(([key, value]) => (
                        <div key={key} className="rounded border bg-background p-3">
                          <div className="text-xs text-muted-foreground">{key}</div>
                          <div className="text-sm font-mono">{formatHealthValue(value)}</div>
                        </div>
                      ))}
                  </div>
                )}
                {healthUpdatedAt && (
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(healthUpdatedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No health stats loaded.</div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Discovery Status</CardTitle>
            <CardDescription>
              Last time items were synced from registry/runtime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded border bg-background p-3">
                <div className="text-xs text-muted-foreground">Flows</div>
                <div className="text-sm">
                  {lastFlowSync ? lastFlowSync.toLocaleString() : "Not synced"}
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-2 px-0">
                  <Link href="/flows">Open Flows</Link>
                </Button>
              </div>
              <div className="rounded border bg-background p-3">
                <div className="text-xs text-muted-foreground">Jobs</div>
                <div className="text-sm">
                  {lastJobSync ? lastJobSync.toLocaleString() : "Not synced"}
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-2 px-0">
                  <Link href="/jobs">Open Jobs</Link>
                </Button>
              </div>
              <div className="rounded border bg-background p-3">
                <div className="text-xs text-muted-foreground">Workers</div>
                <div className="text-sm">
                  {lastWorkerSync ? lastWorkerSync.toLocaleString() : "Not synced"}
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-2 px-0">
                  <Link href="/workers">Open Workers</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2 mx-auto">
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Jobs</CardTitle>
                <Link href="/jobs">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Latest workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <EmptyState
                  icon={Play}
                  title="No jobs yet"
                  description="Start a job from the Flows page to see it here."
                  action={{
                    label: "Go to Flows",
                    href: "/flows",
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <Link key={job.job_id} href={`/jobs/${job.job_id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium truncate">
                              {job.job_id}
                            </span>
                            <StatusBadge
                              status={job.status}
                              showSpinner={job.status === "running"}
                              className="text-xs"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {job.flow_id}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Navigate to different sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/flows" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-semibold">Flows</div>
                    <div className="text-xs text-muted-foreground">
                      View and manage workflow definitions
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/jobs" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <Zap className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <div className="font-semibold">Jobs</div>
                    <div className="text-xs text-muted-foreground">
                      Monitor and control executions
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/connect" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <div className="font-semibold">Settings</div>
                    <div className="text-xs text-muted-foreground">
                      Configure connection settings
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatHealthValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === "object") return `Object(${Object.keys(value).length})`;
  return String(value);
}
