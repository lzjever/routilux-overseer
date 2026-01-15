import { getWebSocketManager, WebSocketMessage } from "./websocket-manager";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useJobStore } from "@/lib/stores/jobStore";
import { useJobEventsStore } from "@/lib/stores/jobEventsStore";
import type { ExecutionStatus } from "@/lib/types/flow";
import type { ExecutionRecord } from "@/lib/types/api";

export interface JobEventData {
  job_id: string;
  routine_id?: string;
  event_name?: string;
  slot_name?: string;
  data?: Record<string, any>;
  status?: string;
  timestamp: string;
}

export class JobMonitor {
  private jobId: string;
  private serverUrl: string;
  private unsubscribeCallbacks: Array<() => void> = [];

  constructor(jobId: string, serverUrl: string) {
    this.jobId = jobId;
    this.serverUrl = serverUrl;
  }

  async start(): Promise<void> {
    const wsManager = getWebSocketManager(this.serverUrl);

    // Connect if not already connected
    if (!wsManager.isConnected()) {
      await wsManager.connect();
    }

    // Subscribe to job events
    wsManager.subscribeToJob(this.jobId);

    // Register event handlers
    this.setupEventHandlers(wsManager);
  }

  stop(): void {
    const wsManager = getWebSocketManager(this.serverUrl);

    // Unsubscribe from job events
    wsManager.unsubscribeFromJob();

    // Remove all event handlers
    this.unsubscribeCallbacks.forEach((callback) => callback());
    this.unsubscribeCallbacks = [];
  }

