"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AddConnectionDialogProps {
  flowId: string;
  serverUrl: string;
  routines: Record<string, any>;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddConnectionDialog({
  flowId,
  serverUrl,
  routines,
  onSuccess,
  trigger,
}: AddConnectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [sourceRoutine, setSourceRoutine] = useState("");
  const [sourceEvent, setSourceEvent] = useState("");
  const [targetRoutine, setTargetRoutine] = useState("");
  const [targetSlot, setTargetSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceRoutineInfo = sourceRoutine ? routines[sourceRoutine] : null;
  const targetRoutineInfo = targetRoutine ? routines[targetRoutine] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceRoutine || !sourceEvent || !targetRoutine || !targetSlot || !serverUrl) return;

    setLoading(true);
    setError(null);
    try {
      const api = createAPI(serverUrl);
      await api.flows.addConnection(flowId, {
        source_routine: sourceRoutine,
        source_event: sourceEvent,
        target_routine: targetRoutine,
        target_slot: targetSlot,
      });
      setOpen(false);
      setSourceRoutine("");
      setSourceEvent("");
      setTargetRoutine("");
      setTargetSlot("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button size="sm">Add Connection</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Connection to Flow</DialogTitle>
            <DialogDescription>
              Connect a source routine&apos;s event to a target routine&apos;s slot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceRoutine">Source Routine *</Label>
                <Select value={sourceRoutine} onValueChange={setSourceRoutine}>
                  <SelectTrigger id="sourceRoutine">
                    <SelectValue placeholder="Select source routine" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(routines).map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceEvent">Source Event *</Label>
                <Select value={sourceEvent} onValueChange={setSourceEvent}>
                  <SelectTrigger id="sourceEvent">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceRoutineInfo?.events?.map((event: string) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetRoutine">Target Routine *</Label>
                <Select value={targetRoutine} onValueChange={setTargetRoutine}>
                  <SelectTrigger id="targetRoutine">
                    <SelectValue placeholder="Select target routine" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(routines).map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetSlot">Target Slot *</Label>
                <Select value={targetSlot} onValueChange={setTargetSlot}>
                  <SelectTrigger id="targetSlot">
                    <SelectValue placeholder="Select slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetRoutineInfo?.slots?.map((slot: string) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Connection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
