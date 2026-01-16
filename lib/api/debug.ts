import {
  DebugService,
  OpenAPI,
  type ExpressionEvalRequest,
  type ExpressionEvalResponse,
  type VariableSetRequest,
} from "./generated";

export class DebugAPI {
  constructor(private baseURL: string, private apiKey?: string) {
    // Configure OpenAPI base URL and headers
    OpenAPI.BASE = baseURL.replace(/\/$/, "");
    if (apiKey) {
      OpenAPI.HEADERS = {
        "X-API-Key": apiKey,
      };
    }
  }

  async getSession(jobId: string): Promise<any> {
    return DebugService.getDebugSessionApiJobsJobIdDebugSessionGet(jobId);
  }

  async resume(jobId: string): Promise<{ status: string; job_id: string }> {
    return DebugService.resumeDebugApiJobsJobIdDebugResumePost(jobId) as Promise<{
      status: string;
      job_id: string;
    }>;
  }

  async stepOver(jobId: string): Promise<{ status: string; job_id: string; step_mode: string }> {
    return DebugService.stepOverApiJobsJobIdDebugStepOverPost(jobId) as Promise<{
      status: string;
      job_id: string;
      step_mode: string;
    }>;
  }

  async stepInto(jobId: string): Promise<{ status: string; job_id: string; step_mode: string }> {
    return DebugService.stepIntoApiJobsJobIdDebugStepIntoPost(jobId) as Promise<{
      status: string;
      job_id: string;
      step_mode: string;
    }>;
  }

  async getVariables(jobId: string, routineId?: string): Promise<any> {
    return DebugService.getVariablesApiJobsJobIdDebugVariablesGet(jobId, routineId);
  }

  async setVariable(jobId: string, name: string, value: any): Promise<any> {
    const request: VariableSetRequest = { value };
    return DebugService.setVariableApiJobsJobIdDebugVariablesNamePut(jobId, name, request);
  }

  async getCallStack(jobId: string): Promise<any> {
    return DebugService.getCallStackApiJobsJobIdDebugCallStackGet(jobId);
  }

  async evaluateExpression(
    jobId: string,
    request: ExpressionEvalRequest
  ): Promise<ExpressionEvalResponse> {
    return DebugService.evaluateExpressionApiJobsJobIdDebugEvaluatePost(jobId, request);
  }
}
