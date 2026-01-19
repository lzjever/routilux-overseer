import { describe, it, expect, beforeEach, vi } from "vitest";
import { JobsService } from "../generated/services/JobsService";

// Mock the generated services
vi.mock("../generated/services/JobsService", () => ({
  JobsService: {
    listJobsApiV1JobsGet: vi.fn(),
    getJobApiV1JobsJobIdGet: vi.fn(),
    submitJobApiV1JobsPost: vi.fn(),
    completeJobApiV1JobsJobIdCompletePost: vi.fn(),
    failJobApiV1JobsJobIdFailPost: vi.fn(),
    waitForJobApiV1JobsJobIdWaitPost: vi.fn(),
    getJobOutputApiV1JobsJobIdOutputGet: vi.fn(),
    getJobStatusApiV1JobsJobIdStatusGet: vi.fn(),
    getJobTraceApiV1JobsJobIdTraceGet: vi.fn(),
    getJobMetricsApiV1JobsJobIdMetricsGet: vi.fn(),
    getJobExecutionTraceApiV1JobsJobIdExecutionTraceGet: vi.fn(),
    getJobLogsApiV1JobsJobIdLogsGet: vi.fn(),
    getJobDataApiV1JobsJobIdDataGet: vi.fn(),
    getJobMonitoringDataApiV1JobsJobIdMonitoringGet: vi.fn(),
    getRoutinesStatusApiV1JobsJobIdRoutinesStatusGet: vi.fn(),
    getRoutineQueueStatusApiV1JobsJobIdRoutinesRoutineIdQueueStatusGet: vi.fn(),
    getJobQueuesStatusApiV1JobsJobIdQueuesStatusGet: vi.fn(),
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
        { job_id: "job-1", flow_id: "flow-1", status: "running", worker_id: "worker-1" },
        { job_id: "job-2", flow_id: "flow-1", status: "completed", worker_id: "worker-1" },
      ];

      vi.mocked(JobsService.listJobsApiV1JobsGet).mockResolvedValue({
        jobs: mockJobs,
        total: 2,
        limit: 100,
        offset: 0,
      } as any);

      const result = await api.jobs.list();

      expect(result.jobs).toEqual(mockJobs);
      expect(JobsService.listJobsApiV1JobsGet).toHaveBeenCalledWith(
        null,
        null,
        null,
        100,
        undefined
      );
    });

    it("should list jobs with query parameters", async () => {
      const mockJobs = [{ job_id: "job-1", flow_id: "flow-1", status: "running", worker_id: "worker-1" }];

      vi.mocked(JobsService.listJobsApiV1JobsGet).mockResolvedValue({
        jobs: mockJobs,
        total: 1,
        limit: 100,
        offset: 0,
      } as any);

      await api.jobs.list(null, "flow-1", "running");

      expect(JobsService.listJobsApiV1JobsGet).toHaveBeenCalledWith(
        null,
        "flow-1",
        "running",
        100,
        undefined
      );
    });
  });

  describe("get", () => {
    it("should get a specific job", async () => {
      const mockJob = { job_id: "job-1", flow_id: "flow-1", status: "running", worker_id: "worker-1" };

      vi.mocked(JobsService.getJobApiV1JobsJobIdGet).mockResolvedValue(mockJob as any);

      const result = await api.jobs.get("job-1");

      expect(result).toEqual(mockJob);
      expect(JobsService.getJobApiV1JobsJobIdGet).toHaveBeenCalledWith("job-1");
    });
  });

  describe("submit", () => {
    it("should submit a job", async () => {
      const mockJob = { job_id: "job-1", flow_id: "flow-1", status: "pending", worker_id: "worker-1" };
      const request = {
        flow_id: "flow-1",
        routine_id: "source",
        slot_name: "trigger",
        data: {},
      };

      vi.mocked(JobsService.submitJobApiV1JobsPost).mockResolvedValue(mockJob as any);

      const result = await api.jobs.submit(request);

      expect(result).toEqual(mockJob);
      expect(JobsService.submitJobApiV1JobsPost).toHaveBeenCalledWith(request);
    });
  });

  describe("getMetrics", () => {
    it("should get job metrics", async () => {
      const mockMetrics = {
        total_events: 10,
        total_slot_calls: 5,
        total_event_emits: 5,
        duration: 1.5,
      };

      vi.mocked(JobsService.getJobMetricsApiV1JobsJobIdMetricsGet).mockResolvedValue(mockMetrics as any);

      const result = await api.jobs.getMetrics("job-1");

      expect(result).toEqual(mockMetrics);
      expect(JobsService.getJobMetricsApiV1JobsJobIdMetricsGet).toHaveBeenCalledWith("job-1");
    });
  });

  describe("getMonitoringData", () => {
    it("should get job monitoring data", async () => {
      const mockData = {
        job_id: "job-1",
        flow_id: "flow-1",
        job_status: "running",
        routines: {},
        updated_at: new Date().toISOString(),
      };

      vi.mocked(JobsService.getJobMonitoringDataApiV1JobsJobIdMonitoringGet).mockResolvedValue(mockData as any);

      const result = await api.jobs.getMonitoringData("job-1");

      expect(result).toEqual(mockData);
      expect(JobsService.getJobMonitoringDataApiV1JobsJobIdMonitoringGet).toHaveBeenCalledWith("job-1");
    });
  });
});
