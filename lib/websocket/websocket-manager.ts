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

export interface WebSocketManagerConfig {
  /** Maximum number of reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Initial reconnection delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Maximum reconnection delay in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
  /** Connection timeout in ms (default: 10000) */
  connectionTimeout?: number;
  /** Whether to enable heartbeat (default: true) */
  enableHeartbeat?: boolean;
}

const DEFAULT_CONFIG: Required<WebSocketManagerConfig> = {
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  connectionTimeout: 10000,
  enableHeartbeat: true,
};

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private jobIds: Set<string> = new Set();
  private reconnectAttempts = 0;
  private config: Required<WebSocketManagerConfig>;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private isIntentionalClose = false;
  private lastPongTime = 0;

  constructor(url: string, config: WebSocketManagerConfig = {}) {
    this.url = url;
    this.config = { ...DEFAULT_CONFIG, ...config };
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

        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (!settled) {
            this.ws?.close();
            reject(new Error("WebSocket connection timeout"));
          }
        }, this.config.connectionTimeout);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          this.lastPongTime = Date.now();
          settled = true;
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          // Start heartbeat
          if (this.config.enableHeartbeat) {
            this.startHeartbeat();
          }
          // Resubscribe to jobs after reconnection
          this.resubscribeJobs();
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

        this.ws.onclose = (event) => {
          console.log("WebSocket closed", event.code, event.reason);
          this.stopHeartbeat();
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          if (
            !this.isIntentionalClose &&
            this.reconnectAttempts < this.config.maxReconnectAttempts
          ) {
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
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
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

  /**
   * Send a generic message over the WebSocket
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "ping" }));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimeout = setTimeout(() => {
      // Check if connection is stale (no pong for 2x heartbeat interval)
      const timeSinceLastPong = Date.now() - this.lastPongTime;
      if (timeSinceLastPong > this.config.heartbeatInterval * 2) {
        console.warn("WebSocket connection stale, closing for reconnection");
        this.ws?.close();
        return;
      }
      this.sendPing();
      // Schedule next heartbeat
      this.heartbeatTimeout = setTimeout(
        () => this.startHeartbeat(),
        this.config.heartbeatInterval
      );
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private resubscribeJobs(): void {
    if (this.jobIds.size > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(`Resubscribing to ${this.jobIds.size} jobs`);
      this.jobIds.forEach((jobId) => {
        this.ws?.send(JSON.stringify({ type: "subscribe", job_id: jobId }));
      });
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
    if (message.type === "pong") {
      this.lastPongTime = Date.now();
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
    // Exponential backoff with max delay cap
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );

    console.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`
    );

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
let currentConfig: WebSocketManagerConfig = {};

export function getWebSocketManager(
  serverUrl: string,
  config?: WebSocketManagerConfig
): WebSocketManager {
  const wsUrl = buildWebSocketUrl(serverUrl);

  // Check if we need to recreate the manager (URL changed or config changed)
  const configChanged = config && JSON.stringify(config) !== JSON.stringify(currentConfig);
  const needsNewInstance =
    !wsManagerInstance || wsManagerInstance["url"] !== wsUrl || configChanged;

  if (needsNewInstance) {
    if (wsManagerInstance) {
      wsManagerInstance.disconnect();
    }
    currentConfig = config || {};
    wsManagerInstance = new WebSocketManager(wsUrl, currentConfig);
  }

  return wsManagerInstance!;
}

export function disposeWebSocketManager(): void {
  if (wsManagerInstance) {
    wsManagerInstance.disconnect();
    wsManagerInstance = null;
  }
}

/**
 * Read API key from Zustand store (session-based, stored in sessionStorage)
 */
function readApiKeyFromStore(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem("overseer-connection-storage");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { state?: { apiKey?: string | null } };
    const key = parsed?.state?.apiKey;
    return key || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build WebSocket URL with API key in query parameter
 * Note: API key authentication is required by routilux server when api_key_enabled=true
 */
function buildWebSocketUrl(serverUrl: string): string {
  const base = serverUrl.replace("http", "ws") + "/api/v1/websocket";
  const apiKey = readApiKeyFromStore();
  if (!apiKey) return base;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}api_key=${encodeURIComponent(apiKey)}`;
}
