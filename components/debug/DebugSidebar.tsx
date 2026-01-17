"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Bug, Settings2, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DebugSessionMonitor } from "./DebugSessionMonitor";
import { StepExecutionControls } from "./StepExecutionControls";
import { BreakpointControls } from "./BreakpointControls";
import { VariableInspector } from "./VariableInspector";
import { ExpressionEvaluator } from "./ExpressionEvaluator";
import { CallStackViewer } from "./CallStackViewer";
import { QueueStatusPanel } from "@/components/job/QueueStatusPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DebugSidebarProps {
  jobId: string;
  serverUrl: string;
  jobStatus: string;
  availableRoutines: string[];
  isOpen: boolean;
  onToggle: () => void;
  onStep?: () => void;
}

export function DebugSidebar({
  jobId,
  serverUrl,
  jobStatus,
  availableRoutines,
  isOpen,
  onToggle,
  onStep,
}: DebugSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-expand sidebar when job is paused
  useEffect(() => {
    if (jobStatus === "paused") {
      setIsExpanded(true);
    }
  }, [jobStatus]);

  const sidebarWidth = isExpanded ? "w-[400px]" : "w-[60px]";

  return (
    <>
      {/* Toggle Button (visible when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white border-l border-y border-slate-200 rounded-l-lg p-2 shadow-lg hover:bg-slate-50 transition-colors"
          title="Open Debug Sidebar"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full bg-white border-l shadow-xl transition-all duration-300 z-40 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
          sidebarWidth
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          {isExpanded && (
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-purple-600" />
              <h2 className="font-bold text-lg">Debug Panel</h2>
              <Badge variant={jobStatus === "paused" ? "default" : "outline"} className="ml-2">
                {jobStatus}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle} title="Close">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className={cn("flex-1", isExpanded ? "p-4" : "px-2 py-4")}>
          {isExpanded ? (
            <Tabs defaultValue="debug" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="debug">Debug</TabsTrigger>
                <TabsTrigger value="queues">Queues</TabsTrigger>
              </TabsList>

              <TabsContent value="debug" className="space-y-4 mt-0">
                {/* Debug Session Monitor */}
                <DebugSessionMonitor jobId={jobId} serverUrl={serverUrl} />

                <Separator />

                {/* Step Execution Controls */}
                <StepExecutionControls
                  jobId={jobId}
                  serverUrl={serverUrl}
                  status={jobStatus}
                  onStep={onStep}
                  embedded
                />

                <Separator />

                {/* Breakpoint Controls */}
                <BreakpointControls
                  jobId={jobId}
                  serverUrl={serverUrl}
                  availableRoutines={availableRoutines}
                  embedded
                />

                <Separator />

                {/* Variable Inspector */}
                <VariableInspector
                  jobId={jobId}
                  serverUrl={serverUrl}
                  availableRoutines={availableRoutines}
                  embedded
                />

                <Separator />

                {/* Expression Evaluator */}
                <ExpressionEvaluator
                  jobId={jobId}
                  serverUrl={serverUrl}
                  jobStatus={jobStatus}
                  availableRoutines={availableRoutines}
                  embedded
                />

                <Separator />

                {/* Call Stack Viewer */}
                <div>
                  <div className="text-sm font-semibold mb-2">Call Stack</div>
                  <CallStackViewer jobId={jobId} serverUrl={serverUrl} embedded />
                </div>
              </TabsContent>

              <TabsContent value="queues" className="mt-0">
                <QueueStatusPanel jobId={jobId} serverUrl={serverUrl} embedded />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <button
                className="p-2 rounded hover:bg-slate-100 transition-colors"
                title="Breakpoints"
              >
                <Bug className="h-5 w-5 text-slate-600" />
              </button>
              <button
                className="p-2 rounded hover:bg-slate-100 transition-colors"
                title="Variables"
              >
                <Settings2 className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
