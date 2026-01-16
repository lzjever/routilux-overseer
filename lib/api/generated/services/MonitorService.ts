/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExecutionMetricsResponse } from '../models/ExecutionMetricsResponse';
import type { ExecutionTraceResponse } from '../models/ExecutionTraceResponse';
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
}
