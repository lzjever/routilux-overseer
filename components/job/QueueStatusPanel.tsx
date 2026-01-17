"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { createAPI } from "@/lib/api";
import type { SlotQueueStatus } from "@/lib/api/generated";
import { AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueStatusPanelProps {
  jobId: string;
  serverUrl: string;
  embedded?: boolean;
}

export function QueueStatusPanel({
  jobId,
  serverUrl,
  embedded = false,
}: QueueStatusPanelProps) {
  const [queues, setQueues] = useState<Record<string, Array<SlotQueueStatus>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQueues = async () => {
      if (!serverUrl) return;
      setLoading(true);
      setError(null);
      try {
        const api = createAPI(serverUrl);
        const status = await api.monitor.getJobQueuesStatus(jobId);
        setQueues(status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load queue status");
      } finally {
        setLoading(false);
      }
    };

    loadQueues();
    const interval = setInterval(loadQueues, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, [jobId, serverUrl]);

  const getPressureLevel = (usage: number): "low" | "medium" | "high" | "critical" => {
    if (usage >= 90) return "critical";
    if (usage >= 70) return "high";
    if (usage >= 40) return "medium";
    return "low";
  };

  const getPressureColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getPressureIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", embedded && "text-sm")}>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-sm text-destructive", embedded && "text-xs")}>
        {error}
      </div>
    );
  }

  const routineIds = Object.keys(queues);

  if (routineIds.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", embedded && "text-xs")}>
        No queue data available
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", embedded && "space-y-3")}>
      <div className={cn("font-semibold", embedded && "text-sm")}>Queue Status</div>
      {routineIds.map((routineId) => {
        const slots = queues[routineId] || [];
        return (
          <Card key={routineId} className={embedded ? "text-sm" : ""}>
            <CardHeader className={cn("pb-2", embedded && "p-3")}>
              <CardTitle className={cn("text-base", embedded && "text-sm")}>
                {routineId}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn("space-y-3", embedded && "p-3 pt-0 space-y-2")}>
              {slots.map((slot, index) => {
                // usage_percentage is 0.0-1.0 from API; convert to 0-100 for display and pressure
                const usagePct = (slot.usage_percentage ?? 0) * 100;
                const level = getPressureLevel(usagePct);
                const pressureColor = getPressureColor(level);
                const PressureIcon = getPressureIcon(level);

                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium", embedded && "text-xs")}>
                        {slot.slot_name || `Slot ${index + 1}`}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("gap-1", pressureColor, embedded && "text-xs")}
                      >
                        {PressureIcon}
                        {level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {slot.unconsumed_count ?? 0} unconsumed / {slot.max_length} max
                        </span>
                        <span>{usagePct.toFixed(1)}%</span>
                      </div>
                      <Progress value={usagePct} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
