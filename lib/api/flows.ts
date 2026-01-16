import {
  FlowsService,
  DiscoveryService,
  MonitorService,
  OpenAPI,
  type FlowListResponse,
  type FlowResponse,
  type FlowCreateRequest,
} from "./generated";

export class FlowsAPI {
  constructor(private baseURL: string, private apiKey?: string) {
    // Configure OpenAPI base URL and headers
    OpenAPI.BASE = baseURL.replace(/\/$/, "");
    if (apiKey) {
      OpenAPI.HEADERS = {
        "X-API-Key": apiKey,
      };
    }
  }

  async list(): Promise<FlowListResponse> {
    return FlowsService.listFlowsApiFlowsGet();
  }

  async get(flowId: string): Promise<FlowResponse> {
    return FlowsService.getFlowApiFlowsFlowIdGet(flowId);
  }

  async create(request: FlowCreateRequest): Promise<FlowResponse> {
    return FlowsService.createFlowApiFlowsPost(request);
  }

  async delete(flowId: string): Promise<void> {
    return FlowsService.deleteFlowApiFlowsFlowIdDelete(flowId);
  }

  async export(flowId: string, format: "yaml" | "json" = "yaml"): Promise<string> {
    const response = await FlowsService.exportFlowDslApiFlowsFlowIdDslGet(flowId, format);
    return typeof response === "string" ? response : (response as any).dsl || "";
  }

  async getRoutines(flowId: string): Promise<Record<string, any>> {
    const flow = await this.get(flowId);
    return flow.routines || {};
  }

  async getConnections(flowId: string): Promise<any[]> {
    const flow = await this.get(flowId);
    return flow.connections || [];
  }

  async validate(flowId: string): Promise<{ valid: boolean; issues: string[] }> {
    return FlowsService.validateFlowApiFlowsFlowIdValidatePost(flowId) as Promise<{
      valid: boolean;
      issues: string[];
    }>;
  }

  async addRoutine(
    flowId: string,
    routineId: string,
    classPath: string,
    config?: Record<string, any>
  ): Promise<{ routine_id: string; status: string }> {
    return FlowsService.addRoutineToFlowApiFlowsFlowIdRoutinesPost(
      flowId,
      routineId,
      classPath,
      config || null
    ) as Promise<{ routine_id: string; status: string }>;
  }

  async removeRoutine(flowId: string, routineId: string): Promise<void> {
    return FlowsService.removeRoutineFromFlowApiFlowsFlowIdRoutinesRoutineIdDelete(
      flowId,
      routineId
    );
  }

  async addConnection(
    flowId: string,
    sourceRoutine: string,
    sourceEvent: string,
    targetRoutine: string,
    targetSlot: string,
    paramMapping?: Record<string, string>
  ): Promise<{ status: string }> {
    return FlowsService.addConnectionToFlowApiFlowsFlowIdConnectionsPost(
      flowId,
      sourceRoutine,
      sourceEvent,
      targetRoutine,
      targetSlot,
      paramMapping || null
    ) as Promise<{ status: string }>;
  }

  async removeConnection(flowId: string, connectionIndex: number): Promise<void> {
    return FlowsService.removeConnectionFromFlowApiFlowsFlowIdConnectionsConnectionIndexDelete(
      flowId,
      connectionIndex
    );
  }

  async getMetrics(flowId: string): Promise<any> {
    return MonitorService.getFlowMetricsApiFlowsFlowIdMetricsGet(flowId);
  }

  // Discovery methods
  async discoverFlows(): Promise<FlowListResponse> {
    return DiscoveryService.discoverFlowsApiDiscoveryFlowsGet();
  }

  async syncFlows(): Promise<FlowListResponse> {
    return DiscoveryService.syncFlowsApiDiscoveryFlowsSyncPost();
  }

  // Note: Flow cleanup endpoint may not exist in the API
  // async cleanup(maxAgeHours: number = 24, status?: string[]): Promise<{ removed: number }> {
  //   return FlowsService.cleanupFlowsApiFlowsCleanupPost(maxAgeHours, status || null) as Promise<{
  //     removed: number;
  //   }>;
  // }
}
