/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BreakpointUpdateRequest } from '../models/BreakpointUpdateRequest';
import type { JobListResponse } from '../models/JobListResponse';
import type { WorkerCreateRequest } from '../models/WorkerCreateRequest';
import type { WorkerListResponse } from '../models/WorkerListResponse';
import type { WorkerResponse } from '../models/WorkerResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorkersService {
    /**
     * Create Worker
     * Create and start a new Worker for a Flow.
     *
     * A Worker is a long-running execution instance that can process multiple Jobs.
     * Use this when you need persistent processing capacity for a Flow.
     * @param requestBody
     * @returns WorkerResponse Successful Response
     * @throws ApiError
     */
    public static createWorkerApiV1WorkersPost(
        requestBody: WorkerCreateRequest,
    ): CancelablePromise<WorkerResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Workers
     * List all Workers with optional filters.
     *
     * Returns Workers from the Runtime's active workers list.
     * @param flowId Filter by flow ID
     * @param status Filter by status
     * @param limit Maximum workers to return
     * @param offset Number of workers to skip
     * @returns WorkerListResponse Successful Response
     * @throws ApiError
     */
    public static listWorkersApiV1WorkersGet(
        flowId?: (string | null),
        status?: (string | null),
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<WorkerListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers',
            query: {
                'flow_id': flowId,
                'status': status,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Worker
     * Get Worker details by ID.
     * @param workerId
     * @returns WorkerResponse Successful Response
     * @throws ApiError
     */
    public static getWorkerApiV1WorkersWorkerIdGet(
        workerId: string,
    ): CancelablePromise<WorkerResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers/{worker_id}',
            path: {
                'worker_id': workerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Stop Worker
     * Stop and remove a Worker.
     *
     * This stops the Worker's execution and removes it from the active list.
     * Jobs in progress may be interrupted.
     * @param workerId
     * @returns void
     * @throws ApiError
     */
    public static stopWorkerApiV1WorkersWorkerIdDelete(
        workerId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/workers/{worker_id}',
            path: {
                'worker_id': workerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Pause Worker
     * Pause a running Worker.
     *
     * Paused workers can receive new jobs but won't process them until resumed.
     * @param workerId
     * @returns WorkerResponse Successful Response
     * @throws ApiError
     */
    public static pauseWorkerApiV1WorkersWorkerIdPausePost(
        workerId: string,
    ): CancelablePromise<WorkerResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workers/{worker_id}/pause',
            path: {
                'worker_id': workerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resume Worker
     * Resume a paused Worker.
     *
     * Queued jobs will be processed after resuming.
     * @param workerId
     * @returns WorkerResponse Successful Response
     * @throws ApiError
     */
    public static resumeWorkerApiV1WorkersWorkerIdResumePost(
        workerId: string,
    ): CancelablePromise<WorkerResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workers/{worker_id}/resume',
            path: {
                'worker_id': workerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Worker Jobs
     * List all Jobs for a specific Worker.
     * @param workerId
     * @param status Filter by job status
     * @param limit Maximum jobs to return
     * @param offset Number of jobs to skip
     * @returns JobListResponse Successful Response
     * @throws ApiError
     */
    public static listWorkerJobsApiV1WorkersWorkerIdJobsGet(
        workerId: string,
        status?: (string | null),
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<JobListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers/{worker_id}/jobs',
            path: {
                'worker_id': workerId,
            },
            query: {
                'status': status,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Worker Statistics
     * Get worker statistics including jobs processed, success rate, and routine statistics.
     * @param workerId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getWorkerStatisticsApiV1WorkersWorkerIdStatisticsGet(
        workerId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers/{worker_id}/statistics',
            path: {
                'worker_id': workerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Worker History
     * Get execution history for a worker.
     * @param workerId
     * @param routineId Filter by routine ID
     * @param limit Maximum records to return
     * @param offset Number of records to skip
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getWorkerHistoryApiV1WorkersWorkerIdHistoryGet(
        workerId: string,
        routineId?: (string | null),
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers/{worker_id}/history',
            path: {
                'worker_id': workerId,
            },
            query: {
                'routine_id': routineId,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Worker Routine States
     * Get routine states for all routines in a worker.
     * @param workerId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getWorkerRoutineStatesApiV1WorkersWorkerIdRoutinesStatesGet(
        workerId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workers/{worker_id}/routines/states',
            path: {
                'worker_id': workerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Breakpoint Enabled
     * Enable or disable a breakpoint (moved from breakpoints category).
     * @param workerId
     * @param breakpointId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateBreakpointEnabledApiV1WorkersWorkerIdBreakpointsBreakpointIdPut(
        workerId: string,
        breakpointId: string,
        requestBody: BreakpointUpdateRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/workers/{worker_id}/breakpoints/{breakpoint_id}',
            path: {
                'worker_id': workerId,
                'breakpoint_id': breakpointId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
