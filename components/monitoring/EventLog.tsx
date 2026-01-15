"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ExecutionRecord } from "@/lib/types/api";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface EventLogProps {
  events: ExecutionRecord[];
  loading?: boolean;
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "routine_start":
      return <Activity className="h-4 w-4 text-blue-500" />;
    case "routine_end":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "slot_call":
      return <ArrowLeft className="h-4 w-4 text-yellow-500" />;
    case "event_emit":
      return <ArrowRight className="h-4 w-4 text-purple-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
}

function getEventBadgeVariant(eventType: string): "default" | "secondary" | "destructive" | "outline" {
  switch (eventType) {
    case "routine_start":
      return "default";
    case "routine_end":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
  }
}

export function EventLog({ events, loading }: EventLogProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No events yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {events.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mt-0.5">
                  {getEventIcon(event.event_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold">
                      {event.routine_id}
                    </span>
                    <Badge variant={getEventBadgeVariant(event.event_name)} className="text-xs">
                      {event.event_name}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
                  </div>

                  {Object.keys(event.data).length > 0 && (
                    <div className="mt-2 text-xs bg-muted p-2 rounded">
                      <div className="font-mono">
                        {JSON.stringify(event.data, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
