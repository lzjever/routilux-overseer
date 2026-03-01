"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, FileText } from "lucide-react";
import type { FlowResponse } from "@/lib/types/api";
import { RoutineDocstring } from "@/components/routine/RoutineDocstring";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface RoutineDetailsProps {
  routines: Record<
    string,
    {
      routine_id: string;
      class_name: string;
      slots: string[];
      events: string[];
      config: Record<string, any>;
    }
  >;
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
  const confirm = useConfirm();
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [routineDocstring, setRoutineDocstring] = useState<string | null>(null);
  const [loadingDocstring, setLoadingDocstring] = useState(false);

  // Load docstring when selected routine changes
  useEffect(() => {
    const loadDocstring = async () => {
      if (!selectedRoutine || !serverUrl || !routines[selectedRoutine]) {
        setRoutineDocstring(null);
        return;
      }

      const routine = routines[selectedRoutine];
      if (!routine.class_name) {
        setRoutineDocstring(null);
        return;
      }

      setLoadingDocstring(true);
      try {
        const { createAPI } = await import("@/lib/api");
        const api = createAPI(serverUrl);
        const metadata = await api.factory.getObjectMetadata(routine.class_name);
        setRoutineDocstring(metadata.docstring || null);
      } catch (error) {
        console.error("Failed to load routine docstring:", error);
        setRoutineDocstring(null);
      } finally {
        setLoadingDocstring(false);
      }
    };

    loadDocstring();
  }, [selectedRoutine, serverUrl, routines]);

  const handleRemove = async (routineId: string) => {
    if (!flowId || !serverUrl) return;
    const ok = await confirm.openConfirm({
      title: `Remove routine "${routineId}"?`,
      description: "This action cannot be undone.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
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
      toast.error(
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

                {/* Documentation */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentation
                  </Label>
                  <RoutineDocstring
                    docstring={routineDocstring}
                    loading={loadingDocstring}
                    maxHeight="300px"
                  />
                </div>

                <div>
                  <Label>Slots (Inputs)</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {routines[selectedRoutine].slots.map((slot) => (
                      <Badge key={slot} variant="outline" className="text-xs">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Events (Outputs)</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {routines[selectedRoutine].events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
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
