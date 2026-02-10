/**
 * API Helper for E2E Testing
 *
 * Provides a simplified interface for interacting with the routilux HTTP API.
 */

export interface RoutluxAPIConfig {
  baseURL: string;
  apiKey?: string;
}

export interface FlowCreateRequest {
  flow_id?: string;
  dsl?: string;
  dsl_dict?: Record<string, unknown>;
}

export interface RoutineInfo {
  routine_id: string;
  factory_name: string;
  config?: Record<string, unknown>;
}

export interface ConnectionInfo {
  from: string;
  to: string;
}

/**
 * Simple API client for routilux server.
 */
export class RoutluxAPI {
  private readonly baseURL: string;
  private readonly apiKey?: string;

  constructor(config: RoutluxAPIConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      h['X-API-Key'] = this.apiKey;
    }

    return h;
  }

  private async request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options?.headers },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // Health checks
  async healthLive(): Promise<{ status: string }> {
    return this.request('/api/v1/health/live');
  }

  async healthReady(): Promise<{ status: string }> {
    return this.request('/api/v1/health/ready');
  }

  // Flows
  async listFlows(): Promise<{ flows: unknown[]; total: number }> {
    return this.request('/api/v1/flows');
  }

  async getFlow(flowId: string): Promise<unknown> {
    return this.request(`/api/v1/flows/${flowId}`);
  }

  async createFlow(request: FlowCreateRequest): Promise<unknown> {
    return this.request('/api/v1/flows', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async deleteFlow(flowId: string): Promise<void> {
    return this.request(`/api/v1/flows/${flowId}`, {
      method: 'DELETE',
    });
  }

  async getFlowDSL(flowId: string, format: 'yaml' | 'json' = 'yaml'): Promise<{ format: string; dsl: string }> {
    return this.request(`/api/v1/flows/${flowId}/dsl?format=${format}`);
  }

  async validateFlow(flowId: string): Promise<{ valid: boolean; issues: string[] }> {
    return this.request(`/api/v1/flows/${flowId}/validate`, {
      method: 'POST',
    });
  }

  // Routines
  async listFlowRoutines(flowId: string): Promise<Record<string, RoutineInfo>> {
    return this.request(`/api/v1/flows/${flowId}/routines`);
  }

  async addRoutine(flowId: string, routine: RoutineInfo): Promise<{ routine_id: string; status: string }> {
    return this.request(`/api/v1/flows/${flowId}/routines`, {
      method: 'POST',
      body: JSON.stringify(routine),
    });
  }

  async removeRoutine(flowId: string, routineId: string): Promise<void> {
    return this.request(`/api/v1/flows/${flowId}/routines/${routineId}`, {
      method: 'DELETE',
    });
  }

  // Connections
  async listConnections(flowId: string): Promise<ConnectionInfo[]> {
    return this.request(`/api/v1/flows/${flowId}/connections`);
  }

  async addConnection(flowId: string, connection: ConnectionInfo): Promise<{ status: string }> {
    return this.request(`/api/v1/flows/${flowId}/connections`, {
      method: 'POST',
      body: JSON.stringify(connection),
    });
  }

  // Jobs
  async listJobs(): Promise<unknown[]> {
    return this.request('/api/v1/jobs');
  }

  async getJob(jobId: string): Promise<unknown> {
    return this.request(`/api/v1/jobs/${jobId}`);
  }

  async executeFlow(flowId: string, config?: Record<string, unknown>): Promise<unknown> {
    return this.request('/api/v1/execute/flow', {
      method: 'POST',
      body: JSON.stringify({ flow_id: flowId, config }),
    });
  }

  async pauseJob(jobId: string): Promise<void> {
    return this.request(`/api/v1/jobs/${jobId}/pause`, {
      method: 'POST',
    });
  }

  async resumeJob(jobId: string): Promise<void> {
    return this.request(`/api/v1/jobs/${jobId}/resume`, {
      method: 'POST',
    });
  }

  async cancelJob(jobId: string): Promise<void> {
    return this.request(`/api/v1/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  }

  // Workers
  async listWorkers(): Promise<unknown[]> {
    return this.request('/api/v1/workers');
  }

  async startWorker(flowId: string, config?: Record<string, unknown>): Promise<unknown> {
    return this.request('/api/v1/workers', {
      method: 'POST',
      body: JSON.stringify({ flow_id: flowId, config }),
    });
  }

  async stopWorker(workerId: string): Promise<void> {
    return this.request(`/api/v1/workers/${workerId}`, {
      method: 'DELETE',
    });
  }

  // Factory (Discovery)
  async listFactoryObjects(): Promise<unknown[]> {
    return this.request('/api/v1/factory/objects');
  }

  async getFactoryObject(name: string): Promise<unknown> {
    return this.request(`/api/v1/factory/objects/${name}`);
  }

  async getFactoryObjectInterface(name: string): Promise<unknown> {
    return this.request(`/api/v1/factory/objects/${name}/interface`);
  }
}
