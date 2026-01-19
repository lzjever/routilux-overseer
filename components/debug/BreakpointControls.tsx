"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  Power,
  PowerOff,
  Bug,
} from "lucide-react";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { BreakpointCreateRequest } from "@/lib/api/generated";
import { useFlowStore } from "@/lib/stores/flowStore";

interface BreakpointControlsProps {
  jobId: string;
  workerId: string;
  serverUrl: string;
  availableRoutines: string[];
  embedded?: boolean;
}

export function BreakpointControls({
  jobId,
  workerId,
  serverUrl,
  availableRoutines,
  embedded = false,
}: BreakpointControlsProps) {
  const { breakpoints, loading, addBreakpoint, removeBreakpoint, toggleBreakpoint } =
    useBreakpointStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBpRoutine, setNewBpRoutine] = useState("");
  const [newBpSlot, setNewBpSlot] = useState("");
  const routineSlots = useFlowStore((state) => {
    const node = state.nodes.find((item) => item.id === newBpRoutine);
    return (node?.data as { slots?: { name: string }[] } | undefined)?.slots ?? [];
  });

  const currentBreakpoints = breakpoints.get(jobId) || [];

  const handleAddBreakpoint = async () => {
    if (!newBpRoutine || !newBpSlot) return;

    try {
      const request: BreakpointCreateRequest = {
        routine_id: newBpRoutine,
        slot_name: newBpSlot,
        enabled: true,
      };

      await addBreakpoint(jobId, request, serverUrl);
      setShowAddForm(false);
      setNewBpRoutine("");
      setNewBpSlot("");
    } catch (error) {
      console.error("Failed to add breakpoint:", error);
      alert("Failed to add breakpoint");
    }
  };

  const handleRemoveBreakpoint = async (breakpointId: string) => {
    try {
      await removeBreakpoint(jobId, breakpointId, serverUrl);
    } catch (error) {
      console.error("Failed to remove breakpoint:", error);
    }
  };

  const handleToggleBreakpoint = async (breakpointId: string) => {
    try {
      await toggleBreakpoint(jobId, breakpointId, workerId, serverUrl);
    } catch (error) {
      console.error("Failed to toggle breakpoint:", error);
    }
  };


  const content = (
    <>
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Breakpoints</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-7"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Add Breakpoint Form */}
      {showAddForm && (
        <div className="mb-3 p-3 bg-muted rounded-lg space-y-2">
          <select
            value={newBpRoutine}
            onChange={(e) => setNewBpRoutine(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded border bg-background"
          >
            <option value="">Select routine...</option>
            {availableRoutines.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {routineSlots.length > 0 ? (
            <select
              value={newBpSlot}
              onChange={(e) => setNewBpSlot(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded border bg-background"
            >
              <option value="">Select slot...</option>
              {routineSlots.map((slot) => (
                <option key={slot.name} value={slot.name}>
                  {slot.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={newBpSlot}
              onChange={(e) => setNewBpSlot(e.target.value)}
              placeholder="Slot name (e.g. input)"
              className="w-full px-2 py-1.5 text-sm rounded border bg-background"
            />
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddBreakpoint}
              disabled={loading || !newBpRoutine || !newBpSlot}
              className="h-7"
            >
              Add Breakpoint
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setNewBpRoutine("");
                setNewBpSlot("");
              }}
              className="h-7"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Breakpoints List */}
      {currentBreakpoints.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No breakpoints set
        </p>
      ) : (
        <ScrollArea className={embedded ? "h-[200px]" : "h-[300px]"}>
          <div className="space-y-2">
            {currentBreakpoints.map((bp) => (
              <div
                key={bp.breakpoint_id}
                className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                  bp.enabled ? "bg-background" : "bg-muted/50 opacity-60"
                }`}
              >
                <Bug className="h-4 w-4" />

                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium truncate">
                    {bp.routine_id}.{bp.slot_name}
                  </span>
                </div>

                  {bp.hit_count > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Hits: {bp.hit_count}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleBreakpoint(bp.breakpoint_id)}
                    title={bp.enabled ? "Disable" : "Enable"}
                    className="h-6 w-6 p-0"
                  >
                    {bp.enabled ? (
                      <Power className="h-3 w-3" />
                    ) : (
                      <PowerOff className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBreakpoint(bp.breakpoint_id)}
                    title="Remove"
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakpoints</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
