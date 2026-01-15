import { APIClient } from "./client";
import type {
  DebugSessionResponse,
  VariablesResponse,
  VariableSetResponse,
  CallStackResponse,
  ExpressionEvalRequest,
  ExpressionEvalResponse,
  DebugSessionInfo,
} from "../types/api";

export class DebugAPI {
  constructor(private client: APIClient) {}

  async getSession(jobId: string): Promise<DebugSessionResponse> {
    return this.client.get<DebugSessionResponse>(`/api/jobs/${jobId}/debug/session`);
  }

  async resume(jobId: string): Promise<{ status: string; job_id: string }> {
    return this.client.post<{ status: string; job_id: string }>(
      `/api/jobs/${jobId}/debug/resume`
    );
  }

  async stepOver(jobId: string): Promise<{ status: string; job_id: string; step_mode: string }> {
    return this.client.post<{ status: string; job_id: string; step_mode: string }>(
      `/api/jobs/${jobId}/debug/step-over`
    );
  }

  async stepInto(jobId: string): Promise<{ status: string; job_id: string; step_mode: string }> {
    return this.client.post<{ status: string; job_id: string; step_mode: string }>(
      `/api/jobs/${jobId}/debug/step-into`
    );
  }

  async getVariables(jobId: string, routineId?: string): Promise<VariablesResponse> {
    return this.client.get<VariablesResponse>(
      `/api/jobs/${jobId}/debug/variables`,
      routineId ? { routine_id: routineId } : undefined
    );
  }

  async setVariable(jobId: string, name: string, value: any): Promise<VariableSetResponse> {
    return this.client.put<VariableSetResponse>(
      `/api/jobs/${jobId}/debug/variables/${name}`,
      { value }
    );
  }

  async getCallStack(jobId: string): Promise<CallStackResponse> {
    return this.client.get<CallStackResponse>(`/api/jobs/${jobId}/debug/call-stack`);
  }

  async evaluateExpression(jobId: string, request: ExpressionEvalRequest): Promise<ExpressionEvalResponse> {
    return this.client.post<ExpressionEvalResponse>(
      `/api/jobs/${jobId}/debug/evaluate`,
      request
    );
  }
}
