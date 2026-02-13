"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FlowMetricsCardProps {
  flowId: string;
  serverUrl: string;
}

/**
 * FlowMetricsCard - Flow-level metrics are no longer available in the API.
 * This component is kept for compatibility but shows a message that the feature is not available.
 *
 * Note: Flow metrics API endpoint has been removed. Use Job metrics instead for monitoring.
 */
export function FlowMetricsCard({ flowId, serverUrl }: FlowMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Flow Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Flow-level metrics are no longer available. Use Job metrics for monitoring individual job
          executions.
        </div>
      </CardContent>
    </Card>
  );
}
