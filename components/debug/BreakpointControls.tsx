"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  Power,
  PowerOff,
  Bug,
  Circle,
  CircleDot,
} from "lucide-react";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { BreakpointCreateRequest } from "@/lib/api/generated";

interface BreakpointControlsProps {
  jobId: string;
  serverUrl: string;
  availableRoutines: string[];
  embedded?: boolean;
}

export function BreakpointControls({
  jobId,
  serverUrl,
  availableRoutines,
  embedded = false,
}: BreakpointControlsProps) {
  const { breakpoints, loading, addBreakpoint, removeBreakpoint, toggleBreakpoint } =
    useBreakpointStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBpType, setNewBpType] = useState<"routine" | "slot" | "event" | "connection">("routine");
  const [newBpRoutine, setNewBpRoutine] = useState("");
  const [newBpTarget, setNewBpTarget] = useState("");
  const [condition, setCondition] = useState("");

  const currentBreakpoints = breakpoints.get(jobId) || [];

  const handleAddBreakpoint = async () => {
    try {
      const request: BreakpointCreateRequest = {
        type:
          newBpType === "routine"
            ? BreakpointCreateRequest.type.ROUTINE
            : newBpType === "slot"
            ? BreakpointCreateRequest.type.SLOT
            : newBpType === "event"
            ? BreakpointCreateRequest.type.EVENT
            : BreakpointCreateRequest.type.CONNECTION,
        routine_id: newBpRoutine,
        ...(newBpType === "slot" ? { slot_name: newBpTarget } : {}),
        ...(newBpType === "event" ? { event_name: newBpTarget } : {}),
        ...(condition ? { condition } : {}),
      };

      await addBreakpoint(jobId, request, serverUrl);
      setShowAddForm(false);
      setNewBpRoutine("");
      setNewBpTarget("");
      setCondition("");
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
      await toggleBreakpoint(jobId, breakpointId, serverUrl);
    } catch (error) {
      console.error("Failed to toggle breakpoint:", error);
    }
  };

  const getBreakpointIcon = (type: string) => {
    switch (type) {
      case "routine":
        return <Bug className="h-4 w-4" />;
      case "slot":
        return <Circle className="h-4 w-4" />;
      case "event":
        return <CircleDot className="h-4 w-4" />;
      case "connection":
        return <CircleDot className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
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
            value={newBpType}
            onChange={(e) =>
              setNewBpType(e.target.value as "routine" | "slot" | "event" | "connection")
            }
            className="w-full px-2 py-1.5 text-sm rounded border bg-background"
          >
            <option value="routine">Routine</option>
            <option value="slot">Slot</option>
            <option value="event">Event</option>
            <option value="connection">Connection</option>
          </select>

          <select
            value={newBpRoutine}
            onChange={(e) => setNewBpRoutine(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded border bg-background"
            disabled={newBpType === "routine"}
          >
            <option value="">Select routine...</option>
            {availableRoutines.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {(newBpType === "slot" || newBpType === "event") && (
            <input
              type="text"
              value={newBpTarget}
              onChange={(e) => setNewBpTarget(e.target.value)}
              placeholder={`${newBpType} name`}
              className="w-full px-2 py-1.5 text-sm rounded border bg-background"
            />
          )}

          {/* Condition input */}
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="Condition (e.g., counter > 5)"
            className="w-full px-2 py-1.5 text-sm rounded border bg-background"
          />
          <p className="text-[10px] text-muted-foreground">
            Optional: breakpoint will only hit when condition is true
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddBreakpoint}
              disabled={loading || !newBpRoutine || (newBpType !== "routine" && !newBpTarget)}
              className="h-7"
            >
              Add Breakpoint
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddForm(false)}
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
                {getBreakpointIcon(bp.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium truncate">
                      {bp.routine_id || "(connection)"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {bp.type}
                    </Badge>
                  </div>

                  {(bp.slot_name || bp.event_name) && (
                    <div className="text-xs text-muted-foreground">
                      {bp.slot_name && `slot: ${bp.slot_name}`}
                      {bp.event_name && `event: ${bp.event_name}`}
                    </div>
                  )}

                  {bp.condition && (
                    <div className="text-xs text-purple-600 font-mono">
                      when: {bp.condition}
                    </div>
                  )}

                  {bp.hit_count > 0 && (
                    <div className="text-xs text-muted-foreground">
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
