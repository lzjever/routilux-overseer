import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ExecutionRecord } from "@/lib/types/api";

interface ExecutionHistoryTimelineProps {
  history: ExecutionRecord[];
  routineId?: string;
}

export function ExecutionHistoryTimeline({
  history,
  routineId
}: ExecutionHistoryTimelineProps) {
  return (
    <Card className="surface-panel flex flex-col h-full">
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
        {routineId && (
          <CardDescription>Routine: {routineId}</CardDescription>
        )}
        <p className="text-sm text-muted-foreground">
          {history.length} events
        </p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-0">
            {history.map((record, idx) => (
              <div key={idx} className="flex gap-3 p-3 border-b last:border-0 hover:bg-muted/30">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {idx < history.length - 1 && (
                    <div className="w-px h-full min-h-[3rem] bg-border" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {record.routine_id}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{record.event_name}</p>

                  {Object.keys(record.data).length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">
                        Show Data ({Object.keys(record.data).length} fields)
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-1 p-2 bg-muted rounded">
                          <pre className="text-xs overflow-auto max-h-24">
                            {JSON.stringify(record.data, null, 2)}
                          </pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
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
