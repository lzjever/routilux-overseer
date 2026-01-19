/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BreakpointCreateRequest } from '../models/BreakpointCreateRequest';
import type { BreakpointListResponse } from '../models/BreakpointListResponse';
import type { BreakpointResponse } from '../models/BreakpointResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BreakpointsService {
    /**
     * Create Breakpoint
     * Create a breakpoint for a job.
     * @param jobId
     * @param requestBody
     * @returns BreakpointResponse Successful Response
     * @throws ApiError
     */
    public static createBreakpointApiJobsJobIdBreakpointsPost(
        jobId: string,
        requestBody: BreakpointCreateRequest,
    ): CancelablePromise<BreakpointResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jobs/{job_id}/breakpoints',
            path: {
                'job_id': jobId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Breakpoints
     * List all breakpoints for a job.
     * @param jobId
     * @returns BreakpointListResponse Successful Response
     * @throws ApiError
     */
    public static listBreakpointsApiJobsJobIdBreakpointsGet(
        jobId: string,
    ): CancelablePromise<BreakpointListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/breakpoints',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Breakpoint
     * Delete a breakpoint.
     * @param jobId
     * @param breakpointId
     * @returns void
     * @throws ApiError
     */
    public static deleteBreakpointApiJobsJobIdBreakpointsBreakpointIdDelete(
        jobId: string,
        breakpointId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/jobs/{job_id}/breakpoints/{breakpoint_id}',
            path: {
                'job_id': jobId,
                'breakpoint_id': breakpointId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
