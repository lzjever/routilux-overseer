export type WebSocketEventType =
  | "job_started"
  | "job_completed"
  | "job_failed"
  | "job_paused"
  | "job_resumed"
  | "job_cancelled"
  | "routine_started"
  | "routine_completed"
  | "routine_failed"
  | "slot_called"
  | "event_emitted"
  | "breakpoint_hit"
  | "error";

export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  job_id: string;
  timestamp: string;
  data: T;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private jobId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private isIntentionalClose = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.isIntentionalClose = false;

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket closed");
          if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribeToJob(jobId: string): void {
    this.jobId = jobId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", job_id: jobId }));
    }
  }

  unsubscribeFromJob(): void {
    if (this.jobId && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "unsubscribe", job_id: this.jobId }));
    }
    this.jobId = null;
  }

  on(eventType: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Also call wildcard handlers if any
    const wildcardHandlers = this.eventHandlers.get("*" as any);
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect...");
      this.connect().catch((error) => {
        console.error("Reconnect failed:", error);
      });
    }, delay);
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getJobId(): string | null {
    return this.jobId;
  }
}

let wsManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(serverUrl: string): WebSocketManager {
  const wsUrl = serverUrl.replace("http", "ws") + "/ws";

  if (!wsManagerInstance || wsManagerInstance["url"] !== wsUrl) {
    if (wsManagerInstance) {
      wsManagerInstance.disconnect();
    }
    wsManagerInstance = new WebSocketManager(wsUrl);
  }

  return wsManagerInstance;
}

export function disposeWebSocketManager(): void {
  if (wsManagerInstance) {
    wsManagerInstance.disconnect();
    wsManagerInstance = null;
  }
}
