import {
  JobsService,
  MonitorService,
  OpenAPI,
  type JobListResponse,
  type JobResponse,
  type JobStartRequest,
} from "./generated";

export class JobsAPI {
  constructor(private baseURL: string, private apiKey?: string) {
    // Configure OpenAPI base URL and headers
    OpenAPI.BASE = baseURL.replace(/\/$/, "");
    if (apiKey) {
      OpenAPI.HEADERS = {
        "X-API-Key": apiKey,
      };
    }
  }

  async list(params?: {
    flowId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<JobListResponse> {
    return JobsService.listJobsApiJobsGet(
      params?.flowId || null,
      params?.status || null,
      params?.limit || 100,
      params?.offset
    );
  }

  async get(jobId: string): Promise<JobResponse> {
    return JobsService.getJobApiJobsJobIdGet(jobId);
  }

  async start(request: JobStartRequest): Promise<JobResponse> {
    return JobsService.startJobApiJobsPost(request);
  }

  async pause(jobId: string): Promise<{ status: string; job_id: string }> {
    return JobsService.pauseJobApiJobsJobIdPausePost(jobId) as Promise<{
      status: string;
      job_id: string;
    }>;
  }

  async resume(jobId: string): Promise<{ status: string; job_id: string }> {
    return JobsService.resumeJobApiJobsJobIdResumePost(jobId) as Promise<{
      status: string;
      job_id: string;
    }>;
  }

  async cancel(jobId: string): Promise<{ status: string; job_id: string }> {
    return JobsService.cancelJobApiJobsJobIdCancelPost(jobId) as Promise<{
      status: string;
      job_id: string;
    }>;
  }

  async getStatus(jobId: string): Promise<{ job_id: string; status: string; flow_id: string }> {
    return JobsService.getJobStatusApiJobsJobIdStatusGet(jobId) as Promise<{
      job_id: string;
      status: string;
      flow_id: string;
    }>;
  }

  async getState(jobId: string): Promise<any> {
    return JobsService.getJobStateApiJobsJobIdStateGet(jobId);
  }

  async getMetrics(jobId: string): Promise<any> {
    return MonitorService.getJobMetricsApiJobsJobIdMetricsGet(jobId);
  }

  async getTrace(jobId: string, limit?: number): Promise<any> {
    return MonitorService.getJobTraceApiJobsJobIdTraceGet(jobId, limit || null);
  }

  async getLogs(jobId: string): Promise<any> {
    return MonitorService.getJobLogsApiJobsJobIdLogsGet(jobId);
  }

  async cleanup(maxAgeHours: number = 24, status?: string[]): Promise<{ removed: number }> {
    return JobsService.cleanupJobsApiJobsCleanupPost(maxAgeHours, status || null) as Promise<{
      removed: number;
    }>;
  }
}
