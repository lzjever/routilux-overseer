"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, ScrollText, X, Clock, CheckCircle, XCircle, Zap, Info } from "lucide-react";
import { useJobEventsStore } from "@/lib/stores/jobEventsStore";
import { cn } from "@/lib/utils";

interface MiniEventLogProps {
  jobId: string;
  onFocusRoutine?: (routineId: string) => void;
}

export function MiniEventLog({ jobId, onFocusRoutine }: MiniEventLogProps) {
  const events = useJobEventsStore((s) => s.getEvents(jobId).slice(-20));
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

  const getEventIcon = (eventName: string) => {
    const icons = {
      routine_started: Zap,
      routine_completed: CheckCircle,
      routine_failed: XCircle,
      slot_called: Info,
      event_emitted: Info,
      breakpoint_hit: CheckCircle,
      error: XCircle,
    };
    const Icon = icons[eventName as keyof typeof icons] || Info;
    return <Icon className="h-3 w-3" />;
  };

  const getEventColor = (eventName: string) => {
    const colors = {
      routine_started: "text-blue-500",
      routine_completed: "text-green-500",
      routine_failed: "text-red-500",
      slot_called: "text-slate-500",
      event_emitted: "text-purple-500",
      breakpoint_hit: "text-yellow-500",
      error: "text-red-500",
    };
    return colors[eventName as keyof typeof colors] || "text-slate-500";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleClear = () => {
    // TODO: Clear events from store
    console.log("Clear events");
  };

  const handleEventClick = (routineId: string) => {
    setSelectedRoutine(routineId);
    if (onFocusRoutine) {
      onFocusRoutine(routineId);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg transition-all duration-300 z-40",
        isExpanded ? "h-[300px]" : "h-[120px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-slate-600" />
          <span className="font-semibold text-sm">Live Events</span>
          <Badge variant="secondary">{events.length} events</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Events */}
      <ScrollArea className={cn("p-2", isExpanded ? "h-[244px]" : "h-[64px]")}>
        <div className="space-y-1">
          {events.map((event, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-2 px-2 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors",
                "hover:bg-slate-50",
                event.routine_id === selectedRoutine && "bg-blue-50"
              )}
              onClick={() => event.routine_id && handleEventClick(event.routine_id)}
            >
              <span className={cn("shrink-0", getEventColor(event.event_name))}>
                {getEventIcon(event.event_name)}
              </span>
              <span className="text-slate-500 shrink-0">
                {formatTime(event.timestamp)}
              </span>
              {event.routine_id && (
                <span className="font-semibold text-slate-700 shrink-0">
                  {event.routine_id}
                </span>
              )}
              <span className="text-slate-600 truncate flex-1">
                {String(event.data?.event_name ?? event.data?.slot_name ?? event.event_name ?? "")}
              </span>
            </div>
          ))}

          {events.length === 0 && (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No events yet...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
