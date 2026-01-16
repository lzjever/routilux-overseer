import {
  BreakpointsService,
  OpenAPI,
  type BreakpointListResponse,
  type BreakpointCreateRequest,
  type BreakpointResponse,
} from "./generated";

export class BreakpointsAPI {
  constructor(private baseURL: string, private apiKey?: string) {
    // Configure OpenAPI base URL and headers
    OpenAPI.BASE = baseURL.replace(/\/$/, "");
    if (apiKey) {
      OpenAPI.HEADERS = {
        "X-API-Key": apiKey,
      };
    }
  }

  async create(jobId: string, request: BreakpointCreateRequest): Promise<BreakpointResponse> {
    return BreakpointsService.createBreakpointApiJobsJobIdBreakpointsPost(jobId, request);
  }

  async list(jobId: string): Promise<BreakpointListResponse> {
    return BreakpointsService.listBreakpointsApiJobsJobIdBreakpointsGet(jobId);
  }

  async delete(jobId: string, breakpointId: string): Promise<void> {
    return BreakpointsService.deleteBreakpointApiJobsJobIdBreakpointsBreakpointIdDelete(
      jobId,
      breakpointId
    );
  }

  async update(jobId: string, breakpointId: string, enabled: boolean): Promise<BreakpointResponse> {
    return BreakpointsService.updateBreakpointApiJobsJobIdBreakpointsBreakpointIdPut(
      jobId,
      breakpointId,
      enabled
    );
  }
}
