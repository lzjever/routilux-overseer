"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { createAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { FlowResponse } from "@/lib/types/api";

interface FlowMetadataProps {
  flow: FlowResponse;
  flowId: string;
  serverUrl?: string;
}

export function FlowMetadata({ flow, flowId, serverUrl }: FlowMetadataProps) {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  } | null>(null);
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const validate = async () => {
    if (!serverUrl) return;
    setValidating(true);
    try {
      const api = createAPI(serverUrl);
      const result = await api.flows.validate(flowId);
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

  const loadJobCount = async () => {
    if (!serverUrl) return;
    setLoadingJobs(true);
    try {
      const api = createAPI(serverUrl);
      const response = await api.jobs.list(null, flowId, null, 100);
      setJobCount(response.total || 0);
    } catch (error) {
      console.error("Failed to load job count:", error);
      setJobCount(0);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (flowId && serverUrl) {
      validate();
      loadJobCount();
    }
  }, [flowId, serverUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flow Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Flow ID</Label>
            <p className="text-sm font-mono">{flow.flow_id}</p>
          </div>
        </div>

        {/* Validation Status */}
        {serverUrl && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <Label>Validation Status</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={validate}
                disabled={validating}
                className="h-7"
              >
                {validating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
            {validating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </div>
            ) : validationResult ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        Valid
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <Badge variant="destructive">Invalid</Badge>
                    </>
                  )}
                </div>
                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.errors.map((error, i) => (
                      <div key={i} className="text-xs text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}
                {validationResult.warnings && validationResult.warnings.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.warnings.map((warning, i) => (
                      <div key={i} className="text-xs text-yellow-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Click validate to check flow structure</div>
            )}
          </div>
        )}

        {/* Job Count */}
        {serverUrl && (
          <div className="pt-4 border-t">
            <Label>Jobs</Label>
            <div className="flex items-center gap-2 mt-1">
              {loadingJobs ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <span className="text-sm font-medium">{jobCount ?? 0} jobs</span>
                  {jobCount !== null && jobCount > 0 && (
                    <Link href={`/jobs?flowId=${flowId}`}>
                      <Button variant="ghost" size="sm" className="h-7 gap-1">
                        View Jobs
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{Object.keys(flow.routines).length}</p>
            <p className="text-xs text-muted-foreground">Routines</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{flow.connections.length}</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {flow.connections.filter(c => c.source_routine !== c.target_routine).length}
            </p>
            <p className="text-xs text-muted-foreground">Cross-Connections</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
