"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkersStore } from "@/lib/stores/workersStore";
import { Loader2, Send, FileText } from "lucide-react";
import type {
  JobSubmitRequest,
  routilux__server__models__flow__RoutineInfo,
} from "@/lib/api/generated";
import { createAPI } from "@/lib/api";
import { RoutineDocstring } from "@/components/routine/RoutineDocstring";

interface SubmitJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  workerId?: string | null;
  serverUrl: string;
  onSuccess: (jobId: string) => void;
}

export function SubmitJobDialog({
  open,
  onOpenChange,
  flowId,
  workerId: initialWorkerId,
  serverUrl,
  onSuccess,
}: SubmitJobDialogProps) {
  const { workers, loadWorkers } = useWorkersStore();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(initialWorkerId || "");
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("");
  const [selectedSlotName, setSelectedSlotName] = useState<string>("");
  const [jobData, setJobData] = useState<string>("{}");
  const [routines, setRoutines] = useState<routilux__server__models__flow__RoutineInfo[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [routineDocstring, setRoutineDocstring] = useState<string | null>(null);
  const [loadingDocstring, setLoadingDocstring] = useState(false);

  // Load workers when dialog opens
  useEffect(() => {
    if (open && serverUrl) {
      loadWorkers(serverUrl, flowId, null);
    }
  }, [open, serverUrl, flowId, loadWorkers]);

  // Load routines when flow changes
  const loadRoutines = useCallback(async () => {
    if (!serverUrl || !flowId) return;
    setLoadingRoutines(true);
    try {
      const api = createAPI(serverUrl);
      const response = await api.flows.getRoutines(flowId);
      // Convert Record<string, RoutineInfo> to array
      const routinesArray = Object.values(response);
      setRoutines(routinesArray);
    } catch (error) {
      console.error("Failed to load routines:", error);
    } finally {
      setLoadingRoutines(false);
    }
  }, [serverUrl, flowId]);

  useEffect(() => {
    if (open && serverUrl && flowId) {
      loadRoutines();
    }
  }, [open, serverUrl, flowId, loadRoutines]);

  // Update slots when routine changes
  useEffect(() => {
    if (selectedRoutineId && routines.length > 0) {
      const routine = routines.find((r) => r.routine_id === selectedRoutineId);
      if (routine) {
        setSlots(routine.slots || []);
        if (routine.slots && routine.slots.length > 0) {
          setSelectedSlotName(routine.slots[0]);
        }
      }
    }
  }, [selectedRoutineId, routines]);

  // Load docstring when routine is selected
  useEffect(() => {
    const loadDocstring = async () => {
      if (!selectedRoutineId || !serverUrl) {
        setRoutineDocstring(null);
        return;
      }

      // Find the selected routine to get its class_name
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
      } catch (error) {
        console.error("Failed to load routine docstring:", error);
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
      } catch (e) {
        throw new Error("Invalid JSON data");
      }

      const api = createAPI(serverUrl);
      const request: JobSubmitRequest = {
        flow_id: flowId,
        worker_id: selectedWorkerId && selectedWorkerId !== "__new__" ? selectedWorkerId : null,
        routine_id: selectedRoutineId,
        slot_name: selectedSlotName,
        data: parsedData,
      };

      const job = await api.jobs.submit(request);
      onSuccess(job.job_id);
      onOpenChange(false);
      // Reset form
      setSelectedWorkerId("");
      setSelectedRoutineId("");
      setSelectedSlotName("");
      setJobData("{}");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit job");
    } finally {
      setSubmitting(false);
    }
  };

  const workerList = Array.from(workers.values()).filter((w) => w.flow_id === flowId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Job</DialogTitle>
          <DialogDescription>
            Submit a new job to a worker for flow: <span className="font-mono">{flowId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Flow</Label>
            <Input value={flowId} disabled className="font-mono" />
          </div>

          <div className="space-y-2">
            <Label>Worker (optional)</Label>
            <Select
              value={selectedWorkerId}
              onValueChange={setSelectedWorkerId}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select worker or leave empty to create new" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__new__">Create new worker</SelectItem>
                {workerList.map((worker) => (
                  <SelectItem key={worker.worker_id} value={worker.worker_id}>
                    {worker.worker_id} ({worker.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave empty to automatically create a new worker
            </p>
          </div>

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
            <Label htmlFor="jobData">Data (JSON)</Label>
            <textarea
              id="jobData"
              className="w-full min-h-[120px] p-2 border rounded-md font-mono text-sm"
              value={jobData}
              onChange={(e) => setJobData(e.target.value)}
              disabled={submitting}
              placeholder='{"key": "value"}'
            />
            <p className="text-xs text-muted-foreground">JSON object to send to the slot</p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
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
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Job
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
