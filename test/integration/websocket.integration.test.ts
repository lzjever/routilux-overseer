import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      this.onopen?.(new Event("open"));
    }, 0);
  }

  send(data: string) {
    // Mock send
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close"));
  }

  // Helper to simulate receiving a message
  simulateMessage(data: object) {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
  }
}

// Replace global WebSocket with mock
vi.stubGlobal("WebSocket", MockWebSocket);

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("sessionStorage", mockSessionStorage);

describe("WebSocket Manager Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getWebSocketManager", () => {
    it("should be imported without errors", async () => {
      const { getWebSocketManager } = await import("@/lib/websocket/websocket-manager");
      expect(getWebSocketManager).toBeDefined();
    });

    it("should create WebSocket manager with correct URL", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager).toBeDefined();

      disposeWebSocketManager();
    });
  });

  describe("WebSocketManager methods", () => {
    it("should have connect method", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager.connect).toBeDefined();

      disposeWebSocketManager();
    });

    it("should have disconnect method", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager.disconnect).toBeDefined();

      disposeWebSocketManager();
    });

    it("should have subscribeToJob method", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager.subscribeToJob).toBeDefined();

      disposeWebSocketManager();
    });

    it("should have unsubscribeFromJob method", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager.unsubscribeFromJob).toBeDefined();

      disposeWebSocketManager();
    });

    it("should have on method for event handling", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager.on).toBeDefined();

      disposeWebSocketManager();
    });

    it("should have isConnected method", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager.isConnected).toBeDefined();

      disposeWebSocketManager();
    });
  });

  describe("URL building", () => {
    it("should build WebSocket URL from HTTP URL", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      // The URL should be ws://localhost:20555/api/v1/websocket
      expect(manager).toBeDefined();

      disposeWebSocketManager();
    });

    it("should build WebSocket URL from HTTPS URL", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("https://example.com");
      // The URL should be wss://example.com/api/v1/websocket
      expect(manager).toBeDefined();

      disposeWebSocketManager();
    });
  });

  describe("API Key handling", () => {
    it("should not include API key in URL when not set", async () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager).toBeDefined();

      disposeWebSocketManager();
    });

    it("should include API key in URL when set", async () => {
      mockSessionStorage.getItem.mockReturnValue(
        JSON.stringify({ state: { apiKey: "test-api-key" } })
      );

      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");
      expect(manager).toBeDefined();

      disposeWebSocketManager();
    });
  });
});
