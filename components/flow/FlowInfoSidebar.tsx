"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { createAPI } from "@/lib/api";
import { useFlowStore } from "@/lib/stores/flowStore";
import { UnlockFlowDialog } from "./UnlockFlowDialog";
import type { FlowResponse } from "@/lib/types/api";

interface FlowInfoSidebarProps {
  flow: FlowResponse;
  flowId: string;
  serverUrl?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FlowInfoSidebar({
  flow,
  flowId,
  serverUrl,
  collapsed = false,
  onToggleCollapse,
}: FlowInfoSidebarProps) {
  const { isFlowLocked, unlockFlow, lockFlow } = useFlowStore();
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  } | null>(null);
  const [metrics, setMetrics] = useState<Record<string, any> | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const locked = isFlowLocked(flowId);

  const handleUnlockClick = () => {
    setUnlockDialogOpen(true);
  };

  const handleUnlockConfirm = () => {
    unlockFlow(flowId);
  };

  const handleLock = () => {
    lockFlow(flowId);
  };

  const validate = async () => {
    if (!serverUrl) return;
    setValidating(true);
    try {
      const api = createAPI(serverUrl);
      await api.flows.validate(flowId);
      setValidationResult({
        valid: true,
        errors: [],
        warnings: [],
      });
    } catch (error: any) {
      setValidationResult({
        valid: false,
        errors: [error.message || "Validation failed"],
        warnings: [],
      });
    } finally {
      setValidating(false);
    }
  };

  const loadMetrics = async () => {
    if (!serverUrl) return;
    setLoadingMetrics(true);
    setMetricsError(null);
    try {
      const api = createAPI(serverUrl);
      const response = await api.flows.getMetrics(flowId);
      setMetrics(response || null);
    } catch (error) {
      setMetricsError(error instanceof Error ? error.message : "Failed to load metrics");
      setMetrics(null);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (flowId && serverUrl) {
      validate();
      loadMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId, serverUrl]);

  const formatMetricValue = (value: unknown) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "number") {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    if (typeof value === "string") return value;
    if (typeof value === "boolean") return value ? "true" : "false";
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (typeof value === "object") return `Object(${Object.keys(value).length})`;
    return String(value);
  };

  if (collapsed) {
    return (
      <div className="w-12 surface-panel rounded-none flex flex-col items-center py-2 gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleCollapse}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2 mt-4">
          <div className="h-8 w-8 flex items-center justify-center" title="Flow Information">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          </div>
          <div className="h-8 w-8 flex items-center justify-center" title="Validation Status">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 surface-panel rounded-none flex flex-col h-full">
      {/* Header */}
      <div className="h-10 border-b flex items-center justify-between px-3">
        <span className="text-sm font-semibold">Flow Information</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleCollapse}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Flow ID with Lock */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image
              src={locked ? "/icons/lock.svg" : "/icons/unlock.svg"}
              alt={locked ? "Locked" : "Unlocked"}
              width={16}
              height={16}
              className="h-4 w-4 text-muted-foreground"
            />
            <Label className="text-xs text-muted-foreground">Flow ID</Label>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono flex-1 truncate">{flow.flow_id}</p>
            {locked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlockClick}
                className="h-6 text-xs"
              >
                Unlock
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLock} className="h-6 text-xs">
                Lock
              </Button>
            )}
          </div>
          {!locked && (
            <Alert className="py-2">
              <AlertTriangle className="h-3 w-3" />
              <p className="text-xs">Flow is unlocked for editing</p>
            </Alert>
          )}
        </div>

        {/* Validation Status */}
        {serverUrl && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Validation</Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={validate}
                disabled={validating}
              >
                {validating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
            {validating ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Validating...
              </div>
            ) : validationResult ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {validationResult.valid ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs h-4">
                        Valid
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-red-600" />
                      <Badge variant="destructive" className="text-xs h-4">
                        Invalid
                      </Badge>
                    </>
                  )}
                </div>
                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.errors.map((error, i) => (
                      <div key={i} className="text-xs text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                        <span className="leading-tight">{error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Click to validate</div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs text-muted-foreground">Statistics</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-background rounded border">
              <p className="text-lg font-bold">{Object.keys(flow.routines).length}</p>
              <p className="text-xs text-muted-foreground">Routines</p>
            </div>
            <div className="text-center p-2 bg-background rounded border">
              <p className="text-lg font-bold">{flow.connections.length}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>
          <div className="text-center p-2 bg-background rounded border">
            <p className="text-lg font-bold">
              {flow.connections.filter((c) => c.source_routine !== c.target_routine).length}
            </p>
            <p className="text-xs text-muted-foreground">Cross-Connections</p>
          </div>
        </div>

        {/* Flow Metrics */}
        {serverUrl && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Metrics</Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={loadMetrics}
                disabled={loadingMetrics}
              >
                {loadingMetrics ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
            {metricsError ? (
              <div className="text-xs text-red-600">{metricsError}</div>
            ) : loadingMetrics ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading metrics...
              </div>
            ) : metrics ? (
              <div className="space-y-2">
                {Object.entries(metrics).length === 0 ? (
                  <div className="text-xs text-muted-foreground">No metrics yet</div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(metrics)
                      .slice(0, 6)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">{key}</span>
                          <span className="font-mono">{formatMetricValue(value)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No metrics loaded</div>
            )}
          </div>
        )}
      </div>

      {/* Unlock Dialog */}
      {serverUrl && (
        <UnlockFlowDialog
          open={unlockDialogOpen}
          onOpenChange={setUnlockDialogOpen}
          flowId={flowId}
          serverUrl={serverUrl}
          onConfirm={handleUnlockConfirm}
        />
      )}
    </div>
  );
}
