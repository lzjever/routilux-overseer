"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Code, RefreshCw, Loader2 } from "lucide-react";
import { createAPI } from "@/lib/api";
import type { VariablesResponse } from "@/lib/types/api";

interface VariableInspectorProps {
  jobId: string;
  serverUrl: string;
  availableRoutines: string[];
}

export function VariableInspector({
  jobId,
  serverUrl,
  availableRoutines,
}: VariableInspectorProps) {
  const [variables, setVariables] = useState<VariablesResponse | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadVariables = async () => {
    setLoading(true);
    try {
      const api = createAPI(serverUrl);
      const response = await api.debug.getVariables(jobId, selectedRoutine || undefined);
      setVariables(response);
    } catch (error) {
      console.error("Failed to load variables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVariables();
  }, [jobId, selectedRoutine]);

  const renderVariableValue = (value: any): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getVariableType = (value: any): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Variables</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadVariables}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Routine Selector */}
        <Select
          value={selectedRoutine || "all"}
          onValueChange={(value) => setSelectedRoutine(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All routines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routines</SelectItem>
            {availableRoutines.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {loading && !variables ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !variables || Object.keys(variables.variables).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No variables available
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {Object.entries(variables.variables).map(([name, value]) => (
                <div
                  key={name}
                  className="p-3 bg-muted rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold flex items-center gap-2">
                      <Code className="h-3 w-3" />
                      {name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getVariableType(value)}
                    </Badge>
                  </div>

                  <div className="text-xs bg-background p-2 rounded font-mono overflow-x-auto">
                    {renderVariableValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
