/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpressionEvalRequest } from '../models/ExpressionEvalRequest';
import type { ExpressionEvalResponse } from '../models/ExpressionEvalResponse';
import type { VariableSetRequest } from '../models/VariableSetRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DebugService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Debug Session
     * Get debug session information.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public getDebugSessionApiJobsJobIdDebugSessionGet(
        jobId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/jobs/{job_id}/debug/session',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resume Debug
     * Resume execution from breakpoint.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public resumeDebugApiJobsJobIdDebugResumePost(
        jobId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/jobs/{job_id}/debug/resume',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Step Over
     * Step over current line.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public stepOverApiJobsJobIdDebugStepOverPost(
        jobId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/jobs/{job_id}/debug/step-over',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Step Into
     * Step into function.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public stepIntoApiJobsJobIdDebugStepIntoPost(
        jobId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/jobs/{job_id}/debug/step-into',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Variables
     * Get variables at current breakpoint.
     * @param jobId
     * @param routineId
     * @returns any Successful Response
     * @throws ApiError
     */
    public getVariablesApiJobsJobIdDebugVariablesGet(
        jobId: string,
        routineId?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/jobs/{job_id}/debug/variables',
            path: {
                'job_id': jobId,
            },
            query: {
                'routine_id': routineId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Set Variable
     * Set variable value at current breakpoint.
     * @param jobId
     * @param name
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public setVariableApiJobsJobIdDebugVariablesNamePut(
        jobId: string,
        name: string,
        requestBody: VariableSetRequest,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/jobs/{job_id}/debug/variables/{name}',
            path: {
                'job_id': jobId,
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Call Stack
     * Get call stack.
     * @param jobId
     * @returns any Successful Response
     * @throws ApiError
     */
    public getCallStackApiJobsJobIdDebugCallStackGet(
        jobId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/jobs/{job_id}/debug/call-stack',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Evaluate Expression
     * Evaluate an expression in the context of a paused job.
     *
     * Supports Python expressions with access to local and global variables
     * from the specified routine and stack frame.
     *
     * **Security**: Expression evaluation is sandboxed and only allows safe operations.
     *
     * Args:
     * job_id: Job identifier.
     * request: Evaluation request with expression and context.
     *
     * Returns:
     * ExpressionEvalResponse: Evaluation result or error.
     *
     * Raises:
     * 404: If job or debug session not found.
     * 400: If job is not paused.
     * 400: If expression is unsafe or times out.
     * @param jobId
     * @param requestBody
     * @returns ExpressionEvalResponse Successful Response
     * @throws ApiError
     */
    public evaluateExpressionApiJobsJobIdDebugEvaluatePost(
        jobId: string,
        requestBody: ExpressionEvalRequest,
    ): CancelablePromise<ExpressionEvalResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/jobs/{job_id}/debug/evaluate',
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
}
