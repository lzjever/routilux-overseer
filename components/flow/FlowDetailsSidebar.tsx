"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Inbox, Send, X } from "lucide-react";
import { AddRoutineDialog } from "./AddRoutineDialog";
import { AddConnectionDialog } from "./AddConnectionDialog";
import { createAPI } from "@/lib/api";
import type { FlowResponse } from "@/lib/types/api";

interface FlowDetailsSidebarProps {
  flow: FlowResponse;
  flowId: string;
  serverUrl?: string;
  routines?: Record<string, any>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
  onRoutineClick?: (routineId: string) => void;
  onConnectionClick?: (connectionIndex: number) => void;
}

export function FlowDetailsSidebar({
  flow,
  flowId,
  serverUrl,
  routines = {},
  collapsed = false,
  onToggleCollapse,
  onRefresh,
  onRoutineClick,
  onConnectionClick,
}: FlowDetailsSidebarProps) {
  const [activeTab, setActiveTab] = useState<"routines" | "connections">("routines");

  const handleRemoveConnection = async (index: number) => {
    if (!serverUrl) return;
    try {
      const api = createAPI(serverUrl);
      await api.flows.removeConnection(flowId, index);
      onRefresh?.();
    } catch (error) {
      alert(
        `Failed to remove connection: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 border-l bg-muted/30 flex flex-col items-center py-2 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleCollapse}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2 mt-4">
          <div className="h-8 w-8 flex items-center justify-center" title="Routines">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          </div>
          <div className="h-8 w-8 flex items-center justify-center" title="Connections">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-muted/30 flex flex-col h-full">
      {/* Header */}
      <div className="h-10 border-b flex items-center justify-between px-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="routines" className="text-xs">
              Routines
            </TabsTrigger>
            <TabsTrigger value="connections" className="text-xs">
              Connections
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-2"
          onClick={onToggleCollapse}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
          {/* Routines Tab */}
          <TabsContent value="routines" className="flex-1 m-0 p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {Object.keys(flow.routines).length} routines
              </span>
              {serverUrl && (
                <AddRoutineDialog
                  flowId={flowId}
                  serverUrl={serverUrl}
                  onSuccess={onRefresh ?? (() => {})}
                  trigger={
                    <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(flow.routines).map(([id, routine]: [string, any]) => {
                const inCount = routine.slots?.length ?? 0;
                const outCount = routine.events?.length ?? 0;
                return (
                  <button
                    key={id}
                    type="button"
                    className="w-full text-left p-2.5 pr-2 bg-background rounded-lg border border-border/80 cursor-pointer hover:bg-accent/50 hover:border-border transition-colors group flex items-start gap-2 border-l-[3px] border-l-blue-300"
                    onClick={() => onRoutineClick?.(id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{id}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {routine.class_name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Inbox className="h-3 w-3 text-blue-500" aria-hidden />
                          {inCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3 text-emerald-500" aria-hidden />
                          {outCount}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="flex-1 m-0 p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {flow.connections.length} connections
              </span>
              {serverUrl && (
                <AddConnectionDialog
                  flowId={flowId}
                  serverUrl={serverUrl}
                  routines={routines}
                  onSuccess={onRefresh ?? (() => {})}
                  trigger={
                    <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  }
                />
              )}
            </div>
            <div className="space-y-1.5">
              {flow.connections.length === 0 ? (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  No connections
                </div>
              ) : (
                flow.connections.map((conn: any, index: number) => (
                  <div
                    key={index}
                    className="p-2.5 pr-2 bg-background rounded-lg border border-border/80 cursor-pointer hover:bg-accent/50 hover:border-border transition-colors group flex items-start gap-2 border-l-[3px] border-l-emerald-300"
                    onClick={() => onConnectionClick?.(index)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">From</div>
                      <div className="text-xs font-mono font-medium truncate">
                        {conn.source_routine}<span className="text-muted-foreground">.</span>{conn.source_event}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5 mt-1.5">To</div>
                      <div className="text-xs font-mono font-medium truncate">
                        {conn.target_routine}<span className="text-muted-foreground">.</span>{conn.target_slot}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveConnection(index);
                      }}
                      aria-label="Remove connection"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
