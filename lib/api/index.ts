import { RoutiluxAPI, OpenAPI } from "./generated";

// Re-export OpenAPI for testing
export { OpenAPI };
import type { JobMonitoringData, RoutineMonitoringData, SlotQueueStatus, RoutineInfo, RoutineExecutionStatus, FlowCreateRequest, JobStartRequest, BreakpointCreateRequest, ExpressionEvalRequest, VariableSetRequest } from "./generated";
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

  // Create the main API instance
  const api = new RoutiluxAPI();

  // Create a wrapper interface that maintains backward compatibility
  return {
    // Direct access to services (new structure)
    raw: api,

    // Flows API (backward compatible)
    flows: {
      listFlows: async () => {
        return await FlowsService.listFlowsApiFlowsGet();
      },
      getFlow: async (flowId: string) => {
        return await FlowsService.getFlowApiFlowsFlowIdGet(flowId);
      },
      createFlow: async (request: FlowCreateRequest) => {
        return await FlowsService.createFlowApiFlowsPost(request);
      },
      deleteFlow: async (flowId: string) => {
        await FlowsService.deleteFlowApiFlowsFlowIdDelete(flowId);
      },
      // Get flow metrics
      getFlowMetrics: async (flowId: string) => {
        try {
          return await MonitorService.getFlowMetricsApiFlowsFlowIdMetricsGet(flowId);
        } catch {
          return null;
        }
      },
      // Export flow DSL
      exportFlowDSL: async (flowId: string, format: string = "yaml") => {
        return await FlowsService.exportFlowDslApiFlowsFlowIdDslGet(flowId, format);
      },
      // Get flow routines
      getFlowRoutines: async (flowId: string) => {
        return await FlowsService.listFlowRoutinesApiFlowsFlowIdRoutinesGet(flowId);
      },
      // Get flow connections
      getFlowConnections: async (flowId: string) => {
        return await FlowsService.listFlowConnectionsApiFlowsFlowIdConnectionsGet(flowId);
      },
      // Validate flow
      validateFlow: async (flowId: string) => {
        return await FlowsService.validateFlowApiFlowsFlowIdValidatePost(flowId);
      },
      // Get routine info
      getRoutineInfo: async (flowId: string, routineId: string): Promise<RoutineInfo> => {
        return await MonitorService.getRoutineInfoApiFlowsFlowIdRoutinesRoutineIdInfoGet(flowId, routineId);
      },
      // Add routine to flow
      addRoutine: async (flowId: string, routineId: string, classPath: string, config?: Record<string, any>) => {
        return await FlowsService.addRoutineToFlowApiFlowsFlowIdRoutinesPost(flowId, routineId, classPath, config || null);
      },
      // Remove routine from flow
      removeRoutine: async (flowId: string, routineId: string) => {
        await FlowsService.removeRoutineFromFlowApiFlowsFlowIdRoutinesRoutineIdDelete(flowId, routineId);
      },
      // Add connection to flow
      addConnection: async (flowId: string, sourceRoutine: string, sourceEvent: string, targetRoutine: string, targetSlot: string, paramMapping?: Record<string, string>) => {
        return await FlowsService.addConnectionToFlowApiFlowsFlowIdConnectionsPost(flowId, sourceRoutine, sourceEvent, targetRoutine, targetSlot, paramMapping || null);
      },
      // Remove connection from flow
      removeConnection: async (flowId: string, connectionIndex: number) => {
        await FlowsService.removeConnectionFromFlowApiFlowsFlowIdConnectionsConnectionIndexDelete(flowId, connectionIndex);
      },
    },

    // Jobs API (backward compatible)
    jobs: {
      list: async (params?: { flowId?: string | null; status?: string | null; limit?: number; offset?: number }) => {
        return await JobsService.listJobsApiJobsGet(
          params?.flowId || null,
          params?.status || null,
          params?.limit || 100,
          params?.offset
        );
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
      // Cleanup jobs
      cleanup: async (maxAgeHours: number = 24, statuses?: string[]) => {
        return await JobsService.cleanupJobsApiJobsCleanupPost(maxAgeHours, statuses || null);
      },
      // Get monitoring data
      getJobMonitoringData: async (jobId: string): Promise<JobMonitoringData> => {
        return await MonitorService.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
      },
      // Get routine monitoring data
      getRoutineMonitoringData: async (jobId: string, routineId: string): Promise<RoutineMonitoringData> => {
        const jobData = await MonitorService.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
        if (jobData && jobData.routines && jobData.routines[routineId]) {
          return jobData.routines[routineId];
        }
        // Fallback: Get routines status and queue status
        const status = await MonitorService.getRoutinesStatusApiJobsJobIdRoutinesStatusGet(jobId);
        const queueStatus = await MonitorService.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
        return {
          routine_id: routineId,
          execution_status: status[routineId] || null,
          queue_status: queueStatus || [],
          info: null,
        } as RoutineMonitoringData;
      },
      // Get routine queue status
      getRoutineQueueStatus: async (jobId: string, routineId: string): Promise<Array<SlotQueueStatus>> => {
        return await MonitorService.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
      },
      // Get all queues status
      getQueuesStatus: async (jobId: string) => {
        return await MonitorService.getJobQueuesStatusApiJobsJobIdQueuesStatusGet(jobId);
      },
      // Get routines status
      getRoutinesStatus: async (jobId: string) => {
        return await MonitorService.getRoutinesStatusApiJobsJobIdRoutinesStatusGet(jobId);
      },
      getMetrics: async (jobId: string) => {
        return await MonitorService.getJobMetricsApiJobsJobIdMetricsGet(jobId);
      },
      getTrace: async (jobId: string, limit?: number) => {
        return await MonitorService.getJobTraceApiJobsJobIdTraceGet(jobId, limit || null);
      },
      getLogs: async (jobId: string) => {
        return await MonitorService.getJobLogsApiJobsJobIdLogsGet(jobId);
      },
    },

    // Debug API (backward compatible)
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

    // Breakpoints API (backward compatible)
    breakpoints: {
      list: async (jobId: string) => {
        return await BreakpointsService.listBreakpointsApiJobsJobIdBreakpointsGet(jobId);
      },
      create: async (jobId: string, request: BreakpointCreateRequest) => {
        return await BreakpointsService.createBreakpointApiJobsJobIdBreakpointsPost(jobId, request);
      },
      update: async (jobId: string, breakpointId: string, enabled: boolean) => {
        return await BreakpointsService.updateBreakpointApiJobsJobIdBreakpointsBreakpointIdPut(jobId, breakpointId, enabled);
      },
      delete: async (jobId: string, breakpointId: string) => {
        await BreakpointsService.deleteBreakpointApiJobsJobIdBreakpointsBreakpointIdDelete(jobId, breakpointId);
      },
    },

    // Monitor API
    monitor: {
      getJobMonitoringData: async (jobId: string): Promise<JobMonitoringData> => {
        return await MonitorService.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
      },
      getJobMetrics: async (jobId: string) => {
        return await MonitorService.getJobMetricsApiJobsJobIdMetricsGet(jobId);
      },
      getJobTrace: async (jobId: string, limit?: number) => {
        return await MonitorService.getJobTraceApiJobsJobIdTraceGet(jobId, limit || null);
      },
      getJobLogs: async (jobId: string) => {
        return await MonitorService.getJobLogsApiJobsJobIdLogsGet(jobId);
      },
      getFlowMetrics: async (flowId: string) => {
        return await MonitorService.getFlowMetricsApiFlowsFlowIdMetricsGet(flowId);
      },
      getRoutineQueueStatus: async (jobId: string, routineId: string): Promise<Array<SlotQueueStatus>> => {
        return await MonitorService.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
      },
      getJobQueuesStatus: async (jobId: string) => {
        return await MonitorService.getJobQueuesStatusApiJobsJobIdQueuesStatusGet(jobId);
      },
      getRoutineInfo: async (flowId: string, routineId: string): Promise<RoutineInfo> => {
        return await MonitorService.getRoutineInfoApiFlowsFlowIdRoutinesRoutineIdInfoGet(flowId, routineId);
      },
      getRoutinesStatus: async (jobId: string) => {
        return await MonitorService.getRoutinesStatusApiJobsJobIdRoutinesStatusGet(jobId);
      },
    },

    // Discovery API (new!)
    discovery: {
      syncFlows: async () => {
        try {
          return await DiscoveryService.syncFlowsApiDiscoveryFlowsSyncPost();
        } catch {
          return null;
        }
      },
      discoverFlows: async () => {
        try {
          return await DiscoveryService.discoverFlowsApiDiscoveryFlowsGet();
        } catch {
          return null;
        }
      },
      syncJobs: async () => {
        try {
          return await DiscoveryService.syncJobsApiDiscoveryJobsSyncPost();
        } catch {
          return null;
        }
      },
      discoverJobs: async () => {
        try {
          return await DiscoveryService.discoverJobsApiDiscoveryJobsGet();
        } catch {
          return null;
        }
      },
    },

    // Health check
    health: async () => {
      try {
        return await DefaultService.healthApiHealthGet();
      } catch {
        return null;
      }
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
