"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createAPI } from "@/lib/api";
import type {
  ExecuteResponse,
  routilux__server__models__flow__RoutineInfo,
} from "@/lib/api/generated";
import { Loader2, Zap, FileText } from "lucide-react";
import { toast } from "sonner";
import { RoutineDocstring } from "@/components/routine/RoutineDocstring";

interface RunOnceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  serverUrl: string;
  onSuccess?: (response: ExecuteResponse) => void;
}

export function RunOnceDialog({
  open,
  onOpenChange,
  flowId,
  serverUrl,
  onSuccess,
}: RunOnceDialogProps) {
  const router = useRouter();
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("");
  const [selectedSlotName, setSelectedSlotName] = useState<string>("");
  const [routines, setRoutines] = useState<routilux__server__models__flow__RoutineInfo[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [jobData, setJobData] = useState<string>("{}");
  const [waitMode, setWaitMode] = useState<"async" | "wait">("async");
  const [timeoutSeconds, setTimeoutSeconds] = useState<string>("60");
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routineDocstring, setRoutineDocstring] = useState<string | null>(null);
  const [loadingDocstring, setLoadingDocstring] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedRoutineId("");
      setSelectedSlotName("");
      setRoutines([]);
      setSlots([]);
      setJobData("{}");
      setWaitMode("async");
      setTimeoutSeconds("60");
      setSubmitting(false);
      setError(null);
      return;
    }
    if (open && serverUrl) {
      const loadRoutines = async () => {
        setLoadingRoutines(true);
        try {
          const api = createAPI(serverUrl);
          const response = await api.flows.getRoutines(flowId);
          const routinesArray = Object.values(response);
          setRoutines(routinesArray);
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load routines");
        } finally {
          setLoadingRoutines(false);
        }
      };
      loadRoutines();
    }
  }, [open, serverUrl, flowId]);

  useEffect(() => {
    if (!selectedRoutineId || routines.length === 0) {
      setSlots([]);
      setSelectedSlotName("");
      return;
    }
    const routine = routines.find((r) => r.routine_id === selectedRoutineId);
    if (routine) {
      const routineSlots = routine.slots || [];
      setSlots(routineSlots);
      setSelectedSlotName(routineSlots[0] || "");
    }
  }, [selectedRoutineId, routines]);

  // Load docstring when routine is selected
  useEffect(() => {
    const loadDocstring = async () => {
      if (!selectedRoutineId || !serverUrl) {
        setRoutineDocstring(null);
        return;
      }

      const selectedRoutine = routines.find((r) => r.routine_id === selectedRoutineId);
      if (!selectedRoutine?.class_name) {
        setRoutineDocstring(null);
        return;
      }

      setLoadingDocstring(true);
      try {
        const api = createAPI(serverUrl);
        const metadata = await api.factory.getObjectMetadata(selectedRoutine.class_name);
        setRoutineDocstring(metadata.docstring || null);
      } catch (loadDocstringError) {
        console.error("Failed to load routine docstring:", loadDocstringError);
        setRoutineDocstring(null);
      } finally {
        setLoadingDocstring(false);
      }
    };

    loadDocstring();
  }, [selectedRoutineId, serverUrl, routines]);

  const handleSubmit = async () => {
    if (!serverUrl || !selectedRoutineId || !selectedSlotName) return;
    setSubmitting(true);
    setError(null);
    try {
      let parsedData: Record<string, any> = {};
      try {
        parsedData = JSON.parse(jobData);
      } catch {
        throw new Error("Invalid JSON data");
      }

      const wait = waitMode === "wait";
      const timeout = Number.parseFloat(timeoutSeconds);
      if (wait && (!Number.isFinite(timeout) || timeout <= 0)) {
        throw new Error("Timeout must be a positive number");
      }

      const api = createAPI(serverUrl);
      const response = await api.execute.flow({
        flow_id: flowId,
        routine_id: selectedRoutineId,
        slot_name: selectedSlotName,
        data: parsedData,
        wait,
        timeout: wait ? timeout : undefined,
      });

      if (response.status === "completed") {
        toast.success("Execution completed", {
          description: `Job ${response.job_id} finished successfully.`,
        });
      } else if (response.status === "timeout") {
        toast.warning("Execution timed out", {
          description: `Job ${response.job_id} timed out. Check job details.`,
        });
      } else if (response.status === "failed") {
        toast.error("Execution failed", {
          description: response.error || "Unknown error",
        });
      } else {
        toast.success("Execution started", {
          description: `Job ${response.job_id} is running.`,
        });
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(response);
      } else {
        router.push(`/jobs/${response.job_id}`);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to execute flow");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Run Once</DialogTitle>
          <DialogDescription>
            Execute flow <span className="font-mono">{flowId}</span> without creating a persistent
            worker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Routine</Label>
            {loadingRoutines ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading routines...
              </div>
            ) : (
              <Select
                value={selectedRoutineId}
                onValueChange={setSelectedRoutineId}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select routine..." />
                </SelectTrigger>
                <SelectContent>
                  {routines.map((routine) => (
                    <SelectItem key={routine.routine_id} value={routine.routine_id}>
                      {routine.routine_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Routine Documentation */}
          {selectedRoutineId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Routine Documentation
              </Label>
              <RoutineDocstring
                docstring={routineDocstring}
                loading={loadingDocstring}
                maxHeight="150px"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Slot</Label>
            <Select
              value={selectedSlotName}
              onValueChange={setSelectedSlotName}
              disabled={submitting || !selectedRoutineId || slots.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select slot..." />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Execution Mode</Label>
            <RadioGroup
              value={waitMode}
              onValueChange={(value) => setWaitMode(value as "async" | "wait")}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="async" id="run-once-async" />
                <Label htmlFor="run-once-async">Async (return immediately)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="wait" id="run-once-wait" />
                <Label htmlFor="run-once-wait">Wait for result</Label>
              </div>
            </RadioGroup>
          </div>

          {waitMode === "wait" && (
            <div className="space-y-2">
              <Label>Timeout (seconds)</Label>
              <Input
                type="number"
                min="1"
                value={timeoutSeconds}
                onChange={(event) => setTimeoutSeconds(event.target.value)}
                disabled={submitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Input Data (JSON)</Label>
            <Textarea
              value={jobData}
              onChange={(event) => setJobData(event.target.value)}
              className="font-mono text-xs min-h-[120px]"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedRoutineId || !selectedSlotName}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Run Once
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
