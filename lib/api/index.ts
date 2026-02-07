import { OpenAPI } from "./generated";

// Re-export OpenAPI for testing
export { OpenAPI };
import type {
  FlowCreateRequest,
  JobSubmitRequest,
  WorkerCreateRequest,
  ExecuteRequest,
  BreakpointCreateRequest,
  BreakpointUpdateRequest,
  AddRoutineRequest,
  AddConnectionRequest,
} from "./generated";
import { FlowsService } from "./generated/services/FlowsService";
import { JobsService } from "./generated/services/JobsService";
import { BreakpointsService } from "./generated/services/BreakpointsService";
import { DiscoveryService } from "./generated/services/DiscoveryService";
import { HealthService } from "./generated/services/HealthService";
import { FactoryService } from "./generated/services/FactoryService";
import { RuntimesService } from "./generated/services/RuntimesService";
import { WorkersService } from "./generated/services/WorkersService";
import { ExecuteService } from "./generated/services/ExecuteService";
import { ApiClientError, normalizeApiError } from "@/lib/api/error";

/**
 * Create and configure a Routilux API client
 */
function readApiKeyFromStorage(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("overseer-connection-storage");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { state?: { apiKey?: string | null } };
    const key = parsed?.state?.apiKey;
    return key || undefined;
  } catch {
    return undefined;
  }
}

