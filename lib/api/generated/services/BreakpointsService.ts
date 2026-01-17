/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BreakpointCreateRequest } from '../models/BreakpointCreateRequest';
import type { BreakpointListResponse } from '../models/BreakpointListResponse';
import type { BreakpointResponse } from '../models/BreakpointResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BreakpointsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create Breakpoint
     * Create a breakpoint for a job.
     * @param jobId
     * @param requestBody
     * @returns BreakpointResponse Successful Response
     * @throws ApiError
     */
    public createBreakpointApiJobsJobIdBreakpointsPost(
        jobId: string,
        requestBody: BreakpointCreateRequest,
    ): CancelablePromise<BreakpointResponse> {
        return this.httpRequest.request({
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
    public listBreakpointsApiJobsJobIdBreakpointsGet(
        jobId: string,
    ): CancelablePromise<BreakpointListResponse> {
        return this.httpRequest.request({
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
    public deleteBreakpointApiJobsJobIdBreakpointsBreakpointIdDelete(
        jobId: string,
        breakpointId: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
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
    /**
     * Update Breakpoint
     * Update breakpoint (enable/disable).
     * @param jobId
     * @param breakpointId
     * @param enabled
     * @returns BreakpointResponse Successful Response
     * @throws ApiError
     */
    public updateBreakpointApiJobsJobIdBreakpointsBreakpointIdPut(
        jobId: string,
        breakpointId: string,
        enabled: boolean,
    ): CancelablePromise<BreakpointResponse> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/jobs/{job_id}/breakpoints/{breakpoint_id}',
            path: {
                'job_id': jobId,
                'breakpoint_id': breakpointId,
            },
            query: {
                'enabled': enabled,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
