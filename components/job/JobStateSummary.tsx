import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from "lucide-react";
import type { JobStateResponse } from "@/lib/types/api";

interface JobStateSummaryProps {
  jobState: JobStateResponse;
}

export function JobStateSummary({ jobState }: JobStateSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job State Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Routine */}
        {jobState.current_routine_id && (
          <div>
            <Label>Current Routine</Label>
            <Badge>{jobState.current_routine_id}</Badge>
          </div>
        )}

        {/* Status */}
        <div>
          <Label>Status</Label>
          <Badge variant={getStatusVariant(jobState.status)}>{jobState.status}</Badge>
        </div>

        {/* Pause Points */}
        {jobState.pause_points.length > 0 && (
          <div>
            <Label>Pause History ({jobState.pause_points.length})</Label>
            <ScrollArea className="h-32 border rounded p-2">
              <div className="space-y-2">
                {jobState.pause_points.map((pp, i) => (
                  <div key={i} className="text-sm p-2 border-b last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{new Date(pp.timestamp).toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {pp.reason}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{pp.current_routine_id}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Deferred Events */}
        {jobState.deferred_events.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{jobState.deferred_events.length} Deferred Events</AlertTitle>
            <AlertDescription>Events pending emission on resume</AlertDescription>
          </Alert>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <Label className="text-xs text-muted-foreground">Created</Label>
            <p className="text-sm">{new Date(jobState.created_at).toLocaleString()}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Last Updated</Label>
            <p className="text-sm">{new Date(jobState.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "running":
      return "default";
    case "completed":
      return "secondary";
    case "failed":
      return "destructive";
    case "paused":
      return "outline";
    default:
      return "secondary";
  }
}
