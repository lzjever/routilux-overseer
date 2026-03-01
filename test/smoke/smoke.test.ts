/**
 * Smoke Tests - Quick validation of core functionality
 * These tests verify the most critical paths work correctly
 */

import { describe, it, expect } from "vitest";

describe("Smoke Tests", () => {
  describe("Module Imports", () => {
    it("should import stores without errors", async () => {
      const { useFlowStore } = await import("@/lib/stores/flowStore");
      const { useJobStore } = await import("@/lib/stores/jobStore");
      const { useWorkersStore } = await import("@/lib/stores/workersStore");
      const { useConnectionStore } = await import("@/lib/stores/connectionStore");
      const { useBreakpointStore } = await import("@/lib/stores/breakpointStore");

      expect(useFlowStore).toBeDefined();
      expect(useJobStore).toBeDefined();
      expect(useWorkersStore).toBeDefined();
      expect(useConnectionStore).toBeDefined();
      expect(useBreakpointStore).toBeDefined();
    });

    it("should import API client without errors", async () => {
      const { createAPI } = await import("@/lib/api");

      expect(createAPI).toBeDefined();
      expect(typeof createAPI).toBe("function");
    });

    it("should import WebSocket manager without errors", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      expect(getWebSocketManager).toBeDefined();
      expect(disposeWebSocketManager).toBeDefined();
    });

    it("should import query service without errors", async () => {
      const { queryService } = await import("@/lib/services/query-service");

      expect(queryService).toBeDefined();
    });

    it("should import error handling without errors", async () => {
      const { getApiErrorMessage, parseApiErrorBody, isNetworkError } =
        await import("@/lib/errors");

      expect(getApiErrorMessage).toBeDefined();
      expect(parseApiErrorBody).toBeDefined();
      expect(isNetworkError).toBeDefined();
    });

    it("should import logger without errors", async () => {
      const { logger, apiLogger, wsLogger, storeLogger } = await import("@/lib/utils/logger");

      expect(logger).toBeDefined();
      expect(apiLogger).toBeDefined();
      expect(wsLogger).toBeDefined();
      expect(storeLogger).toBeDefined();
    });
  });

  describe("Store Initial State", () => {
    it("should have correct connection store initial state", async () => {
      const { useConnectionStore } = await import("@/lib/stores/connectionStore");

      const state = useConnectionStore.getState();

      expect(state.connected).toBe(false);
      expect(state.connecting).toBe(false);
      expect(state.error).toBe(null);
    });

    it("should have correct flow store initial state", async () => {
      const { useFlowStore } = await import("@/lib/stores/flowStore");

      const state = useFlowStore.getState();

      expect(state.flows).toBeInstanceOf(Map);
      expect(state.nodes).toEqual([]);
      expect(state.edges).toEqual([]);
      expect(state.loading).toBe(false);
    });

    it("should have correct job store initial state", async () => {
      const { useJobStore } = await import("@/lib/stores/jobStore");

      const state = useJobStore.getState();

      expect(state.jobs).toBeInstanceOf(Map);
      expect(state.loading).toBe(false);
    });

    it("should have correct workers store initial state", async () => {
      const { useWorkersStore } = await import("@/lib/stores/workersStore");

      const state = useWorkersStore.getState();

      expect(state.workers).toBeInstanceOf(Map);
      expect(state.loading).toBe(false);
    });
  });

  describe("API Client Structure", () => {
    it("should create API with all expected methods", async () => {
      const { createAPI } = await import("@/lib/api");

      const api = createAPI("http://localhost:20555");

      // Core API groups
      expect(api.flows).toBeDefined();
      expect(api.jobs).toBeDefined();
      expect(api.workers).toBeDefined();
      expect(api.breakpoints).toBeDefined();
      expect(api.discovery).toBeDefined();
      expect(api.factory).toBeDefined();
      expect(api.runtimes).toBeDefined();
      expect(api.health).toBeDefined();
      expect(api.execute).toBeDefined();

      // Utility methods
      expect(api.testConnection).toBeDefined();
      expect(api.setApiKey).toBeDefined();
    });
  });

  describe("WebSocket Manager Structure", () => {
    it("should have all expected methods", async () => {
      const { getWebSocketManager, disposeWebSocketManager } =
        await import("@/lib/websocket/websocket-manager");

      const manager = getWebSocketManager("http://localhost:20555");

      expect(manager.connect).toBeDefined();
      expect(manager.disconnect).toBeDefined();
      expect(manager.subscribeToJob).toBeDefined();
      expect(manager.unsubscribeFromJob).toBeDefined();
      expect(manager.on).toBeDefined();
      expect(manager.isConnected).toBeDefined();
      expect(manager.send).toBeDefined();
      expect(manager.sendPong).toBeDefined();

      disposeWebSocketManager();
    });
  });

  describe("Query Service Structure", () => {
    it("should have all expected domain wrappers", async () => {
      const { queryService } = await import("@/lib/services/query-service");

      expect(queryService.flows).toBeDefined();
      expect(queryService.jobs).toBeDefined();
      expect(queryService.workers).toBeDefined();
      expect(queryService.runtimes).toBeDefined();
      expect(queryService.breakpoints).toBeDefined();

      // Check flows methods
      expect(queryService.flows.list).toBeDefined();
      expect(queryService.flows.get).toBeDefined();

      // Check jobs methods
      expect(queryService.jobs.list).toBeDefined();
      expect(queryService.jobs.get).toBeDefined();

      // Check workers methods
      expect(queryService.workers.list).toBeDefined();
      expect(queryService.workers.get).toBeDefined();
    });
  });

  describe("Error utilities", () => {
    it("should return user message from structured error body", async () => {
      const { getApiErrorMessage } = await import("@/lib/errors");

      expect(getApiErrorMessage({ code: "FLOW_NOT_FOUND", message: "Not found" })).toBe(
        "Flow not found."
      );
      expect(getApiErrorMessage({ code: "UNAUTHORIZED" })).toBe("Authentication required.");
      expect(getApiErrorMessage(null, "Fallback")).toBe("Fallback");
    });

    it("should detect network-like errors", async () => {
      const { isNetworkError } = await import("@/lib/errors");

      expect(isNetworkError(new Error("Failed to fetch"))).toBe(true);
      expect(isNetworkError(new Error("Connection refused"))).toBe(true);
      expect(isNetworkError(new Error("Something else"))).toBe(false);
    });
  });

  describe("Logger Functionality", () => {
    it("should create logger with correct methods", async () => {
      const { Logger } = await import("@/lib/utils/logger");

      const logger = new Logger();

      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.setLevel).toBeDefined();
      expect(logger.setPrefix).toBeDefined();
      expect(logger.child).toBeDefined();
    });
  });
});
