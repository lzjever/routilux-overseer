"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import type { FlowResponse } from "@/lib/types/api";

interface RoutineDetailsProps {
  routines: Record<string, { routine_id: string; class_name: string; slots: string[]; events: string[]; config: Record<string, any> }>;
  flowId?: string;
  serverUrl?: string;
  onRoutineRemoved?: () => void;
}

export function RoutineDetails({
  routines,
  flowId,
  serverUrl,
  onRoutineRemoved,
}: RoutineDetailsProps) {
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (routineId: string) => {
    if (!flowId || !serverUrl) return;
    if (!confirm(`Are you sure you want to remove routine "${routineId}"?`)) return;

    setRemoving(routineId);
    try {
      const { createAPI } = await import("@/lib/api");
      const api = createAPI(serverUrl);
      await api.flows.removeRoutine(flowId, routineId);
      if (selectedRoutine === routineId) {
        setSelectedRoutine(null);
      }
      onRoutineRemoved?.();
    } catch (error) {
      alert(
        `Failed to remove routine: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routine Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Routine List */}
          <ScrollArea className="h-96 border rounded">
            <div className="p-2 space-y-1">
              {Object.entries(routines).map(([id]) => (
                <div key={id} className="flex items-center gap-1">
                  <Button
                    variant={selectedRoutine === id ? "default" : "ghost"}
                    className="flex-1 justify-start font-mono text-sm"
                    onClick={() => setSelectedRoutine(id)}
                  >
                    {id}
                  </Button>
                  {flowId && serverUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(id)}
                      disabled={removing === id}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Selected Routine Info */}
          {selectedRoutine && routines[selectedRoutine] && (
            <ScrollArea className="h-96 border rounded p-4">
              <div className="space-y-4">
                <div>
                  <Label>Class Name</Label>
                  <p className="text-sm font-mono">{routines[selectedRoutine].class_name}</p>
                </div>

                <div>
                  <Label>Slots (Inputs)</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {routines[selectedRoutine].slots.map(slot => (
                      <Badge key={slot} variant="outline" className="text-xs">{slot}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Events (Outputs)</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {routines[selectedRoutine].events.map(event => (
                      <Badge key={event} variant="secondary" className="text-xs">{event}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Configuration</Label>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(routines[selectedRoutine].config, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
