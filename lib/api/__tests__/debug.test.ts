import { describe, it, expect, beforeEach, vi } from "vitest";
import { DebugAPI } from "../debug";
import { APIClient } from "../client";
import { mockDebugSession, mockEvalResponse, mockEvalError } from "@/test/test-utils";

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve("{}"),
  } as Response)
) as any;

describe("DebugAPI", () => {
  let apiClient: APIClient;
  let debugAPI: DebugAPI;

  beforeEach(() => {
    apiClient = new APIClient("http://localhost:20555");
    debugAPI = new DebugAPI(apiClient);
    vi.clearAllMocks();
  });

  describe("getSession", () => {
    it("should get debug session info", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDebugSession),
        } as Response)
      );

      const result = await debugAPI.getSession("job-1");

      expect(result).toEqual(mockDebugSession);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/debug/session",
        expect.any(Object)
      );
    });
  });

  describe("evaluateExpression", () => {
    it("should evaluate expression successfully", async () => {
      const request = {
        expression: "1 + 1",
        routine_id: "routine-1",
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEvalResponse),
        } as Response)
      );

      const result = await debugAPI.evaluateExpression("job-1", request);

      expect(result).toEqual(mockEvalResponse);
      expect(result.result).toBe(42);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/debug/evaluate",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(request),
        })
      );
    });

    it("should handle evaluation errors", async () => {
      const request = {
        expression: "undefined_var",
        routine_id: "routine-1",
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEvalError),
        } as Response)
      );

      const result = await debugAPI.evaluateExpression("job-1", request);

      expect(result).toEqual(mockEvalError);
      expect(result.error).toBeDefined();
    });
  });

  describe("stepOver", () => {
    it("should step over execution", async () => {
      const mockResponse = { status: "running", job_id: "job-1", step_mode: "over" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await debugAPI.stepOver("job-1");

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/jobs/job-1/debug/step-over"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("stepInto", () => {
    it("should step into execution", async () => {
      const mockResponse = { status: "running", job_id: "job-1", step_mode: "into" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await debugAPI.stepInto("job-1");

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/jobs/job-1/debug/step-into"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("resume", () => {
    it("should resume execution", async () => {
      const mockResponse = { status: "running", job_id: "job-1" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await debugAPI.resume("job-1");

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/jobs/job-1/debug/resume"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });
});
