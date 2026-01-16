"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Play, Clock, Trash2 } from "lucide-react";
import { createAPI } from "@/lib/api";
import type { ExpressionEvalResponse } from "@/lib/types/api";

interface ExpressionEvaluatorProps {
  jobId: string;
  serverUrl: string;
  jobStatus: string;
  availableRoutines: string[];
  embedded?: boolean;
}

interface HistoryEntry {
  expression: string;
  routineId?: string;
  result?: any;
  error?: string;
  timestamp: number;
}

const HISTORY_KEY = "expression-history";

export function ExpressionEvaluator({
  jobId,
  serverUrl,
  jobStatus,
  availableRoutines,
  embedded = false
}: ExpressionEvaluatorProps) {
  const [expression, setExpression] = useState("");
  const [routineId, setRoutineId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

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

      const entry: HistoryEntry = {
        expression,
        routineId: routineId || undefined,
        timestamp: Date.now()
      };

      if (response.error) {
        setError(response.error);
        setResult(null);
        entry.error = response.error;
      } else {
        setResult(response.result);
        setError(null);
        entry.result = response.result;
      }

      // Add to history
      setHistory((prev) => [entry, ...prev].slice(0, 20)); // Keep last 20 entries
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Evaluation failed";
      setError(errorMsg);
      setResult(null);
      setHistory((prev) => [{
        expression,
        routineId: routineId || undefined,
        error: errorMsg,
        timestamp: Date.now()
      }, ...prev].slice(0, 20));
    } finally {
      setEvaluating(false);
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setExpression(entry.expression);
    if (entry.routineId) {
      setRoutineId(entry.routineId);
    }
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const content = (
    <>
      {/* History Toggle */}
      {history.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="h-7 text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            History ({history.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="h-7 w-7 p-0"
            title="Clear history"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* History List */}
      {showHistory && history.length > 0 && (
        <div className="mb-3 p-2 bg-muted rounded-lg max-h-32 overflow-y-auto">
          {history.map((entry, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectHistory(entry)}
              className="w-full text-left p-2 hover:bg-background rounded text-sm font-mono truncate block"
            >
              {entry.expression}
            </button>
          ))}
        </div>
      )}

      {/* Routine Selection */}
      <Select value={routineId} onValueChange={setRoutineId}>
        <SelectTrigger className="mb-2">
          <SelectValue placeholder="Routine context (optional)" />
        </SelectTrigger>
        <SelectContent>
          {availableRoutines.map((r) => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Expression Input */}
      <Input
        placeholder="e.g., data.get('value') * 2"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEvaluate()}
        className="mb-2"
      />
      <p className="text-[10px] text-muted-foreground mb-2">
        Available: abs, all, any, dict, float, int, len, list, max, min, str, sum, tuple, type, isinstance, hasattr
      </p>

      <Button
        onClick={handleEvaluate}
        disabled={evaluating || !expression || jobStatus !== "paused"}
        className="w-full"
        size="sm"
      >
        {evaluating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Play className="mr-2 h-3 w-3" />}
        Evaluate
      </Button>

      {/* Result */}
      {result !== null && (
        <Alert className="mt-2">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Result</AlertTitle>
          <AlertDescription>
            <Badge variant="outline" className="mb-2 text-xs">{typeof result}</Badge>
            <pre className="text-xs bg-background p-2 rounded mt-2 overflow-auto max-h-24">
              {JSON.stringify(result, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="text-xs">Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </>
  );

  if (embedded) {
    return content;
  }

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
