"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AddRoutineDialogProps {
  flowId: string;
  serverUrl: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddRoutineDialog({
  flowId,
  serverUrl,
  onSuccess,
  trigger,
}: AddRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [routineId, setRoutineId] = useState("");
  const [classPath, setClassPath] = useState("");
  const [config, setConfig] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineId || !classPath || !serverUrl) return;

    setLoading(true);
    setError(null);
    try {
      const api = createAPI(serverUrl);
      let configObj: Record<string, any> = {};
      if (config.trim()) {
        try {
          configObj = JSON.parse(config);
        } catch {
          setError("Invalid JSON in config field");
          setLoading(false);
          return;
        }
      }
      await api.flows.addRoutine(flowId, routineId, classPath, configObj);
      setOpen(false);
      setRoutineId("");
      setClassPath("");
      setConfig("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add routine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Add Routine</Button>}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Routine to Flow</DialogTitle>
            <DialogDescription>
              Add a new routine to this flow. The routine will be available for connections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="routineId">Routine ID *</Label>
              <Input
                id="routineId"
                value={routineId}
                onChange={(e) => setRoutineId(e.target.value)}
                placeholder="e.g., processor"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classPath">Class Path *</Label>
              <Input
                id="classPath"
                value={classPath}
                onChange={(e) => setClassPath(e.target.value)}
                placeholder="e.g., mymodule.MyRoutine"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config">Config (JSON, optional)</Label>
              <Textarea
                id="config"
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Routine
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
