import { APIClient } from "./client";
import type {
  Breakpoint,
  BreakpointListResponse,
  BreakpointCreateRequest,
} from "../types/api";

export class BreakpointsAPI {
  constructor(private client: APIClient) {}

  async create(jobId: string, request: BreakpointCreateRequest): Promise<Breakpoint> {
    return this.client.post<Breakpoint>(`/api/jobs/${jobId}/breakpoints`, request);
  }

  async list(jobId: string): Promise<BreakpointListResponse> {
    return this.client.get<BreakpointListResponse>(`/api/jobs/${jobId}/breakpoints`);
  }

  async delete(jobId: string, breakpointId: string): Promise<void> {
    return this.client.delete(`/api/jobs/${jobId}/breakpoints/${breakpointId}`);
  }

  async update(jobId: string, breakpointId: string, enabled: boolean): Promise<Breakpoint> {
    return this.client.put<Breakpoint>(
      `/api/jobs/${jobId}/breakpoints/${breakpointId}`,
      { enabled }
    );
  }
}
