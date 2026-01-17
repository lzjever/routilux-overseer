/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExecutionMetricsResponse } from '../models/ExecutionMetricsResponse';
import type { ExecutionTraceResponse } from '../models/ExecutionTraceResponse';
import type { JobMonitoringData } from '../models/JobMonitoringData';
import type { routilux__api__models__monitor__RoutineInfo } from '../models/routilux__api__models__monitor__RoutineInfo';
import type { RoutineExecutionStatus } from '../models/RoutineExecutionStatus';
import type { SlotQueueStatus } from '../models/SlotQueueStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MonitorService {
    /**
     * Get Job Metrics
     * Get execution metrics for a job.
     * @param jobId
     * @returns ExecutionMetricsResponse Successful Response
     * @throws ApiError
     */
    public static getJobMetricsApiJobsJobIdMetricsGet(
        jobId: string,
    ): CancelablePromise<ExecutionMetricsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/metrics',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Trace
     * Get execution trace for a job.
     * @param jobId
     * @param limit
     * @returns ExecutionTraceResponse Successful Response
     * @throws ApiError
     */
    public static getJobTraceApiJobsJobIdTraceGet(
        jobId: string,
        limit?: (number | null),
    ): CancelablePromise<ExecutionTraceResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/trace',
            path: {
                'job_id': jobId,
            },
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Logs
     * Get execution logs for a job.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getJobLogsApiJobsJobIdLogsGet(
        jobId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/logs',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Flow Metrics
     * Get aggregated metrics for all jobs of a flow.
     * @param flowId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFlowMetricsApiFlowsFlowIdMetricsGet(
        flowId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flows/{flow_id}/metrics',
            path: {
                'flow_id': flowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Routine Queue Status
     * Get queue status for all slots in a specific routine.
     * @param jobId
     * @param routineId
     * @returns SlotQueueStatus Successful Response
     * @throws ApiError
     */
    public static getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(
        jobId: string,
        routineId: string,
    ): CancelablePromise<Array<SlotQueueStatus>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/routines/{routine_id}/queue-status',
            path: {
                'job_id': jobId,
                'routine_id': routineId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Queues Status
     * Get queue status for all routines in a job.
     * @param jobId
     * @returns SlotQueueStatus Successful Response
     * @throws ApiError
     */
    public static getJobQueuesStatusApiJobsJobIdQueuesStatusGet(
        jobId: string,
    ): CancelablePromise<Record<string, Array<SlotQueueStatus>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/queues/status',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Routine Info
     * Get routine metadata information (policy, config, slots, events).
     * @param flowId
     * @param routineId
     * @returns routilux__api__models__monitor__RoutineInfo Successful Response
     * @throws ApiError
     */
    public static getRoutineInfoApiFlowsFlowIdRoutinesRoutineIdInfoGet(
        flowId: string,
        routineId: string,
    ): CancelablePromise<routilux__api__models__monitor__RoutineInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flows/{flow_id}/routines/{routine_id}/info',
            path: {
                'flow_id': flowId,
                'routine_id': routineId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Routines Status
     * Get execution status for all routines in a job.
     * @param jobId
     * @returns RoutineExecutionStatus Successful Response
     * @throws ApiError
     */
    public static getRoutinesStatusApiJobsJobIdRoutinesStatusGet(
        jobId: string,
    ): CancelablePromise<Record<string, RoutineExecutionStatus>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/routines/status',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Monitoring Data
     * Get complete monitoring data for a job (status + queues + metadata).
     * @param jobId
     * @returns JobMonitoringData Successful Response
     * @throws ApiError
     */
    public static getJobMonitoringDataApiJobsJobIdMonitoringGet(
        jobId: string,
    ): CancelablePromise<JobMonitoringData> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/monitoring',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
