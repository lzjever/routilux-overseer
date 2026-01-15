"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  StepForward,
  GitBranch,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { createAPI } from "@/lib/api";

interface StepExecutionControlsProps {
  jobId: string;
  serverUrl: string;
  status: string;
  onStep?: () => void;
}

export function StepExecutionControls({
  jobId,
  serverUrl,
  status,
  onStep,
}: StepExecutionControlsProps) {
  const [loading, setLoading] = useState(false);

  const isPaused = status === "paused";
  const isRunning = status === "running";

  const handleResume = async () => {
    setLoading(true);
    try {
      const api = createAPI(serverUrl);
      await api.debug.resume(jobId);
    } catch (error) {
      console.error("Failed to resume:", error);
      alert("Failed to resume execution");
    } finally {
      setLoading(false);
    }
  };

  const handleStepOver = async () => {
    setLoading(true);
    try {
      const api = createAPI(serverUrl);
      await api.debug.stepOver(jobId);
      onStep?.();
    } catch (error) {
      console.error("Failed to step over:", error);
      alert("Failed to step over");
    } finally {
      setLoading(false);
    }
  };

  const handleStepInto = async () => {
    setLoading(true);
    try {
      const api = createAPI(serverUrl);
      await api.debug.stepInto(jobId);
      onStep?.();
    } catch (error) {
      console.error("Failed to step into:", error);
      alert("Failed to step into");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Execution Controls</CardTitle>
          <Badge variant={isRunning ? "default" : isPaused ? "secondary" : "outline"}>
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Resume */}
          <Button
            className="w-full"
            variant="default"
            onClick={handleResume}
            disabled={!isPaused || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Resume
          </Button>

          {/* Step Controls */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleStepOver}
              disabled={!isPaused || loading}
            >
              <StepForward className="h-4 w-4 mr-2" />
              Step Over
            </Button>

            <Button
              variant="outline"
              onClick={handleStepInto}
              disabled={!isPaused || loading}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Step Into
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>
              <strong>Step Over:</strong> Execute current routine and pause at next
            </p>
            <p>
              <strong>Step Into:</strong> Enter nested routine calls
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
