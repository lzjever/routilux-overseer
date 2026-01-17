import { RoutiluxAPI, OpenAPI } from "./generated";
import type { JobMonitoringData, RoutineMonitoringData, SlotQueueStatus, RoutineInfo, RoutineExecutionStatus } from "./generated";

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
    OpenAPI. HEADERS = undefined;
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
        return await api.flows.listFlowsApiFlowsGet();
      },
      getFlow: async (flowId: string) => {
        return await api.flows.getFlowApiFlowsFlowIdGet(flowId);
      },
      createFlow: async (request: any) => {
        return await api.flows.createFlowApiFlowsPost(request);
      },
      deleteFlow: async (flowId: string) => {
        await api.flows.deleteFlowApiFlowsFlowIdDelete(flowId);
      },
      // Get flow metrics
      getFlowMetrics: async (flowId: string) => {
        try {
          return await api.monitor.getFlowMetricsApiFlowsFlowIdMetricsGet(flowId);
        } catch {
          // Fallback if endpoint doesn't exist
          return null;
        }
      },
      // Export flow DSL
      exportFlowDSL: async (flowId: string, format: string = "yaml") => {
        return await api.flows.exportFlowDslApiFlowsFlowIdDslGet(flowId, format);
      },
      // Get flow routines
      getFlowRoutines: async (flowId: string) => {
        return await api.flows.listFlowRoutinesApiFlowsFlowIdRoutinesGet(flowId);
      },
      // Get flow connections
      getFlowConnections: async (flowId: string) => {
        return await api.flows.listFlowConnectionsApiFlowsFlowIdConnectionsGet(flowId);
      },
      // Validate flow
      validateFlow: async (flowId: string) => {
        return await api.flows.validateFlowApiFlowsFlowIdValidatePost(flowId);
      },
      // Get routine info
      getRoutineInfo: async (flowId: string, routineId: string): Promise<RoutineInfo> => {
        return await api.flows.getRoutineInfoApiFlowsFlowIdRoutinesRoutineIdInfoGet(flowId, routineId);
      },
      // Remove routine from flow
      removeRoutine: async (flowId: string, routineId: string) => {
        await api.flows.removeRoutineFromFlowApiFlowsFlowIdRoutinesRoutineIdDelete(flowId, routineId);
      },
      // Remove connection from flow
      removeConnection: async (flowId: string, connectionIndex: number) => {
        await api.flows.removeConnectionFromFlowApiFlowsFlowIdConnectionsConnectionIndexDelete(flowId, connectionIndex);
      },
    },

    // Jobs API (backward compatible)
    jobs: {
      list: async (params?: { flowId?: string | null; status?: string | null; limit?: number; offset?: number }) => {
        return await api.jobs.getJobs(
          params?.flowId || null,
          params?.status || null,
          params?.limit || 100,
          params?.offset
        );
      },
      get: async (jobId: string) => {
        return await api.jobs.getJobsJobIdGet(jobId);
      },
      start: async (request: any) => {
        return await api.jobs.postJobs(request);
      },
      pause: async (jobId: string) => {
        return await api.jobs.postJobsJobIdPausePost(jobId);
      },
      resume: async (jobId: string) => {
        return await api.jobs.postJobsJobIdResumePost(jobId);
      },
      cancel: async (jobId: string) => {
        return await api.jobs.deleteJobsJobIdCancelDelete(jobId);
      },
      getStatus: async (jobId: string) => {
        return await api.jobs.getJobsJobIdStatusGet(jobId);
      },
      getState: async (jobId: string) => {
        return await api.jobs.getJobsJobIdStateGet(jobId);
      },
      // Get monitoring data
      getJobMonitoringData: async (jobId: string): Promise<JobMonitoringData> => {
        return await api.monitor.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
      },
      // Get routine monitoring data - get full JobMonitoringData then extract routine data
      getRoutineMonitoringData: async (jobId: string, routineId: string): Promise<RoutineMonitoringData> => {
        const jobData = await api.monitor.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
        if (jobData && jobData.routines) {
          const routineData = jobData.routines[routineId];
          if (routineData) {
            return routineData;
          }
        }
        // Fallback: Get routines status and queue status
        const status = await api.monitor.getRoutinesStatusApiJobsJobIdRoutinesStatusGet(jobId);
        const queueStatus = await api.monitor.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
        return {
          routine_id: routineId,
          execution_status: status.routines?.[routineId] || null,
          queue_status: queueStatus?.[routineId] || [],
          info: status.routine_info?.[routineId] || null,
        };
      },
      // Get routine queue status
      getRoutineQueueStatus: async (jobId: string, routineId: string): Promise<SlotQueueStatus> => {
        return await api.monitor.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
      },
      getMetrics: async (jobId: string) => {
        return await api.monitor.getJobMetricsApiJobsJobIdMetricsGet(jobId);
      },
      getTrace: async (jobId: string, limit?: number) => {
        return await api.monitor.getJobTraceApiJobsJobIdTraceTraceGet(jobId, limit || null);
      },
      getLogs: async (jobId: string) => {
        return await api.monitor.getJobLogsApiJobsJobIdLogsLogsGet(jobId);
      },
      cleanup: async (maxAgeHours: number = 24, statuses?: string[]) => {
        return await api.jobs.postJobsCleanup(maxAgeHours, statuses || null);
      },
    },

    // Debug API (backward compatible)
    debug: {
      getSession: async (jobId: string) => {
        return await api.debug.getJobsJobIdDebugSessionGet(jobId);
      },
      resume: async (jobId: string) => {
        return await api.debug.postJobsJobIdDebugResumePost(jobId);
      },
      stepOver: async (jobId: string) => {
        return await api.debug.postJobsJobIdDebugStepOverPost(jobId);
      },
      stepInto: async (jobId: string) => {
        return await api.debug.postJobsJobIdDebugStepIntoPost(jobId);
      },
      getVariables: async (jobId: string, routineId?: string) => {
        return await api.debug.getJobsJobIdDebugVariablesVariablesGet(jobId, routineId || null);
      },
      setVariable: async (jobId: string, name: string, value: any) => {
        return await api.debug.putJobsJobIdDebugVariablesNamePut(name, jobId, { value });
      },
      getCallStack: async (jobId: string) => {
        return await api.debug.getJobsJobIdDebugCallStackCallStackGet(jobId);
      },
      evaluateExpression: async (jobId: string, request: any) => {
        return await api.debug.postJobsJobIdDebugEvaluatePost(jobId, request);
      },
    },

    // Breakpoints API (backward compatible)
    breakpoints: {
      list: async (jobId: string) => {
        return await api.breakpoints.getJobsJobIdBreakpointsGet(jobId);
      },
      create: async (jobId: string, request: any) => {
        return await api.breakpoints.postJobsJobIdBreakpointsPost(jobId, request);
      },
      update: async (jobId: string, breakpointId: string, enabled: boolean) => {
        return await api.breakpoints.patchJobsJobIdBreakpointsBreakpointIdPatch(jobId, breakpointId, { enabled });
      },
      delete: async (jobId: string, breakpointId: string) => {
        return await api.breakpoints.deleteJobsJobIdBreakpointsBreakpointIdDelete(jobId, breakpointId);
      },
    },

    // Monitor API (new!)
    monitor: {
      getJobMonitoringData: async (jobId: string): Promise<JobMonitoringData> => {
        return await api.monitor.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
      },
      getRoutineMonitoringData: async (jobId: string, routineId: string): Promise<RoutineMonitoringData> => {
        const jobData = await api.monitor.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
        if (jobData && jobData.routines) {
          const routineData = jobData.routines[routineId];
          if (routineData) {
            return routineData;
          }
        }
        // Fallback: Get routines status and queue status manually
        const status = await api.monitor.getRoutinesStatusApiJobsJobIdRoutinesStatusGet(jobId);
        const queueStatus = await api.monitor.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
        return {
          routine_id: routineId,
          execution_status: status.routines?.[routineId] || null,
          queue_status: queueStatus?.[routineId] || [],
          info: status.routine_info?.[routineId] || null,
        };
      },
      getRoutineQueueStatus: async (jobId: string, routineId: string): Promise<SlotQueueStatus> => {
        const jobData = await api.monitor.getJobMonitoringDataApiJobsJobIdMonitoringGet(jobId);
        if (jobData && jobData.routines) {
          const routineData = jobData.routines[routineId];
          if (routineData && routineData.queue_status && routineData.queue_status.length > 0) {
            return routineData.queue_status[0];
          }
        }
        // Fallback: direct query
        const queueStatus = await api.monitor.getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(jobId, routineId);
        return queueStatus || { routine_id: routineId, slots: [] };
      },
    },

    // Discovery API (new!)
    discovery: {
      syncFlows: async () => {
        try {
          return await api.discovery.postDiscoveryFlowsSyncPost();
        } catch {
          return null;
        }
      },
      syncJobs: async () => {
        try {
          return await api.discovery.postDiscoveryJobsSyncPost();
        } catch {
          return null;
        }
      },
    },

    // Health check
    health: async () => {
      try {
        return await api.default.getHealthHealthGet();
      } catch {
        return null;
      }
    },

    // Client methods
    testConnection: async (): Promise<boolean> => {
      try {
        const response = await api.default.getHealthHealthGet();
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
