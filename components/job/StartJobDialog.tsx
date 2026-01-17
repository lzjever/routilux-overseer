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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRuntimeStore } from "@/lib/stores/runtimeStore";
import { Loader2, Play } from "lucide-react";
import type { JobStartRequest } from "@/lib/api/generated";

interface StartJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  serverUrl: string;
  onSuccess: (jobId: string) => void;
}

export function StartJobDialog({
  open,
  onOpenChange,
  flowId,
  serverUrl,
  onSuccess,
}: StartJobDialogProps) {
  const { runtimes, defaultRuntimeId, loading, loadRuntimes } = useRuntimeStore();
  const [selectedRuntimeId, setSelectedRuntimeId] = useState<string>("");
  const [timeout, setTimeout] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load runtimes when dialog opens
  useEffect(() => {
    if (open && serverUrl) {
      loadRuntimes(serverUrl);
    }
  }, [open, serverUrl, loadRuntimes]);

  // Set default runtime when runtimes are loaded
  useEffect(() => {
    if (defaultRuntimeId && !selectedRuntimeId) {
      setSelectedRuntimeId(defaultRuntimeId);
    }
  }, [defaultRuntimeId, selectedRuntimeId]);

  const handleSubmit = async () => {
    if (!serverUrl) return;

    setSubmitting(true);
    setError(null);

    try {
      const { createAPI } = await import("@/lib/api");
      const api = createAPI(serverUrl);

      const request: JobStartRequest = {
        flow_id: flowId,
        runtime_id: selectedRuntimeId || null,
        timeout: timeout ? parseFloat(timeout) : null,
      };

      const job = await api.jobs.start(request);
      onSuccess(job.job_id);
      onOpenChange(false);
      // Reset form
      setSelectedRuntimeId(defaultRuntimeId || "");
      setTimeout("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start job");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRuntime = selectedRuntimeId ? runtimes.get(selectedRuntimeId) : null;
  const runtimeList = Array.from(runtimes.values());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Job</DialogTitle>
          <DialogDescription>
            Start a new job execution for flow: <span className="font-mono">{flowId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Flow ID (read-only) */}
          <div className="space-y-2">
            <Label>Flow</Label>
            <Input value={flowId} disabled className="font-mono" />
          </div>

          {/* Runtime Selection */}
          <div className="space-y-2">
            <Label>Runtime</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading runtimes...
              </div>
            ) : (
              <>
                <Select
                  value={selectedRuntimeId}
                  onValueChange={setSelectedRuntimeId}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select runtime..." />
                  </SelectTrigger>
                  <SelectContent>
                    {runtimeList.map((runtime) => (
                      <SelectItem key={runtime.runtime_id} value={runtime.runtime_id}>
                        <div className="flex items-center gap-2">
                          <span>{runtime.runtime_id}</span>
                          {runtime.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Runtime Info */}
                {selectedRuntime && (
                  <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
                    {selectedRuntime.is_default && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Default Runtime
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Jobs:</span>
                      <span className="font-medium">{selectedRuntime.active_job_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Thread Pool:</span>
                      <span className="font-medium">
                        {selectedRuntime.thread_pool_size === 0
                          ? "Shared (Global)"
                          : selectedRuntime.thread_pool_size}
                      </span>
                    </div>
                    {selectedRuntime.is_shutdown && (
                      <div className="text-destructive text-xs">Runtime is shut down</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Timeout (optional) */}
          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (seconds, optional)</Label>
            <Input
              id="timeout"
              type="number"
              min="1"
              max="86400"
              placeholder="3600"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Maximum execution time. Leave empty for no timeout (max: 86400 seconds / 24 hours).
            </p>
          </div>

          {/* Error Display */}
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
          <Button onClick={handleSubmit} disabled={submitting || loading || !selectedRuntimeId}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Job
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
