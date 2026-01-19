/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Root
     * Root endpoint.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static rootGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
    /**
     * Legacy Health
     * Legacy health check endpoint.
     *
     * For the new health endpoints, use:
     * - GET /api/v1/health/live (liveness)
     * - GET /api/v1/health/ready (readiness)
     * - GET /api/v1/health/stats (detailed stats)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static legacyHealthApiHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
        });
    }
}