  private setupEventHandlers(wsManager: ReturnType<typeof getWebSocketManager>): void {
    // Job started
    const unsubscribeStarted = wsManager.on("job_started", (message: WebSocketMessage) => {
      console.log("Job started:", message);
      this.updateJobStatus("running");
      this.addEventToStore("job_start", this.jobId, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeStarted);

    // Job completed
    const unsubscribeCompleted = wsManager.on("job_completed", (message: WebSocketMessage) => {
      console.log("Job completed:", message);
      this.updateJobStatus("completed");
      this.addEventToStore("job_end", this.jobId, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeCompleted);

    // Job failed
    const unsubscribeFailed = wsManager.on("job_failed", (message: WebSocketMessage) => {
      console.log("Job failed:", message);
      this.updateJobStatus("failed");
      this.addEventToStore("error", this.jobId, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeFailed);

    // Routine started
    const unsubscribeRoutineStarted = wsManager.on("routine_started", (message: WebSocketMessage) => {
      console.log("Routine started:", message);
      this.updateRoutineStatus(message.data.routine_id, "running");
      this.highlightConnection(message.data.routine_id, message.data.event_name);
      this.addEventToStore("routine_start", message.data.routine_id, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeRoutineStarted);

    // Routine completed
    const unsubscribeRoutineCompleted = wsManager.on("routine_completed", (message: WebSocketMessage) => {
      console.log("Routine completed:", message);
      this.updateRoutineStatus(message.data.routine_id, "completed");
      this.incrementExecutionCount(message.data.routine_id);
      this.addEventToStore("routine_end", message.data.routine_id, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeRoutineCompleted);

    // Routine failed
    const unsubscribeRoutineFailed = wsManager.on("routine_failed", (message: WebSocketMessage) => {
      console.log("Routine failed:", message);
      this.updateRoutineStatus(message.data.routine_id, "failed");
      this.addEventToStore("error", message.data.routine_id, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeRoutineFailed);

    // Event emitted
    const unsubscribeEventEmitted = wsManager.on("event_emitted", (message: WebSocketMessage) => {
      console.log("Event emitted:", message);
      this.highlightEdge(message.data.routine_id, message.data.event_name);
      this.addEventToStore("event_emit", message.data.routine_id, {
        event_name: message.data.event_name,
        ...message.data,
      });
    });
    this.unsubscribeCallbacks.push(unsubscribeEventEmitted);

    // Slot called
    const unsubscribeSlotCalled = wsManager.on("slot_called", (message: WebSocketMessage) => {
      console.log("Slot called:", message);
      this.highlightEdge(message.data.routine_id, message.data.slot_name);
      this.addEventToStore("slot_call", message.data.routine_id, {
        slot_name: message.data.slot_name,
        ...message.data,
      });
    });
    this.unsubscribeCallbacks.push(unsubscribeSlotCalled);

    // Breakpoint hit
    const unsubscribeBreakpointHit = wsManager.on("breakpoint_hit", (message: WebSocketMessage) => {
      console.log("Breakpoint hit:", message);
      this.updateRoutineStatus(message.data.routine_id, "paused");
      this.addEventToStore("breakpoint", message.data.routine_id, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeBreakpointHit);

    // Error
    const unsubscribeError = wsManager.on("error", (message: WebSocketMessage) => {
      console.error("Job error:", message);
      this.updateRoutineStatus(message.data.routine_id, "failed");
      this.addEventToStore("error", message.data.routine_id || this.jobId, message.data);
    });
    this.unsubscribeCallbacks.push(unsubscribeError);
  }

  private updateJobStatus(status: ExecutionStatus): void {
    // Update job status in job store
    const { jobs } = useJobStore.getState();
    const job = jobs.get(this.jobId);
    if (job) {
      useJobStore.setState((state) => ({
        jobs: new Map(state.jobs).set(this.jobId, {
          ...job,
          status,
        }),
      }));
    }
  }

  private updateRoutineStatus(routineId: string, status: ExecutionStatus): void {
    useFlowStore.getState().updateNodeData(routineId, { status });
  }

  private incrementExecutionCount(routineId: string): void {
    const { nodes } = useFlowStore.getState();
    const node = nodes.find((n) => n.id === routineId);
    if (node) {
      const currentCount = node.data.executionCount || 0;
      useFlowStore.getState().updateNodeData(routineId, {
        executionCount: currentCount + 1,
        lastExecutionTime: Date.now(),
      });
    }
  }

  private highlightConnection(routineId: string, eventName?: string): void {
    // Find and highlight edges connected to this routine's event
    const { edges } = useFlowStore.getState();
    const updatedEdges = edges.map((edge) => {
      if (edge.source === routineId && edge.sourceHandle === eventName) {
        return {
          ...edge,
          animated: true,
          data: {
            ...edge.data,
            active: true,
            lastActivity: new Date().toISOString(),
          },
        };
      }
      return edge;
    });
    useFlowStore.getState().setEdges(updatedEdges);

    // Reset animation after a delay
    setTimeout(() => {
      const { edges } = useFlowStore.getState();
      const resetEdges = edges.map((edge) => ({
        ...edge,
        animated: false,
        data: {
          ...edge.data,
          active: false,
        },
      }));
      useFlowStore.getState().setEdges(resetEdges);
    }, 2000);
  }

  private highlightEdge(routineId: string, handleName?: string): void {
    this.highlightConnection(routineId, handleName);
  }

  private addEventToStore(eventType: string, routineId: string, data: any): void {
    const eventRecord: ExecutionRecord = {
      event_name: eventType,
      routine_id: routineId,
      timestamp: new Date().toISOString(),
      data: data || {},
    };

    useJobEventsStore.getState().addEvent(this.jobId, eventRecord);
  }
}

// React hook for using JobMonitor
import { useEffect, useRef } from "react";

export function useJobMonitor(jobId: string | null, serverUrl: string | null) {
  const monitorRef = useRef<JobMonitor | null>(null);

  useEffect(() => {
    if (!jobId || !serverUrl) return;

    // Create and start monitor
    const monitor = new JobMonitor(jobId, serverUrl);
    monitorRef.current = monitor;

    monitor.start().catch((error) => {
      console.error("Failed to start job monitor:", error);
    });

    // Cleanup on unmount
    return () => {
      if (monitorRef.current) {
        monitorRef.current.stop();
        monitorRef.current = null;
      }
    };
  }, [jobId, serverUrl]);

  return monitorRef.current;
}
