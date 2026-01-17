"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { createAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FlowValidationCardProps {
  flowId: string;
  serverUrl: string;
}

export function FlowValidationCard({ flowId, serverUrl }: FlowValidationCardProps) {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  } | null>(null);

  const validate = async () => {
    if (!serverUrl) return;
    setValidating(true);
    try {
      const api = createAPI(serverUrl);
      const result = await api.flows.validateFlow(flowId);
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

  useEffect(() => {
    if (flowId && serverUrl) {
      validate();
    }
  }, [flowId, serverUrl]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Validation Status</CardTitle>
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
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
