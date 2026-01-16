"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Layers, RefreshCw, Loader2, ArrowRight, Code } from "lucide-react";
import { createAPI } from "@/lib/api";
import type { CallStackResponse } from "@/lib/types/api";

interface CallStackViewerProps {
  jobId: string;
  serverUrl: string;
  embedded?: boolean;
}

export function CallStackViewer({ jobId, serverUrl, embedded = false }: CallStackViewerProps) {
  const [callStack, setCallStack] = useState<CallStackResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCallStack = async () => {
    setLoading(true);
    try {
      const api = createAPI(serverUrl);
      const response = await api.debug.getCallStack(jobId);
      setCallStack(response);
    } catch (error) {
      console.error("Failed to load call stack:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCallStack();
  }, [jobId]);

  if (!callStack || callStack.call_stack.length === 0) {
    if (embedded) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No call stack available</p>
        </div>
      );
    }
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Call Stack</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCallStack}
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
          <p className="text-sm text-muted-foreground text-center py-4">
            No call stack available
          </p>
        </CardContent>
      </Card>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">
          Depth: {callStack.call_stack.length}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadCallStack}
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
      <ScrollArea className={embedded ? "h-[200px]" : "h-[300px]"}>
        <div className="space-y-1">
          {callStack.call_stack.map((frame, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {index}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-semibold">
                    {frame.routine_id}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {frame.slot_name && (
                    <>
                      <Code className="h-3 w-3" />
                      <span>slot: {frame.slot_name}</span>
                    </>
                  )}
                  {frame.event_name && (
                    <>
                      <ArrowRight className="h-3 w-3" />
                      <span>event: {frame.event_name}</span>
                    </>
                  )}
                </div>

                {frame.variables && frame.variables.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground">Variables: </span>
                    <span className="font-mono text-primary">
                      {frame.variables.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Call Stack</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
