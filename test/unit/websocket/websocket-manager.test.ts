import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WebSocketManager, WebSocketManagerConfig } from "@/lib/websocket/websocket-manager";

// Mock WebSocket
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    // Simulate immediate connection for tests
    queueMicrotask(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    });
  }

  send(data: string): void {
    this.sentMessages.push(data);
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { code: code || 1000, reason: reason || "" }));
    }
  }

  // Helper to simulate receiving a message
  simulateMessage(data: string): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent("message", { data }));
    }
  }
}

// Store original WebSocket
const OriginalWebSocket = global.WebSocket;

describe("WebSocketManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore - Replace global WebSocket with mock
    global.WebSocket = MockWebSocket as any;
  });

  afterEach(() => {
    // Restore original WebSocket
    global.WebSocket = OriginalWebSocket;
  });

  describe("configuration", () => {
    it("should use default config when none provided", () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");
      expect((manager as any).config.maxReconnectAttempts).toBe(5);
      expect((manager as any).config.reconnectDelay).toBe(1000);
      expect((manager as any).config.enableHeartbeat).toBe(true);
    });

    it("should merge provided config with defaults", () => {
      const config: WebSocketManagerConfig = {
        maxReconnectAttempts: 10,
        heartbeatInterval: 60000,
      };
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket", config);
      expect((manager as any).config.maxReconnectAttempts).toBe(10);
      expect((manager as any).config.heartbeatInterval).toBe(60000);
      // Other defaults should still apply
      expect((manager as any).config.reconnectDelay).toBe(1000);
    });
  });

  describe("connection", () => {
    it("should connect to WebSocket server", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();

      expect(manager.isConnected()).toBe(true);
    });

    it("should disconnect from WebSocket server", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();
      expect(manager.isConnected()).toBe(true);

      manager.disconnect();
      expect(manager.isConnected()).toBe(false);
    });

    it("should start heartbeat on connection when enabled", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket", {
        enableHeartbeat: true,
        heartbeatInterval: 1000,
      });

      await manager.connect();

      // Heartbeat timeout should be set
      expect((manager as any).heartbeatTimeout).not.toBeNull();
    });

    it("should not start heartbeat when disabled", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket", {
        enableHeartbeat: false,
      });

      await manager.connect();

      // Heartbeat timeout should not be set
      expect((manager as any).heartbeatTimeout).toBeNull();
    });
  });

  describe("subscriptions", () => {
    it("should subscribe to job events", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();
      manager.subscribeToJob("job1");

      const ws = (manager as any).ws as MockWebSocket;
      const subscribeMsg = ws.sentMessages.find((m) => {
        const msg = JSON.parse(m);
        return msg.type === "subscribe" && msg.job_id === "job1";
      });

      expect(subscribeMsg).toBeDefined();
    });

    it("should unsubscribe from job events", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();
      manager.subscribeToJob("job1");
      manager.unsubscribeFromJob("job1");

      const ws = (manager as any).ws as MockWebSocket;
      const unsubscribeMsg = ws.sentMessages.find((m) => {
        const msg = JSON.parse(m);
        return msg.type === "unsubscribe" && msg.job_id === "job1";
      });

      expect(unsubscribeMsg).toBeDefined();
    });

    it("should unsubscribe from all jobs when no jobId provided", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();
      manager.subscribeToJob("job1");
      manager.subscribeToJob("job2");

      const ws = (manager as any).ws as MockWebSocket;
      ws.sentMessages = []; // Clear subscribe messages

      manager.unsubscribeFromJob();

      const unsubscribes = ws.sentMessages.filter((m) => {
        const msg = JSON.parse(m);
        return msg.type === "unsubscribe";
      });

      expect(unsubscribes.length).toBe(2);
    });
  });

  describe("event handlers", () => {
    it("should register and call event handlers", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      const handler = vi.fn();
      manager.on("job_started", handler);

      await manager.connect();

      const ws = (manager as any).ws as MockWebSocket;
      ws.simulateMessage(JSON.stringify({ type: "job_started", job_id: "job1" }));

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "job_started",
          job_id: "job1",
        })
      );
    });

    it("should return unsubscribe function", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      const handler = vi.fn();
      const unsubscribe = manager.on("job_started", handler);

      await manager.connect();

      const ws = (manager as any).ws as MockWebSocket;

      ws.simulateMessage(JSON.stringify({ type: "job_started", job_id: "job1" }));
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      ws.simulateMessage(JSON.stringify({ type: "job_started", job_id: "job2" }));
      expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should respond to server ping with pong", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();

      const ws = (manager as any).ws as MockWebSocket;
      ws.sentMessages = [];

      ws.simulateMessage(JSON.stringify({ type: "ping" }));

      const pongMsg = ws.sentMessages.find((m) => {
        const msg = JSON.parse(m);
        return msg.type === "pong";
      });

      expect(pongMsg).toBeDefined();
    });

    it("should update lastPongTime on pong", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();

      const ws = (manager as any).ws as MockWebSocket;

      // Simulate receiving a pong
      ws.simulateMessage(JSON.stringify({ type: "pong" }));

      // Last pong time should be updated
      expect((manager as any).lastPongTime).toBeGreaterThan(0);
    });
  });

  describe("getJobId", () => {
    it("should return first job ID", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();
      manager.subscribeToJob("job1");
      manager.subscribeToJob("job2");

      expect(manager.getJobId()).toBe("job1");
    });

    it("should return null when no jobs", async () => {
      const manager = new WebSocketManager("ws://localhost:8000/api/v1/websocket");

      await manager.connect();

      expect(manager.getJobId()).toBeNull();
    });
  });
});
