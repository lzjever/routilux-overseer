/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JobListResponse } from '../models/JobListResponse';
import type { JobResponse } from '../models/JobResponse';
import type { JobStartRequest } from '../models/JobStartRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JobsService {
    /**
     * Start Job
     * Start a new job from a flow.
     *
     * This endpoint immediately returns a job_id and executes the flow asynchronously
     * in the background. Use the job status endpoint to check execution progress.
     * @param requestBody
     * @returns JobResponse Successful Response
     * @throws ApiError
     */
    public static startJobApiJobsPost(
        requestBody: JobStartRequest,
    ): CancelablePromise<JobResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jobs',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List all jobs
     * Retrieve a paginated list of jobs with optional filters
     * @param flowId Filter by flow ID
     * @param status Filter by job status
     * @param limit Number of jobs per page
     * @param offset Number of jobs to skip
     * @returns JobListResponse Successful Response
     * @throws ApiError
     */
    public static listJobsApiJobsGet(
        flowId?: (string | null),
        status?: (string | null),
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<JobListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs',
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
     * Get Job
     * Get job details.
     * @param jobId
     * @returns JobResponse Successful Response
     * @throws ApiError
     */
    public static getJobApiJobsJobIdGet(
        jobId: string,
    ): CancelablePromise<JobResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Pause Job
     * Pause job execution.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static pauseJobApiJobsJobIdPausePost(
        jobId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jobs/{job_id}/pause',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resume Job
     * Resume job execution.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resumeJobApiJobsJobIdResumePost(
        jobId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jobs/{job_id}/resume',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Cancel Job
     * Cancel job execution.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static cancelJobApiJobsJobIdCancelPost(
        jobId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jobs/{job_id}/cancel',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Status
     * Get job status.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getJobStatusApiJobsJobIdStatusGet(
        jobId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/status',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job State
     * Get full job state.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getJobStateApiJobsJobIdStateGet(
        jobId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/state',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Cleanup Jobs
     * Clean up old jobs.
     *
     * Removes jobs older than specified age, optionally filtered by status.
     *
     * Args:
     * max_age_hours: Maximum age in hours (1-720, default: 24).
     * status: Optional list of statuses to clean up.
     *
     * Returns:
     * Number of jobs removed.
     * @param maxAgeHours Maximum age in hours
     * @param status Status filter
     * @returns any Successful Response
     * @throws ApiError
     */
    public static cleanupJobsApiJobsCleanupPost(
        maxAgeHours: number = 24,
        status?: (Array<string> | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jobs/cleanup',
            query: {
                'max_age_hours': maxAgeHours,
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
