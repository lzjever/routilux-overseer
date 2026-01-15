"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Play } from "lucide-react";
import { createAPI } from "@/lib/api";
import type { ExpressionEvalResponse } from "@/lib/types/api";

interface ExpressionEvaluatorProps {
  jobId: string;
  serverUrl: string;
  jobStatus: string;
  availableRoutines: string[];
}

export function ExpressionEvaluator({
  jobId,
  serverUrl,
  jobStatus,
  availableRoutines
}: ExpressionEvaluatorProps) {
  const [expression, setExpression] = useState("");
  const [routineId, setRoutineId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const handleEvaluate = async () => {
    if (!expression || !serverUrl) return;
    setEvaluating(true);
    setError(null);
    try {
      const api = createAPI(serverUrl);
      const response = await api.debug.evaluateExpression(jobId, {
        expression,
        routine_id: routineId || undefined
      });

      if (response.error) {
        setError(response.error);
        setResult(null);
      } else {
        setResult(response.result);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
      setResult(null);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expression Evaluator</CardTitle>
        <CardDescription>
          Safely evaluate Python expressions in paused job context
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Routine Selection */}
        <div className="space-y-2">
          <Label>Routine Context (Optional)</Label>
          <Select value={routineId} onValueChange={setRoutineId}>
            <SelectTrigger>
              <SelectValue placeholder="Select routine (optional)" />
            </SelectTrigger>
            <SelectContent>
              {availableRoutines.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expression Input */}
        <div className="space-y-2">
          <Label>Python Expression</Label>
          <Input
            placeholder="e.g., data.get('value') * 2"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEvaluate()}
          />
          <p className="text-xs text-muted-foreground">
            Available: abs, all, any, dict, float, int, len, list, max, min, str, sum, tuple, type, isinstance, hasattr
          </p>
        </div>

        <Button
          onClick={handleEvaluate}
          disabled={evaluating || !expression || jobStatus !== "paused"}
          className="w-full"
        >
          {evaluating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Evaluate
        </Button>

        {/* Result */}
        {result !== null && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Result</AlertTitle>
            <AlertDescription>
              <Badge variant="outline" className="mb-2">{typeof result}</Badge>
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                {JSON.stringify(result, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Evaluation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
