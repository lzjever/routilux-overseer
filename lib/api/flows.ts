import { APIClient } from "./client";
import type {
  FlowListResponse,
  FlowResponse,
  FlowCreateRequest,
  ConnectionInfo,
} from "../types/api";

export class FlowsAPI {
  constructor(private client: APIClient) {}

  async list(): Promise<FlowListResponse> {
    return this.client.get<FlowListResponse>("/api/flows");
  }

  async get(flowId: string): Promise<FlowResponse> {
    return this.client.get<FlowResponse>(`/api/flows/${flowId}`);
  }

  async create(request: FlowCreateRequest): Promise<FlowResponse> {
    return this.client.post<FlowResponse>("/api/flows", request);
  }

  async delete(flowId: string): Promise<void> {
    return this.client.delete(`/api/flows/${flowId}`);
  }

  async export(flowId: string, format: "yaml" | "json" = "yaml"): Promise<string> {
    const response = await this.client.get<{ format: string; dsl: string }>(
      `/api/flows/${flowId}/dsl`,
      { format }
    );
    return response.dsl;
  }

  async getRoutines(flowId: string): Promise<Record<string, any>> {
    return this.client.get<Record<string, any>>(`/api/flows/${flowId}/routines`);
  }

  async getConnections(flowId: string): Promise<ConnectionInfo[]> {
    return this.client.get<ConnectionInfo[]>(`/api/flows/${flowId}/connections`);
  }

  async validate(flowId: string): Promise<{ valid: boolean; issues: string[] }> {
    return this.client.get<{ valid: boolean; issues: string[] }>(
      `/api/flows/${flowId}/validate`
    );
  }

  async addRoutine(
    flowId: string,
    routineId: string,
    classPath: string,
    config?: Record<string, any>
  ): Promise<{ routine_id: string; status: string }> {
    return this.client.post<{ routine_id: string; status: string }>(
      `/api/flows/${flowId}/routines`,
      config,
      { routine_id: routineId, class_path: classPath }
    );
  }

  async removeRoutine(flowId: string, routineId: string): Promise<void> {
    return this.client.delete(`/api/flows/${flowId}/routines/${routineId}`);
  }

  async addConnection(
    flowId: string,
    sourceRoutine: string,
    sourceEvent: string,
    targetRoutine: string,
    targetSlot: string,
    paramMapping?: Record<string, string>
  ): Promise<{ status: string }> {
    return this.client.post<{ status: string }>(
      `/api/flows/${flowId}/connections`,
      paramMapping,
      {
        source_routine: sourceRoutine,
        source_event: sourceEvent,
        target_routine: targetRoutine,
        target_slot: targetSlot
      }
    );
  }

  async removeConnection(flowId: string, connectionIndex: number): Promise<void> {
    return this.client.delete(`/api/flows/${flowId}/connections/${connectionIndex}`);
  }

  async getMetrics(flowId: string): Promise<any> {
    return this.client.get<any>(`/api/flows/${flowId}/metrics`);
  }
}
