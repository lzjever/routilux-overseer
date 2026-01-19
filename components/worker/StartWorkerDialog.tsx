"use client";

import { useState } from "react";
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
import { useWorkersStore } from "@/lib/stores/workersStore";
import { Loader2, Play } from "lucide-react";
import type { WorkerCreateRequest } from "@/lib/api/generated";

interface StartWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  serverUrl: string;
  onSuccess: (workerId: string) => void;
}

export function StartWorkerDialog({
  open,
  onOpenChange,
  flowId,
  serverUrl,
  onSuccess,
}: StartWorkerDialogProps) {
  const { createWorker } = useWorkersStore();
  const [workerId, setWorkerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!serverUrl) return;

    setSubmitting(true);
    setError(null);

    try {
      const request: WorkerCreateRequest = {
        flow_id: flowId,
        worker_id: workerId || null,
      };

      const worker = await createWorker(request, serverUrl);
      onSuccess(worker.worker_id);
      onOpenChange(false);
      setWorkerId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create worker");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Worker</DialogTitle>
          <DialogDescription>
            Create a new worker for flow: <span className="font-mono">{flowId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Flow</Label>
            <Input value={flowId} disabled className="font-mono" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workerId">Worker ID (optional)</Label>
            <Input
              id="workerId"
              type="text"
              placeholder="Auto-generated if empty"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate a worker ID
            </p>
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
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Create Worker
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
