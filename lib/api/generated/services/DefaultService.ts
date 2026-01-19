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
     *
     * **Overview**:
     * Returns basic information about the Routilux API, including version, description,
     * and key endpoint paths. Use this to verify API connectivity and discover available
     * endpoints.
     *
     * **Endpoint**: `GET /`
     *
     * **Use Cases**:
     * - Verify API connectivity
     * - Check API version
     * - Discover endpoint paths
     * - Health check for API availability
     *
     * **Request Example**:
     * ```
     * GET /
     * ```
     *
     * **Response Example**:
     * ```json
     * {
         * "name": "Routilux API",
         * "version": "0.11.0",
         * "description": "Monitoring, debugging, and flow builder API",
         * "api_version": "v1",
         * "endpoints": {
             * "v1": "/api/v1",
             * "health": "/api/v1/health/live",
             * "docs": "/docs"
             * }
             * }
             * ```
             *
             * **Response Fields**:
             * - `name`: API name
             * - `version`: API version number
             * - `description`: API description
             * - `api_version`: Current API version identifier
             * - `endpoints`: Key endpoint paths
             *
             * **Authentication**:
             * - Requires API key if `ROUTILUX_API_KEY_ENABLED=true`
             * - Use `X-API-Key` header for authentication
             *
             * **Related Endpoints**:
             * - GET /api/v1/health/live - Liveness probe
             * - GET /api/v1/health/ready - Readiness probe
             * - GET /docs - Interactive API documentation (Swagger UI)
             *
             * Returns:
             * dict: API information with version and endpoint paths
             *
             * Raises:
             * HTTPException: 401 if authentication fails
             * @returns any Successful Response
             * @throws ApiError
             */
            public static rootGet(): CancelablePromise<any> {
                return __request(OpenAPI, {
                    method: 'GET',
                    url: '/',
                });
            }
        }
