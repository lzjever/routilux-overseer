"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createAPI } from "@/lib/api";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { BarChart } from "@/components/charts/BarChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FlowMetricsCardProps {
  flowId: string;
  serverUrl: string;
}

export function FlowMetricsCard({ flowId, serverUrl }: FlowMetricsCardProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!serverUrl) return;
      setLoading(true);
      try {
        const api = createAPI(serverUrl);
        const data = await api.flows.getFlowMetrics(flowId);
        console.log(`Flow metrics for ${flowId}:`, data);
        setMetrics(data);
      } catch (error) {
        console.error("Failed to load flow metrics:", error);
        // Set metrics to null to show "No metrics available" message
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [flowId, serverUrl]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Flow Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No metrics available</div>
        </CardContent>
      </Card>
    );
  }

  // Transform metrics data for charts
  const jobDurationData = metrics.job_durations && Array.isArray(metrics.job_durations) && metrics.job_durations.length > 0
    ? metrics.job_durations.map((d: any, i: number) => ({
        time: i,
        duration: typeof d === 'number' ? d : 0,
      }))
    : [];

  const statusDistribution = metrics.status_distribution && typeof metrics.status_distribution === 'object'
    ? Object.entries(metrics.status_distribution)
        .filter(([_, value]) => typeof value === 'number' && value > 0)
        .map(([name, value]) => ({
          name,
          value: value as number,
        }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Flow Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="duration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="duration">Duration</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="count">Count</TabsTrigger>
          </TabsList>
          <TabsContent value="duration" className="mt-4">
            <LineChart
              data={jobDurationData}
              dataKey="duration"
              xKey="time"
              lines={[{ key: "duration", name: "Duration (ms)", color: "#8884d8" }]}
              height={200}
            />
          </TabsContent>
          <TabsContent value="status" className="mt-4">
            <PieChart data={statusDistribution} height={200} />
          </TabsContent>
          <TabsContent value="count" className="mt-4">
            <BarChart
              data={jobDurationData}
              dataKey="duration"
              xKey="time"
              bars={[{ key: "duration", name: "Job Count", color: "#82ca9d" }]}
              height={200}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
