"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { createAPI } from "@/lib/api";
import type { JobResponse } from "@/lib/api/generated";

interface UnlockFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  serverUrl: string;
  onConfirm: () => void;
}

export function UnlockFlowDialog({
  open,
  onOpenChange,
  flowId,
  serverUrl,
  onConfirm,
}: UnlockFlowDialogProps) {
  const [loading, setLoading] = useState(false);
  const [runningJobs, setRunningJobs] = useState<JobResponse[]>([]);

  // Check for running jobs when dialog opens
  useEffect(() => {
    if (open && serverUrl) {
      setLoading(true);
      const checkRunningJobs = async () => {
        try {
          const api = createAPI(serverUrl);
          // Get jobs for this flow with status=running
          const response = await api.jobs.list(null, flowId, "running", 100);
          setRunningJobs(response.jobs || []);
        } catch (error) {
          console.error("Failed to check running jobs:", error);
          setRunningJobs([]);
        } finally {
          setLoading(false);
        }
      };
      checkRunningJobs();
    }
  }, [open, flowId, serverUrl]);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Unlock Flow for Editing
          </DialogTitle>
          <DialogDescription>
            Editing this flow will affect all running jobs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: Changes to this flow will immediately affect all running jobs.
              This may cause unexpected behavior or errors in active executions.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Checking running jobs...
              </span>
            </div>
          ) : runningJobs.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Running Jobs ({runningJobs.length}):
              </p>
              <div className="max-h-[200px] overflow-y-auto rounded-lg border bg-muted/50 p-3 space-y-2">
                {runningJobs.map((job) => (
                  <div
                    key={job.job_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-mono text-xs">{job.job_id}</span>
                    <span className="text-muted-foreground text-xs">
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No running jobs found for this flow.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Unlock & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
