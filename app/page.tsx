"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useJobStore } from "@/lib/stores/jobStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Activity, Zap, ArrowRight, Play, TrendingUp, Clock, Plug, Settings } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { connected, serverUrl } = useConnectionStore();
  const { flows } = useFlowStore();
  const { jobs } = useJobStore();
  const [loading, setLoading] = useState(true);

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

  // Show connection prompt if not connected
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
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Routilux Overseer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive observability, debugging, and control for Routilux workflows
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{flowCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Available workflows</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobCount}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
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
            <CardContent>
              <Button asChild className="w-full" size="sm">
                <Link href="/flows">
                  <Play className="h-4 w-4 mr-2" />
                  Start Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
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
                <p className="text-sm text-muted-foreground text-center py-8">
                  No jobs yet. Start a job from the Flows page.
                </p>
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
                            <Badge
                              variant={
                                job.status === "running"
                                  ? "default"
                                  : job.status === "completed"
                                  ? "secondary"
                                  : job.status === "failed"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {job.status}
                            </Badge>
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

        {/* Get Started */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">Ready to debug?</h3>
              <p className="text-muted-foreground mb-4">
                Start monitoring your Routilux workflows in real-time with powerful debugging
                tools.
              </p>
              <Button asChild size="lg">
                <Link href="/flows">
                  <Play className="h-5 w-5 mr-2" />
                  Get Started
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
