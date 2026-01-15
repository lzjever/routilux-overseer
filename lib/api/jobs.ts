import { APIClient } from "./client";
import type {
  JobListResponse,
  JobResponse,
  JobStartRequest,
  JobStatusResponse,
  JobStateResponse,
  JobMetricsResponse,
  JobTraceResponse,
  JobLogsResponse,
} from "../types/api";

export class JobsAPI {
  constructor(private client: APIClient) {}

  async list(params?: Record<string, string | number>): Promise<JobListResponse> {
    return this.client.get<JobListResponse>("/api/jobs", params);
  }

  async get(jobId: string): Promise<JobResponse> {
    return this.client.get<JobResponse>(`/api/jobs/${jobId}`);
  }

  async start(request: JobStartRequest): Promise<JobResponse> {
    return this.client.post<JobResponse>("/api/jobs", request);
  }

  async pause(jobId: string): Promise<{ status: string; job_id: string }> {
    return this.client.post<{ status: string; job_id: string }>(
      `/api/jobs/${jobId}/pause`
    );
  }

  async resume(jobId: string): Promise<{ status: string; job_id: string }> {
    return this.client.post<{ status: string; job_id: string }>(
      `/api/jobs/${jobId}/resume`
    );
  }

  async cancel(jobId: string): Promise<{ status: string; job_id: string }> {
    return this.client.post<{ status: string; job_id: string }>(
      `/api/jobs/${jobId}/cancel`
    );
  }

  async getStatus(jobId: string): Promise<JobStatusResponse> {
    return this.client.get<JobStatusResponse>(`/api/jobs/${jobId}/status`);
  }

  async getState(jobId: string): Promise<JobStateResponse> {
    return this.client.get<JobStateResponse>(`/api/jobs/${jobId}/state`);
  }

  async getMetrics(jobId: string): Promise<JobMetricsResponse> {
    return this.client.get<JobMetricsResponse>(`/api/jobs/${jobId}/metrics`);
  }

  async getTrace(jobId: string, limit?: number): Promise<JobTraceResponse> {
    const params = limit ? { limit } : undefined;
    return this.client.get<JobTraceResponse>(`/api/jobs/${jobId}/trace`, params);
  }

  async getLogs(jobId: string): Promise<JobLogsResponse> {
    return this.client.get<JobLogsResponse>(`/api/jobs/${jobId}/logs`);
  }
}
