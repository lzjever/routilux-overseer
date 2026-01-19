"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, Box, Link2 } from "lucide-react";
import { createAPI } from "@/lib/api";
import { toast } from "sonner";

/**
 * Represents an item to be deleted (routine or connection)
 */
export interface DeleteItem {
  type: "routine" | "connection";
  id: string;
  // For routine
  routineId?: string;
  // For connection - store identifiers, not index (index can change)
  sourceRoutine?: string;
  sourceEvent?: string;
  targetRoutine?: string;
  targetSlot?: string;
}

/**
 * Connection info for display
 */
export interface ConnectionInfo {
  sourceRoutine: string;
  sourceEvent: string;
  targetRoutine: string;
  targetSlot: string;
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DeleteItem[];
  flowId: string;
  serverUrl: string;
  /** Connections that will be affected by deleting routines */
  affectedConnections?: ConnectionInfo[];
  /** Called after successful deletion */
  onSuccess: () => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

/**
 * Unified delete confirmation dialog for routines and connections.
 * Handles proper deletion order (connections first, in reverse order to avoid index issues).
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  items,
  flowId,
  serverUrl,
  affectedConnections = [],
  onSuccess,
  onError,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const routineItems = items.filter((i) => i.type === "routine");
  const connectionItems = items.filter((i) => i.type === "connection");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const api = createAPI(serverUrl);

      // 1. Delete connections first (need to find current index each time)
      // Because after each deletion, indices shift
      for (const item of connectionItems) {
        // Get current flow state to find the correct index
        const currentFlow = await api.flows.get(flowId);
        const currentIndex = currentFlow.connections.findIndex(
          (conn: any) =>
            conn.source_routine === item.sourceRoutine &&
            conn.source_event === item.sourceEvent &&
            conn.target_routine === item.targetRoutine &&
            conn.target_slot === item.targetSlot
        );
        if (currentIndex !== -1) {
          await api.flows.removeConnection(flowId, currentIndex);
        }
      }

      // 2. Delete routines (order doesn't matter, backend handles associated connections)
      for (const item of routineItems) {
        if (item.routineId) {
          await api.flows.removeRoutine(flowId, item.routineId);
        }
      }

      // Success - close dialog and notify parent
      onOpenChange(false);
      
      // Show success toast
      const routineCount = items.filter(i => i.type === "routine").length;
      const connectionCount = items.filter(i => i.type === "connection").length;
      if (routineCount > 0 && connectionCount > 0) {
        toast.success("Items deleted successfully", {
          description: `Deleted ${routineCount} routine(s) and ${connectionCount} connection(s)`,
        });
      } else if (routineCount > 0) {
        toast.success("Routine deleted successfully", {
          description: `Deleted ${routineCount} routine(s)`,
        });
      } else if (connectionCount > 0) {
        toast.success("Connection deleted successfully", {
          description: `Deleted ${connectionCount} connection(s)`,
        });
      }
      
      onSuccess();
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Delete failed");
      onError?.(err);
      // Keep dialog open on error so user can retry
      toast.error("Failed to delete", {
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate dialog content based on items
  const renderContent = () => {
    const totalItems = items.length;
    const hasRoutines = routineItems.length > 0;
    const hasConnections = connectionItems.length > 0;
    const hasAffected = affectedConnections.length > 0;

    // Single routine
    if (totalItems === 1 && hasRoutines) {
      const routine = routineItems[0];
      return (
        <>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Routine
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete routine{" "}
                  <span className="font-mono font-semibold text-foreground">
                    &quot;{routine.routineId}&quot;
                  </span>
                  ?
                </p>
                {hasAffected && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm">
                    <p className="font-medium text-destructive mb-2">
                      This will also remove {affectedConnections.length} connection
                      {affectedConnections.length > 1 ? "s" : ""}:
                    </p>
                    <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                      {affectedConnections.slice(0, 5).map((conn, i) => (
                        <li key={i}>
                          • {conn.sourceRoutine}.{conn.sourceEvent} →{" "}
                          {conn.targetRoutine}.{conn.targetSlot}
                        </li>
                      ))}
                      {affectedConnections.length > 5 && (
                        <li className="text-muted-foreground">
                          ... and {affectedConnections.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </>
      );
    }

    // Single connection
    if (totalItems === 1 && hasConnections) {
      const conn = connectionItems[0];
      return (
        <>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Connection
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Are you sure you want to delete this connection?</p>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  {conn.sourceRoutine}.{conn.sourceEvent} →{" "}
                  {conn.targetRoutine}.{conn.targetSlot}
                </div>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </>
      );
    }

    // Multiple items
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Multiple Items
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>You are about to delete:</p>

              {hasRoutines && (
                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Box className="h-4 w-4" />
                    Routines ({routineItems.length})
                  </div>
                  <ul className="space-y-1 text-sm font-mono text-muted-foreground">
                    {routineItems.slice(0, 5).map((item) => (
                      <li key={item.id}>• {item.routineId}</li>
                    ))}
                    {routineItems.length > 5 && (
                      <li>... and {routineItems.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              {hasConnections && (
                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Link2 className="h-4 w-4" />
                    Connections ({connectionItems.length})
                  </div>
                  <ul className="space-y-1 text-xs font-mono text-muted-foreground">
                    {connectionItems.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        • {item.sourceRoutine}.{item.sourceEvent} →{" "}
                        {item.targetRoutine}.{item.targetSlot}
                      </li>
                    ))}
                    {connectionItems.length > 5 && (
                      <li>... and {connectionItems.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              {hasRoutines && (
                <div className="text-sm text-amber-600 dark:text-amber-500">
                  Note: Deleting routines will also remove their associated
                  connections.
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </>
    );
  };

  if (items.length === 0) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {renderContent()}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Helper function to get connections affected by deleting routines
 */
export function getAffectedConnections(
  routineIds: string[],
  connections: { source_routine: string; source_event: string; target_routine: string; target_slot: string }[]
): ConnectionInfo[] {
  return connections
    .filter(
      (conn) =>
        routineIds.includes(conn.source_routine) ||
        routineIds.includes(conn.target_routine)
    )
    .map((conn) => ({
      sourceRoutine: conn.source_routine,
      sourceEvent: conn.source_event,
      targetRoutine: conn.target_routine,
      targetSlot: conn.target_slot,
    }));
}
