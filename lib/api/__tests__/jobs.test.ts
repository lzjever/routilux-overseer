import { describe, it, expect, beforeEach, vi } from "vitest";
import { JobsAPI } from "../jobs";
import { APIClient } from "../client";
import { mockJobState } from "@/test/test-utils";

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve("{}"),
  } as Response)
) as any;

describe("JobsAPI", () => {
  let apiClient: APIClient;
  let jobsAPI: JobsAPI;

  beforeEach(() => {
    apiClient = new APIClient("http://localhost:20555");
    jobsAPI = new JobsAPI(apiClient);
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should list all jobs", async () => {
      const mockJobs = [
        { job_id: "job-1", flow_id: "flow-1", status: "running" },
        { job_id: "job-2", flow_id: "flow-1", status: "completed" },
      ];

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ jobs: mockJobs }),
        } as Response)
      );

      const result = await jobsAPI.list();

      expect(result).toEqual({ jobs: mockJobs });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/jobs"),
        expect.any(Object)
      );
    });

    it("should list jobs with query parameters", async () => {
      const mockJobs = [{ job_id: "job-1", flow_id: "flow-1", status: "running" }];

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ jobs: mockJobs }),
        } as Response)
      );

      await jobsAPI.list({ flow_id: "flow-1", status: "running" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("flow_id=flow-1"),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=running"),
        expect.any(Object)
      );
    });
  });

  describe("get", () => {
    it("should get a specific job", async () => {
      const mockJob = { job_id: "job-1", flow_id: "flow-1", status: "running" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJob),
        } as Response)
      );

      const result = await jobsAPI.get("job-1");

      expect(result).toEqual(mockJob);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1",
        expect.any(Object)
      );
    });
  });

  describe("start", () => {
    it("should start a job", async () => {
      const mockJob = { job_id: "job-1", flow_id: "flow-1", status: "running" };
      const request = { flow_id: "flow-1" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJob),
        } as Response)
      );

      const result = await jobsAPI.start(request);

      expect(result).toEqual(mockJob);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/jobs"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe("pause", () => {
    it("should pause a job", async () => {
      const mockResponse = { status: "paused" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await jobsAPI.pause("job-1");

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/pause",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("resume", () => {
    it("should resume a paused job", async () => {
      const mockResponse = { status: "running" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await jobsAPI.resume("job-1");

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/resume",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("cancel", () => {
    it("should cancel a job", async () => {
      const mockResponse = { status: "cancelled" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await jobsAPI.cancel("job-1");

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/cancel",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("getState", () => {
    it("should get job state", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJobState),
        } as Response)
      );

      const result = await jobsAPI.getState("job-1");

      expect(result).toEqual(mockJobState);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/state",
        expect.any(Object)
      );
    });
  });

  describe("getMetrics", () => {
    it("should get job metrics", async () => {
      const mockMetrics = {
        job_id: "job-1",
        flow_id: "flow-1",
        start_time: "2025-01-15T10:00:00Z",
        end_time: null,
        duration: null,
        routine_metrics: {},
        total_events: 0,
        total_slot_calls: 0,
        total_event_emits: 0,
        errors: [],
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMetrics),
        } as Response)
      );

      const result = await jobsAPI.getMetrics("job-1");

      expect(result).toEqual(mockMetrics);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/metrics",
        expect.any(Object)
      );
    });
  });

  describe("getTrace", () => {
    it("should get job trace", async () => {
      const mockTrace = {
        events: [],
        total: 0,
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrace),
        } as Response)
      );

      const result = await jobsAPI.getTrace("job-1");

      expect(result).toEqual(mockTrace);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/trace",
        expect.any(Object)
      );
    });

    it("should get job trace with limit", async () => {
      const mockTrace = {
        events: [],
        total: 0,
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrace),
        } as Response)
      );

      await jobsAPI.getTrace("job-1", 100);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/trace?limit=100",
        expect.any(Object)
      );
    });
  });

  describe("getLogs", () => {
    it("should get job logs", async () => {
      const mockLogs = {
        job_id: "job-1",
        logs: [],
        total: 0,
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLogs),
        } as Response)
      );

      const result = await jobsAPI.getLogs("job-1");

      expect(result).toEqual(mockLogs);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:20555/api/jobs/job-1/logs",
        expect.any(Object)
      );
    });
  });
});
