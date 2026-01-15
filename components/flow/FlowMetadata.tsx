import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { FlowResponse } from "@/lib/types/api";

interface FlowMetadataProps {
  flow: FlowResponse;
}

export function FlowMetadata({ flow }: FlowMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flow Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Flow ID</Label>
            <p className="text-sm font-mono">{flow.flow_id}</p>
          </div>
          <div>
            <Label>Execution Strategy</Label>
            <Badge>{flow.execution_strategy}</Badge>
          </div>
          <div>
            <Label>Max Workers</Label>
            <p className="text-sm">{flow.max_workers}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{Object.keys(flow.routines).length}</p>
            <p className="text-xs text-muted-foreground">Routines</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{flow.connections.length}</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {flow.connections.filter(c => c.source_routine !== c.target_routine).length}
            </p>
            <p className="text-xs text-muted-foreground">Cross-Connections</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
