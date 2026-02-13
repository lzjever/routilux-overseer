"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useBreakpointStore } from "@/lib/stores/breakpointStore";
import { createAPI } from "@/lib/api";

interface FloatingBreakpointPanelProps {
  routineId: string;
  jobId: string;
  serverUrl: string;
  anchor?: { x: number; y: number } | null;
  onClose: () => void;
}

export function FloatingBreakpointPanel({
  routineId,
  jobId,
  serverUrl,
  anchor = null,
  onClose,
}: FloatingBreakpointPanelProps) {
  const routineSlots = useFlowStore((state) => {
    const node = state.nodes.find((item) => item.id === routineId);
    return (node?.data as { slots?: { name: string }[] } | undefined)?.slots ?? [];
  });
  const { breakpoints, loadBreakpoints } = useBreakpointStore();
  const jobBreakpoints = breakpoints.get(jobId) || [];
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    placement: "right" | "left" | "top" | "bottom";
  } | null>(null);

  const hasBreakpoint = jobBreakpoints.some(
    (bp) => bp.routine_id === routineId && bp.slot_name === selectedSlot
  );

  useEffect(() => {
    if (!routineSlots.length) {
      setSelectedSlot("");
      return;
    }
    if (!routineSlots.some((slot) => slot.name === selectedSlot)) {
      setSelectedSlot(routineSlots[0].name);
    }
  }, [routineSlots, selectedSlot]);

  const updatePosition = useCallback(() => {
    if (!anchor || !panelRef.current || typeof window === "undefined") {
      setPosition(null);
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();
    const panelWidth = rect.width || 320;
    const panelHeight = rect.height || 240;
    const padding = 12;
    const offset = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const candidates = [
      {
        placement: "right" as const,
        left: anchor.x + offset,
        top: anchor.y - panelHeight / 2,
      },
      {
        placement: "left" as const,
        left: anchor.x - panelWidth - offset,
        top: anchor.y - panelHeight / 2,
      },
      {
        placement: "bottom" as const,
        left: anchor.x - panelWidth / 2,
        top: anchor.y + offset,
      },
      {
        placement: "top" as const,
        left: anchor.x - panelWidth / 2,
        top: anchor.y - panelHeight - offset,
      },
    ];

    const fits = (candidate: { left: number; top: number }) =>
      candidate.left >= padding &&
      candidate.top >= padding &&
      candidate.left + panelWidth <= viewportWidth - padding &&
      candidate.top + panelHeight <= viewportHeight - padding;

    const pick = candidates.find((candidate) => fits(candidate)) || candidates[0];

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    setPosition({
      placement: pick.placement,
      left: clamp(pick.left, padding, viewportWidth - panelWidth - padding),
      top: clamp(pick.top, padding, viewportHeight - panelHeight - padding),
    });
  }, [anchor]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition, routineId, selectedSlot, hasBreakpoint]);

  useEffect(() => {
    if (!anchor) return;
    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [anchor, updatePosition]);

  const handleToggleBreakpoint = async () => {
    if (!serverUrl) return;
    setIsLoading(true);
    try {
      const api = createAPI(serverUrl);
      if (hasBreakpoint) {
        const bp = jobBreakpoints.find(
          (item) => item.routine_id === routineId && item.slot_name === selectedSlot
        );
        if (bp) {
          await api.breakpoints.delete(jobId, bp.breakpoint_id);
        }
      } else {
        await api.breakpoints.create(jobId, {
          routine_id: routineId,
          slot_name: selectedSlot,
          enabled: true,
        });
      }
      // Reload breakpoints
      await loadBreakpoints(jobId, serverUrl);
    } catch (error) {
      console.error("Failed to toggle breakpoint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Early return after all hooks are called
  if (routineSlots.length === 0) {
    return null;
  }

  const pointerPlacement = position?.placement;

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 w-auto max-w-[calc(100vw-2rem)] sm:w-80",
        anchor ? "inset-auto" : "inset-x-4 bottom-4 sm:right-6 sm:top-24"
      )}
      style={
        position
          ? { left: position.left, top: position.top }
          : anchor
            ? { left: anchor.x + 16, top: anchor.y + 16 }
            : undefined
      }
    >
      <div className="relative">
        {pointerPlacement && (
          <>
            <div
              className={cn(
                "absolute h-3 w-3 rotate-45 border shadow-sm",
                "bg-[hsl(var(--card)/0.95)] border-violet-200/70 dark:border-violet-500/20",
                pointerPlacement === "right" && "left-[-6px] top-1/2 -translate-y-1/2",
                pointerPlacement === "left" && "right-[-6px] top-1/2 -translate-y-1/2",
                pointerPlacement === "bottom" && "top-[-6px] left-1/2 -translate-x-1/2",
                pointerPlacement === "top" && "bottom-[-6px] left-1/2 -translate-x-1/2"
              )}
            />
            <div
              className={cn(
                "absolute bg-violet-400/60 dark:bg-violet-500/40",
                pointerPlacement === "right" && "left-[-18px] top-1/2 -translate-y-1/2 h-px w-3",
                pointerPlacement === "left" && "right-[-18px] top-1/2 -translate-y-1/2 h-px w-3",
                pointerPlacement === "bottom" && "top-[-18px] left-1/2 -translate-x-1/2 w-px h-3",
                pointerPlacement === "top" && "bottom-[-18px] left-1/2 -translate-x-1/2 w-px h-3"
              )}
            />
          </>
        )}
        <Card className="surface-panel shadow-2xl ring-1 ring-violet-200/60 dark:ring-violet-500/20 animate-in fade-in-0 zoom-in-95 duration-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-gradient-to-r from-violet-50/70 via-white/70 to-slate-50/70 dark:from-violet-950/30 dark:via-slate-950/30 dark:to-slate-900/40">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-500" />
              Breakpoint
              <span className="text-xs text-muted-foreground font-normal truncate max-w-[160px]">
                {routineId}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Slot
              </label>
              <select
                value={selectedSlot}
                onChange={(event) => setSelectedSlot(event.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {routineSlots.map((slot) => (
                  <option key={slot.name} value={slot.name}>
                    {slot.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant={hasBreakpoint ? "default" : "outline"}
              size="sm"
              className={cn(
                hasBreakpoint && "bg-violet-500 hover:bg-violet-600",
                "w-full shadow-sm"
              )}
              onClick={handleToggleBreakpoint}
              disabled={isLoading || !selectedSlot}
            >
              {hasBreakpoint ? "Remove Breakpoint" : "Set Breakpoint"}
            </Button>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Applies to selected slot only.</span>
              <span className={cn(hasBreakpoint ? "text-violet-600" : "text-slate-500")}>
                {hasBreakpoint ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
