export type WebSocketEventType =
  | "connected"
  | "subscribed"
  | "unsubscribed"
  | "ping"
  | "pong"
  | "error"
  | "job_started"
  | "job_completed"
  | "job_failed"
  | "routine_started"
  | "routine_completed"
  | "routine_failed"
  | "slot_called"
  | "event_emitted"
  | "breakpoint_hit";

export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  job_id?: string;
  timestamp?: string;
  data?: T;
  message?: string;
  subscriber_id?: string;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private jobIds: Set<string> = new Set();
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
    return this.connectWithUrl(this.url);
  }

  private connectWithUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let settled = false;
        this.url = url;
        this.ws = new WebSocket(this.url);
        this.isIntentionalClose = false;

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          settled = true;
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
          if (!settled) reject(error);
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
    this.jobIds.add(jobId);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", job_id: jobId }));
    }
  }

  unsubscribeFromJob(jobId?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (jobId) {
      this.ws.send(JSON.stringify({ type: "unsubscribe", job_id: jobId }));
      this.jobIds.delete(jobId);
      return;
    }
    this.jobIds.forEach((id) => {
      this.ws?.send(JSON.stringify({ type: "unsubscribe", job_id: id }));
    });
    this.jobIds.clear();
  }

  sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "pong" }));
    }
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
    if (message.type === "ping") {
      this.sendPong();
      return;
    }
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
    return this.jobIds.values().next().value ?? null;
  }
}

let wsManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(serverUrl: string): WebSocketManager {
  const wsUrl = buildWebSocketUrl(serverUrl);

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

function readApiKeyFromStorage(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("overseer-connection-storage");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { state?: { apiKey?: string | null } };
    const key = parsed?.state?.apiKey;
    return key || undefined;
  } catch {
    return undefined;
  }
}

function buildWebSocketUrl(serverUrl: string): string {
  const base = serverUrl.replace("http", "ws") + "/api/v1/websocket";
  const apiKey = readApiKeyFromStorage();
  if (!apiKey) return base;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}api_key=${encodeURIComponent(apiKey)}`;
}
