"use client";

import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RoutineDocstringProps {
  docstring: string | null | undefined;
  loading?: boolean;
  className?: string;
  maxHeight?: string;
  collapsed?: boolean;
}

export function RoutineDocstring({
  docstring,
  loading = false,
  className,
  maxHeight = "200px",
  collapsed = false,
}: RoutineDocstringProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground p-3", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading documentation...</span>
      </div>
    );
  }

  if (!docstring) {
    return (
      <div className={cn("text-sm text-muted-foreground italic p-3", className)}>
        No documentation available
      </div>
    );
  }

  return (
    <ScrollArea className={cn("w-full", className)} style={{ maxHeight }}>
      <pre className="text-sm whitespace-pre-wrap break-words font-mono bg-muted/30 p-3 rounded-md border text-foreground/90">
        {docstring}
      </pre>
    </ScrollArea>
  );
}
