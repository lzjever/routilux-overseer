import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockJobState } from "@/test/test-utils";
import { JobsService } from "../generated/services/JobsService";

// Mock the generated services
vi.mock("../generated/services/JobsService", () => ({
  JobsService: {
    listJobsApiJobsGet: vi.fn(),
    getJobApiJobsJobIdGet: vi.fn(),
    startJobApiJobsPost: vi.fn(),
    pauseJobApiJobsJobIdPausePost: vi.fn(),
    resumeJobApiJobsJobIdResumePost: vi.fn(),
    cancelJobApiJobsJobIdCancelPost: vi.fn(),
    getJobStateApiJobsJobIdStateGet: vi.fn(),
    cleanupJobsApiJobsCleanupPost: vi.fn(),
  },
}));

vi.mock("../generated/core/OpenAPI", () => ({
  OpenAPI: {
    BASE: "",
    HEADERS: undefined,
  },
}));

describe("Jobs API", () => {
  let api: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAPI, OpenAPI } = await import("../index");
    OpenAPI.BASE = "http://localhost:20555";
    api = createAPI("http://localhost:20555");
  });

  describe("list", () => {
    it("should list all jobs", async () => {
      const mockJobs = [
        { job_id: "job-1", flow_id: "flow-1", status: "running" },
        { job_id: "job-2", flow_id: "flow-1", status: "completed" },
      ];

      vi.mocked(JobsService.listJobsApiJobsGet).mockResolvedValue({
        jobs: mockJobs,
      } as any);

      const result = await api.jobs.list();

      expect(result.jobs).toEqual(mockJobs);
      expect(JobsService.listJobsApiJobsGet).toHaveBeenCalledWith(
        null,
        null,
        100,
        undefined
      );
    });

    it("should list jobs with query parameters", async () => {
      const mockJobs = [{ job_id: "job-1", flow_id: "flow-1", status: "running" }];

      vi.mocked(JobsService.listJobsApiJobsGet).mockResolvedValue({
        jobs: mockJobs,
      } as any);

      await api.jobs.list("flow-1", "running");

      expect(JobsService.listJobsApiJobsGet).toHaveBeenCalledWith(
        "flow-1",
        "running",
        100,
        undefined
      );
    });
  });

  describe("get", () => {
    it("should get a specific job", async () => {
      const mockJob = { job_id: "job-1", flow_id: "flow-1", status: "running" };

      vi.mocked(JobsService.getJobApiJobsJobIdGet).mockResolvedValue(mockJob as any);

      const result = await api.jobs.get("job-1");

      expect(result).toEqual(mockJob);
      expect(JobsService.getJobApiJobsJobIdGet).toHaveBeenCalledWith("job-1");
    });
  });

  describe("start", () => {
    it("should start a job", async () => {
      const mockJob = { job_id: "job-1", flow_id: "flow-1", status: "running" };
      const request = { flow_id: "flow-1" };

      vi.mocked(JobsService.startJobApiJobsPost).mockResolvedValue(mockJob as any);

      const result = await api.jobs.start(request);

      expect(result).toEqual(mockJob);
      expect(JobsService.startJobApiJobsPost).toHaveBeenCalledWith(request);
    });
  });

  describe("pause", () => {
    it("should pause a job", async () => {
      const mockResponse = { status: "paused" };

      vi.mocked(JobsService.pauseJobApiJobsJobIdPausePost).mockResolvedValue(mockResponse as any);

      const result = await api.jobs.pause("job-1");

      expect(result).toEqual(mockResponse);
      expect(JobsService.pauseJobApiJobsJobIdPausePost).toHaveBeenCalledWith("job-1");
    });
  });

  describe("resume", () => {
    it("should resume a paused job", async () => {
      const mockResponse = { status: "running" };

      vi.mocked(JobsService.resumeJobApiJobsJobIdResumePost).mockResolvedValue(mockResponse as any);

      const result = await api.jobs.resume("job-1");

      expect(result).toEqual(mockResponse);
      expect(JobsService.resumeJobApiJobsJobIdResumePost).toHaveBeenCalledWith("job-1");
    });
  });

  describe("cancel", () => {
    it("should cancel a job", async () => {
      const mockResponse = { status: "cancelled" };

      vi.mocked(JobsService.cancelJobApiJobsJobIdCancelPost).mockResolvedValue(mockResponse as any);

      const result = await api.jobs.cancel("job-1");

      expect(result).toEqual(mockResponse);
      expect(JobsService.cancelJobApiJobsJobIdCancelPost).toHaveBeenCalledWith("job-1");
    });
  });

  describe("getState", () => {
    it("should get job state", async () => {
      vi.mocked(JobsService.getJobStateApiJobsJobIdStateGet).mockResolvedValue(mockJobState as any);

      const result = await api.jobs.getState("job-1");

      expect(result).toEqual(mockJobState);
      expect(JobsService.getJobStateApiJobsJobIdStateGet).toHaveBeenCalledWith("job-1");
    });
  });

  describe("cleanup", () => {
    it("should cleanup jobs", async () => {
      const mockResponse = { removed: 5 };

      vi.mocked(JobsService.cleanupJobsApiJobsCleanupPost).mockResolvedValue(mockResponse as any);

      const result = await api.jobs.cleanup(24, ["completed"]);

      expect(result).toEqual(mockResponse);
      expect(JobsService.cleanupJobsApiJobsCleanupPost).toHaveBeenCalledWith(24, ["completed"]);
    });
  });
});