export function createAPI(baseURL: string, apiKey?: string) {
  // Configure OpenAPI base URL and headers
  OpenAPI.BASE = baseURL.replace(/\/$/, "");
  const resolvedApiKey = apiKey ?? readApiKeyFromStorage();
  if (resolvedApiKey) {
    OpenAPI.HEADERS = {
      "X-API-Key": resolvedApiKey,
    };
  } else {
    OpenAPI.HEADERS = undefined;
  }

  const wrapApi = <T extends Record<string, unknown>>(api: T): T => {
    const wrapped: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(api)) {
      if (typeof value === "function") {
        wrapped[key] = async (...args: unknown[]) => {
          try {
            return await (value as (...args: unknown[]) => Promise<unknown>)(...args);
          } catch (error) {
            const fallback = error instanceof Error ? error.message : String(error);
            const normalized = normalizeApiError(error, fallback);
            throw new ApiClientError(normalized.message, {
              status: normalized.status,
              code: normalized.code,
              details: normalized.details,
              raw: normalized.raw,
            });
          }
        };
      } else if (value && typeof value === "object") {
        wrapped[key] = wrapApi(value as Record<string, unknown>);
      } else {
        wrapped[key] = value;
      }
    }
    return wrapped as T;
  };

  // Create a wrapper interface that directly uses static service methods
  const api = {
    // Flows API
    flows: {
      list: async () => {
        return await FlowsService.listFlowsApiV1FlowsGet();
      },
      get: async (flowId: string) => {
        return await FlowsService.getFlowApiV1FlowsFlowIdGet(flowId);
      },
      create: async (request: FlowCreateRequest) => {
        return await FlowsService.createFlowApiV1FlowsPost(request);
      },
      delete: async (flowId: string) => {
        await FlowsService.deleteFlowApiV1FlowsFlowIdDelete(flowId);
      },
      getMetrics: async (flowId: string) => {
        return await FlowsService.getFlowMetricsApiV1FlowsFlowIdMetricsGet(flowId);
      },
      exportDSL: async (flowId: string, format: string = "yaml") => {
        return await FlowsService.exportFlowDslApiV1FlowsFlowIdDslGet(flowId, format);
      },
      validate: async (flowId: string) => {
        return await FlowsService.validateFlowApiV1FlowsFlowIdValidatePost(flowId);
      },
      getRoutineInfo: async (flowId: string, routineId: string) => {
        return await FlowsService.getRoutineInfoApiV1FlowsFlowIdRoutinesRoutineIdInfoGet(flowId, routineId);
      },
      getRoutines: async (flowId: string) => {
        return await FlowsService.listFlowRoutinesApiV1FlowsFlowIdRoutinesGet(flowId);
      },
      getConnections: async (flowId: string) => {
        return await FlowsService.listFlowConnectionsApiV1FlowsFlowIdConnectionsGet(flowId);
      },
      addRoutine: async (flowId: string, request: AddRoutineRequest) => {
        return await FlowsService.addRoutineToFlowApiV1FlowsFlowIdRoutinesPost(flowId, request);
      },
      removeRoutine: async (flowId: string, routineId: string) => {
        await FlowsService.removeRoutineFromFlowApiV1FlowsFlowIdRoutinesRoutineIdDelete(flowId, routineId);
      },
      addConnection: async (flowId: string, request: AddConnectionRequest) => {
        return await FlowsService.addConnectionToFlowApiV1FlowsFlowIdConnectionsPost(flowId, request);
      },
      removeConnection: async (flowId: string, connectionIndex: number) => {
        await FlowsService.removeConnectionFromFlowApiV1FlowsFlowIdConnectionsConnectionIndexDelete(flowId, connectionIndex);
      },
    },

    // Jobs API
    jobs: {
      // Core operations
      list: async (workerId?: string | null, flowId?: string | null, status?: string | null, limit: number = 100, offset?: number) => {
        return await JobsService.listJobsApiV1JobsGet(workerId || null, flowId || null, status || null, limit, offset);
      },
      get: async (jobId: string) => {
        return await JobsService.getJobApiV1JobsJobIdGet(jobId);
      },
      submit: async (request: JobSubmitRequest) => {
        return await JobsService.submitJobApiV1JobsPost(request);
      },
      complete: async (jobId: string) => {
        return await JobsService.completeJobApiV1JobsJobIdCompletePost(jobId);
      },
      fail: async (jobId: string, error: string) => {
        return await JobsService.failJobApiV1JobsJobIdFailPost(jobId, { error });
      },
      wait: async (jobId: string, timeout: number = 60) => {
        return await JobsService.waitForJobApiV1JobsJobIdWaitPost(jobId, timeout);
      },
      getOutput: async (jobId: string, incremental: boolean = false) => {
        return await JobsService.getJobOutputApiV1JobsJobIdOutputGet(jobId, incremental);
      },
      getStatus: async (jobId: string) => {
        return await JobsService.getJobStatusApiV1JobsJobIdStatusGet(jobId);
      },
      getTrace: async (jobId: string) => {
        return await JobsService.getJobTraceApiV1JobsJobIdTraceGet(jobId);
      },
      
      // Monitoring functions (migrated from MonitorService)
      getMetrics: async (jobId: string) => {
        return await JobsService.getJobMetricsApiV1JobsJobIdMetricsGet(jobId);
      },
      getExecutionTrace: async (jobId: string, limit?: number) => {
        return await JobsService.getJobExecutionTraceApiV1JobsJobIdExecutionTraceGet(jobId, limit || null);
      },
      getLogs: async (jobId: string) => {
        return await JobsService.getJobLogsApiV1JobsJobIdLogsGet(jobId);
      },
      getData: async (jobId: string) => {
        return await JobsService.getJobDataApiV1JobsJobIdDataGet(jobId);
      },
      getMonitoringData: async (jobId: string) => {
        return await JobsService.getJobMonitoringDataApiV1JobsJobIdMonitoringGet(jobId);
      },
      getRoutinesStatus: async (jobId: string) => {
        return await JobsService.getRoutinesStatusApiV1JobsJobIdRoutinesStatusGet(jobId);
      },
      getRoutineQueueStatus: async (jobId: string, routineId: string) => {
        return await JobsService.getRoutineQueueStatusApiV1JobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
      },
      getQueuesStatus: async (jobId: string) => {
        return await JobsService.getJobQueuesStatusApiV1JobsJobIdQueuesStatusGet(jobId);
      },
    },

    // Workers API
    workers: {
      // Core operations
      create: async (request: WorkerCreateRequest) => {
        return await WorkersService.createWorkerApiV1WorkersPost(request);
      },
      list: async (flowId?: string | null, status?: string | null, limit: number = 100, offset?: number) => {
        return await WorkersService.listWorkersApiV1WorkersGet(flowId || null, status || null, limit, offset);
      },
      get: async (workerId: string) => {
        return await WorkersService.getWorkerApiV1WorkersWorkerIdGet(workerId);
      },
      stop: async (workerId: string) => {
        await WorkersService.stopWorkerApiV1WorkersWorkerIdDelete(workerId);
      },
      pause: async (workerId: string) => {
        return await WorkersService.pauseWorkerApiV1WorkersWorkerIdPausePost(workerId);
      },
      resume: async (workerId: string) => {
        return await WorkersService.resumeWorkerApiV1WorkersWorkerIdResumePost(workerId);
      },
      listJobs: async (workerId: string, status?: string | null, limit: number = 100, offset?: number) => {
        return await WorkersService.listWorkerJobsApiV1WorkersWorkerIdJobsGet(workerId, status || null, limit, offset);
      },
      
      // Enhanced features
      getStatistics: async (workerId: string) => {
        return await WorkersService.getWorkerStatisticsApiV1WorkersWorkerIdStatisticsGet(workerId);
      },
      getHistory: async (workerId: string, routineId?: string, limit: number = 100, offset?: number) => {
        return await WorkersService.getWorkerHistoryApiV1WorkersWorkerIdHistoryGet(workerId, routineId || null, limit, offset);
      },
      getRoutineStates: async (workerId: string) => {
        return await WorkersService.getWorkerRoutineStatesApiV1WorkersWorkerIdRoutinesStatesGet(workerId);
      },
      updateBreakpoint: async (workerId: string, breakpointId: string, enabled: boolean) => {
        const request: BreakpointUpdateRequest = { enabled };
        return await WorkersService.updateBreakpointEnabledApiV1WorkersWorkerIdBreakpointsBreakpointIdPut(workerId, breakpointId, request);
      },
    },

    // Execute API
    execute: {
      flow: async (request: ExecuteRequest) => {
        return await ExecuteService.executeFlowApiV1ExecutePost(request);
      },
    },


    // Breakpoints API
    breakpoints: {
      list: async (jobId: string) => {
        return await BreakpointsService.listBreakpointsApiV1JobsJobIdBreakpointsGet(jobId);
      },
      create: async (jobId: string, request: BreakpointCreateRequest) => {
        return await BreakpointsService.createBreakpointApiV1JobsJobIdBreakpointsPost(jobId, request);
      },
      delete: async (jobId: string, breakpointId: string) => {
        await BreakpointsService.deleteBreakpointApiV1JobsJobIdBreakpointsBreakpointIdDelete(jobId, breakpointId);
      },
      // Note: update (enable/disable) is now in workers.updateBreakpoint
    },

    // Discovery API
    discovery: {
      syncFlows: async () => {
        return await DiscoveryService.syncFlowsApiV1DiscoveryFlowsSyncPost();
      },
      discoverFlows: async () => {
        return await DiscoveryService.discoverFlowsApiV1DiscoveryFlowsGet();
      },
      syncJobs: async () => {
        return await DiscoveryService.syncJobsApiV1DiscoveryJobsSyncPost();
      },
      discoverJobs: async () => {
        return await DiscoveryService.discoverJobsApiV1DiscoveryJobsGet();
      },
      syncWorkers: async () => {
        return await DiscoveryService.syncWorkersApiV1DiscoveryWorkersSyncPost();
      },
    },

    // Factory/Objects API
    factory: {
      listObjects: async (filters?: { category?: string | null; objectType?: string | null }) => {
        return await FactoryService.listFactoryObjectsApiV1FactoryObjectsGet(
          filters?.category ?? null,
          filters?.objectType ?? null
        );
      },
      getObjectMetadata: async (name: string) => {
        return await FactoryService.getFactoryObjectMetadataApiV1FactoryObjectsNameGet(name);
      },
      getObjectInterface: async (name: string) => {
        return await FactoryService.getFactoryObjectInterfaceApiV1FactoryObjectsNameInterfaceGet(name);
      },
    },

    // Runtimes API
    runtimes: {
      list: async () => {
        return await RuntimesService.listRuntimesApiV1RuntimesGet();
      },
      get: async (runtimeId: string) => {
        return await RuntimesService.getRuntimeApiV1RuntimesRuntimeIdGet(runtimeId);
      },
      create: async (request: { runtime_id: string; thread_pool_size?: number; is_default?: boolean }) => {
        return await RuntimesService.createRuntimeApiV1RuntimesPost(request);
      },
    },

    // Health check
    health: {
      liveness: async () => {
        return await HealthService.livenessApiV1HealthLiveGet();
      },
      readiness: async () => {
        return await HealthService.readinessApiV1HealthReadyGet();
      },
      stats: async () => {
        return await HealthService.healthStatsApiV1HealthStatsGet();
      },
    },
  };

  const wrapped = wrapApi(api);

  return {
    ...wrapped,
    // Client methods
    testConnection: async (): Promise<boolean> => {
      try {
        const response = await HealthService.readinessApiV1HealthReadyGet();
        return response !== undefined && response !== null;
      } catch {
        return false;
      }
    },

    setApiKey: (key: string | null) => {
      if (key) {
        OpenAPI.HEADERS = {
          "X-API-Key": key,
        };
      } else {
        OpenAPI.HEADERS = undefined;
      }
    },
  };
}

export type API = ReturnType<typeof createAPI>;

// Re-export all generated types
export type * from "./generated";
