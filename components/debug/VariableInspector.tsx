"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, RefreshCw, Loader2, Edit2, Check, X } from "lucide-react";
import { createAPI } from "@/lib/api";
import type { VariablesResponse } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface VariableInspectorProps {
  jobId: string;
  serverUrl: string;
  availableRoutines: string[];
  embedded?: boolean;
}

export function VariableInspector({
  jobId,
  serverUrl,
  availableRoutines,
  embedded = false,
}: VariableInspectorProps) {
  const [variables, setVariables] = useState<VariablesResponse | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingVar, setSavingVar] = useState<string | null>(null);

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

  const handleStartEdit = (name: string, value: any) => {
    setEditingVar(name);
    setEditValue(JSON.stringify(value, null, 2));
  };

  const handleCancelEdit = () => {
    setEditingVar(null);
    setEditValue("");
  };

  const handleSaveEdit = async (name: string) => {
    setSavingVar(name);
    try {
      const api = createAPI(serverUrl);
      let parsedValue;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        // If not valid JSON, use as string
        parsedValue = editValue;
      }

      await api.debug.setVariable(jobId, name, parsedValue);

      // Reload variables after saving
      await loadVariables();

      setEditingVar(null);
      setEditValue("");
    } catch (error) {
      console.error("Failed to set variable:", error);
      alert("Failed to set variable: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSavingVar(null);
    }
  };

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

  const content = (
    <>
      {/* Routine Selector */}
      <Select
        value={selectedRoutine || "all"}
        onValueChange={(value) => setSelectedRoutine(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full mb-3">
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

      {loading && !variables ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !variables || Object.keys(variables.variables).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No variables available
        </p>
      ) : (
        <ScrollArea className={embedded ? "h-[200px]" : "h-[300px]"}>
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
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {getVariableType(value)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleStartEdit(name, value)}
                      title="Edit variable"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {editingVar === name ? (
                  <div className="space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full text-xs bg-background p-2 rounded font-mono border resize-y min-h-[60px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") handleCancelEdit();
                        if (e.key === "Enter" && e.ctrlKey) handleSaveEdit(name);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(name)}
                        disabled={savingVar === name}
                        className="h-7"
                      >
                        {savingVar === name ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={savingVar === name}
                        className="h-7"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Press Ctrl+Enter to save, Esc to cancel
                    </p>
                  </div>
                ) : (
                  <div className="text-xs bg-background p-2 rounded font-mono overflow-x-auto">
                    {renderVariableValue(value)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );

  if (embedded) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Variables</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadVariables}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
        {content}
      </div>
    );
  }

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
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
