import { OpenAPI } from "./generated";

// Re-export OpenAPI for testing
export { OpenAPI };
import type { 
  FlowCreateRequest, 
  JobStartRequest, 
  BreakpointCreateRequest, 
  ExpressionEvalRequest, 
  VariableSetRequest,
  AddRoutineRequest,
  AddConnectionRequest,
  PostToJobRequest,
} from "./generated";
import { FlowsService } from "./generated/services/FlowsService";
import { JobsService } from "./generated/services/JobsService";
import { MonitorService } from "./generated/services/MonitorService";
import { DebugService } from "./generated/services/DebugService";
import { BreakpointsService } from "./generated/services/BreakpointsService";
import { DiscoveryService } from "./generated/services/DiscoveryService";
import { DefaultService } from "./generated/services/DefaultService";

/**
 * Create and configure a Routilux API client
 */
export function createAPI(baseURL: string, apiKey?: string) {
  // Configure OpenAPI base URL and headers
  OpenAPI.BASE = baseURL.replace(/\/$/, "");
  if (apiKey) {
    OpenAPI.HEADERS = {
      "X-API-Key": apiKey,
    };
  } else {
    OpenAPI.HEADERS = undefined;
  }

  // Create a wrapper interface that directly uses static service methods
  return {
    // Flows API
    flows: {
      list: async () => {
        return await FlowsService.listFlowsApiFlowsGet();
      },
      get: async (flowId: string) => {
        return await FlowsService.getFlowApiFlowsFlowIdGet(flowId);
      },
      create: async (request: FlowCreateRequest) => {
        return await FlowsService.createFlowApiFlowsPost(request);
      },
      delete: async (flowId: string) => {
        await FlowsService.deleteFlowApiFlowsFlowIdDelete(flowId);
      },
      exportDSL: async (flowId: string, format: string = "yaml") => {
        return await FlowsService.exportFlowDslApiFlowsFlowIdDslGet(flowId, format);
      },
      validate: async (flowId: string) => {
        return await FlowsService.validateFlowApiFlowsFlowIdValidatePost(flowId);
      },
      getRoutines: async (flowId: string) => {
        return await FlowsService.listFlowRoutinesApiFlowsFlowIdRoutinesGet(flowId);
      },
      getConnections: async (flowId: string) => {
        return await FlowsService.listFlowConnectionsApiFlowsFlowIdConnectionsGet(flowId);
      },
      addRoutine: async (flowId: string, request: AddRoutineRequest) => {
        return await FlowsService.addRoutineToFlowApiFlowsFlowIdRoutinesPost(flowId, request);
      },
      removeRoutine: async (flowId: string, routineId: string) => {
        await FlowsService.removeRoutineFromFlowApiFlowsFlowIdRoutinesRoutineIdDelete(flowId, routineId);
      },
      addConnection: async (flowId: string, request: AddConnectionRequest) => {
        return await FlowsService.addConnectionToFlowApiFlowsFlowIdConnectionsPost(flowId, request);
      },
      removeConnection: async (flowId: string, connectionIndex: number) => {
        await FlowsService.removeConnectionFromFlowApiFlowsFlowIdConnectionsConnectionIndexDelete(flowId, connectionIndex);
      },
    },

    // Jobs API
    jobs: {
      list: async (flowId?: string | null, status?: string | null, limit: number = 100, offset?: number) => {
        return await JobsService.listJobsApiJobsGet(flowId || null, status || null, limit, offset);
      },
      get: async (jobId: string) => {
        return await JobsService.getJobApiJobsJobIdGet(jobId);
      },
      start: async (request: JobStartRequest) => {
        return await JobsService.startJobApiJobsPost(request);
      },
      pause: async (jobId: string) => {
        return await JobsService.pauseJobApiJobsJobIdPausePost(jobId);
      },
      resume: async (jobId: string) => {
        return await JobsService.resumeJobApiJobsJobIdResumePost(jobId);
      },
      cancel: async (jobId: string) => {
        return await JobsService.cancelJobApiJobsJobIdCancelPost(jobId);
      },
      getStatus: async (jobId: string) => {
        return await JobsService.getJobStatusApiJobsJobIdStatusGet(jobId);
      },
      getState: async (jobId: string) => {
        return await JobsService.getJobStateApiJobsJobIdStateGet(jobId);
      },
      post: async (jobId: string, request: PostToJobRequest) => {
        return await JobsService.postToJobApiJobsJobIdPostPost(jobId, request);
      },
      cleanup: async (maxAgeHours: number = 24, statuses?: string[]) => {
        return await JobsService.cleanupJobsApiJobsCleanupPost(maxAgeHours, statuses || null);
      },
    },

    // Monitor API
    monitor: {
      getJobMetrics: async (jobId: string) => {
        return await MonitorService.getJobMetricsApiJobsJobIdMetricsGet(jobId);
      },
      getJobTrace: async (jobId: string, limit?: number | null) => {
        return await MonitorService.getJobTraceApiJobsJobIdTraceGet(jobId, limit || null);
      },
      getJobLogs: async (jobId: string) => {
        return await MonitorService.getJobLogsApiJobsJobIdLogsGet(jobId);
      },
      getFlowMetrics: async (flowId: string) => {
        return await MonitorService.getFlowMetricsApiFlowsFlowIdMetricsGet(flowId);
      },
      getRoutineQueueStatus: async (jobId: string, routineId: string) => {
        return await MonitorService.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
      },
      getJobQueuesStatus: async (jobId: string) => {
        return await MonitorService.getJobQueuesStatusApiJobsJobIdQueuesStatusGet(jobId);
      },
      getRoutineInfo: async (flowId: string, routineId: string) => {
        return await MonitorService.getRoutineInfoApiFlowsFlowIdRoutinesRoutineIdInfoGet(flowId, routineId);
      },
      getRoutinesStatus: async (jobId: string) => {
        return await MonitorService.getRoutinesStatusApiJobsJobIdRoutinesStatusGet(jobId);
      },
      getJobMonitoringData: async (jobId: string) => {
        return await MonitorService.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
      },
    },

    // Debug API
    debug: {
      getSession: async (jobId: string) => {
        return await DebugService.getDebugSessionApiJobsJobIdDebugSessionGet(jobId);
      },
      resume: async (jobId: string) => {
        return await DebugService.resumeDebugApiJobsJobIdDebugResumePost(jobId);
      },
      stepOver: async (jobId: string) => {
        return await DebugService.stepOverApiJobsJobIdDebugStepOverPost(jobId);
      },
      stepInto: async (jobId: string) => {
        return await DebugService.stepIntoApiJobsJobIdDebugStepIntoPost(jobId);
      },
      getVariables: async (jobId: string, routineId?: string) => {
        return await DebugService.getVariablesApiJobsJobIdDebugVariablesGet(jobId, routineId);
      },
      setVariable: async (jobId: string, name: string, value: any) => {
        const request: VariableSetRequest = { value };
        return await DebugService.setVariableApiJobsJobIdDebugVariablesNamePut(jobId, name, request);
      },
      getCallStack: async (jobId: string) => {
        return await DebugService.getCallStackApiJobsJobIdDebugCallStackGet(jobId);
      },
      evaluateExpression: async (jobId: string, request: ExpressionEvalRequest) => {
        return await DebugService.evaluateExpressionApiJobsJobIdDebugEvaluatePost(jobId, request);
      },
    },

    // Breakpoints API
    breakpoints: {
      list: async (jobId: string) => {
        return await BreakpointsService.listBreakpointsApiJobsJobIdBreakpointsGet(jobId);
      },
      create: async (jobId: string, request: BreakpointCreateRequest) => {
        return await BreakpointsService.createBreakpointApiJobsJobIdBreakpointsPost(jobId, request);
      },
      update: async (jobId: string, breakpointId: string, enabled: boolean) => {
        return await BreakpointsService.updateBreakpointApiJobsJobIdBreakpointsBreakpointIdPut(jobId, breakpointId, { enabled });
      },
      delete: async (jobId: string, breakpointId: string) => {
        await BreakpointsService.deleteBreakpointApiJobsJobIdBreakpointsBreakpointIdDelete(jobId, breakpointId);
      },
    },

    // Discovery API
    discovery: {
      syncFlows: async () => {
        return await DiscoveryService.syncFlowsApiDiscoveryFlowsSyncPost();
      },
      discoverFlows: async () => {
        return await DiscoveryService.discoverFlowsApiDiscoveryFlowsGet();
      },
      syncJobs: async () => {
        return await DiscoveryService.syncJobsApiDiscoveryJobsSyncPost();
      },
      discoverJobs: async () => {
        return await DiscoveryService.discoverJobsApiDiscoveryJobsGet();
      },
    },

    // Health check
    health: async () => {
      return await DefaultService.healthApiHealthGet();
    },

    // Client methods
    testConnection: async (): Promise<boolean> => {
      try {
        const response = await DefaultService.healthApiHealthGet();
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
