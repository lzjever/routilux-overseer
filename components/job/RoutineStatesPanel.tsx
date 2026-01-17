import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import type { JobStateResponse } from "@/lib/types/api";

interface RoutineStatesPanelProps {
  jobState: JobStateResponse;
}

export function RoutineStatesPanel({ jobState }: RoutineStatesPanelProps) {
  const routineStates = Object.entries(jobState.routine_states ?? {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routine States</CardTitle>
        <p className="text-sm text-muted-foreground">
          {routineStates.length} routines in flow
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {routineStates.map(([routineId, state]) => (
            <div key={routineId} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(state.status)}>
                    {state.status}
                  </Badge>
                  <span className="font-mono text-sm font-medium">{routineId}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Count: {state.execution_count}
                </div>
              </div>

              {state.last_execution && (
                <p className="text-xs text-muted-foreground">
                  Last: {new Date(state.last_execution).toLocaleString()}
                </p>
              )}

              {state.error && (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{state.error}</AlertDescription>
                </Alert>
              )}

              {state.result != null ? (
                <Collapsible className="mt-2">
                  <CollapsibleTrigger className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-3 w-3" />
                    View Result
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                      {JSON.stringify(state.result, null, 2)}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string | undefined): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "outline";
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
      return "outline";
  }
}
