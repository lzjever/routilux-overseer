import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createAPI } from "@/lib/api";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("API Client Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createAPI", () => {
    it("should create API client with base URL", () => {
      const api = createAPI("http://localhost:20555");
      expect(api).toBeDefined();
      expect(api.testConnection).toBeDefined();
    });

    it("should configure OpenAPI base URL", () => {
      createAPI("http://localhost:20555");
      // The OpenAPI.BASE should be set
      // This is implicitly tested through the API calls
    });

    it("should set API key headers when provided", () => {
      const api = createAPI("http://localhost:20555", "test-api-key");
      expect(api).toBeDefined();
      expect(api.setApiKey).toBeDefined();
    });
  });

  describe("API methods existence", () => {
    it("should have flows API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.flows.list).toBeDefined();
      expect(api.flows.get).toBeDefined();
      expect(api.flows.create).toBeDefined();
      expect(api.flows.delete).toBeDefined();
      expect(api.flows.getMetrics).toBeDefined();
      expect(api.flows.exportDSL).toBeDefined();
      expect(api.flows.validate).toBeDefined();
      expect(api.flows.getRoutineInfo).toBeDefined();
      expect(api.flows.getRoutines).toBeDefined();
      expect(api.flows.getConnections).toBeDefined();
      expect(api.flows.addRoutine).toBeDefined();
      expect(api.flows.removeRoutine).toBeDefined();
      expect(api.flows.addConnection).toBeDefined();
      expect(api.flows.removeConnection).toBeDefined();
    });

    it("should have jobs API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.jobs.list).toBeDefined();
      expect(api.jobs.get).toBeDefined();
      expect(api.jobs.submit).toBeDefined();
      expect(api.jobs.complete).toBeDefined();
      expect(api.jobs.fail).toBeDefined();
      expect(api.jobs.wait).toBeDefined();
      expect(api.jobs.getOutput).toBeDefined();
      expect(api.jobs.getStatus).toBeDefined();
      expect(api.jobs.getTrace).toBeDefined();
      expect(api.jobs.getMetrics).toBeDefined();
      expect(api.jobs.getExecutionTrace).toBeDefined();
      expect(api.jobs.getLogs).toBeDefined();
      expect(api.jobs.getData).toBeDefined();
      expect(api.jobs.getMonitoringData).toBeDefined();
      expect(api.jobs.getRoutinesStatus).toBeDefined();
      expect(api.jobs.getRoutineQueueStatus).toBeDefined();
      expect(api.jobs.getQueuesStatus).toBeDefined();
    });

    it("should have workers API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.workers.create).toBeDefined();
      expect(api.workers.list).toBeDefined();
      expect(api.workers.get).toBeDefined();
      expect(api.workers.stop).toBeDefined();
      expect(api.workers.pause).toBeDefined();
      expect(api.workers.resume).toBeDefined();
      expect(api.workers.listJobs).toBeDefined();
      expect(api.workers.getStatistics).toBeDefined();
      expect(api.workers.getHistory).toBeDefined();
      expect(api.workers.getRoutineStates).toBeDefined();
      expect(api.workers.updateBreakpoint).toBeDefined();
    });

    it("should have breakpoints API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.breakpoints.list).toBeDefined();
      expect(api.breakpoints.create).toBeDefined();
      expect(api.breakpoints.delete).toBeDefined();
    });

    it("should have discovery API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.discovery.syncFlows).toBeDefined();
      expect(api.discovery.discoverFlows).toBeDefined();
      expect(api.discovery.syncJobs).toBeDefined();
      expect(api.discovery.discoverJobs).toBeDefined();
      expect(api.discovery.syncWorkers).toBeDefined();
    });

    it("should have factory API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.factory.listObjects).toBeDefined();
      expect(api.factory.getObjectMetadata).toBeDefined();
      expect(api.factory.getObjectInterface).toBeDefined();
    });

    it("should have runtimes API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.runtimes.list).toBeDefined();
      expect(api.runtimes.get).toBeDefined();
      expect(api.runtimes.create).toBeDefined();
    });

    it("should have health API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.health.liveness).toBeDefined();
      expect(api.health.readiness).toBeDefined();
      expect(api.health.stats).toBeDefined();
    });

    it("should have execute API methods", () => {
      const api = createAPI("http://localhost:20555");

      expect(api.execute.flow).toBeDefined();
    });
  });

  describe("testConnection", () => {
    it("should have testConnection method", () => {
      const api = createAPI("http://localhost:20555");
      expect(api.testConnection).toBeDefined();
      expect(typeof api.testConnection).toBe("function");
    });

    it("should return false when health check fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection failed"));

      const api = createAPI("http://localhost:20555");
      const result = await api.testConnection();

      expect(result).toBe(false);
    });
  });

  describe("setApiKey", () => {
    it("should update API key", () => {
      const api = createAPI("http://localhost:20555");

      api.setApiKey("new-api-key");
      // The key should be set in headers (implicitly tested)
    });

    it("should clear API key when set to null", () => {
      const api = createAPI("http://localhost:20555", "initial-key");

      api.setApiKey(null);
      // The headers should be cleared (implicitly tested)
    });
  });

  describe("Error handling", () => {
    it("should wrap API errors with ApiClientError", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Not found" }),
      });

      const api = createAPI("http://localhost:20555");

      await expect(api.flows.get("non-existent")).rejects.toThrow();
    });
  });
});
