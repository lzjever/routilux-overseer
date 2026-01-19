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
            /**
             * Legacy Health
             * Legacy health check endpoint.
             *
             * **Overview**:
             * Returns comprehensive health information about the API, including monitoring status,
             * store accessibility, and system statistics. This is a legacy endpoint maintained for
             * backward compatibility.
             *
             * **Endpoint**: `GET /api/health`
             *
             * **Note**: For new implementations, use the v1 health endpoints:
             * - GET /api/v1/health/live (liveness probe)
             * - GET /api/v1/health/ready (readiness probe)
             * - GET /api/v1/health/stats (detailed statistics)
             *
             * **Use Cases**:
             * - Health monitoring
             * - System status checks
             * - Backward compatibility
             * - Legacy integrations
             *
             * **Request Example**:
             * ```
             * GET /api/health
             * ```
             *
             * **Response Example**:
             * ```json
             * {
                 * "status": "healthy",
                 * "auth_required": true,
                 * "monitoring": {
                     * "enabled": true
                     * },
                     * "stores": {
                         * "accessible": true,
                         * "flow_count": 10,
                         * "job_count": 5
                         * },
                         * "version": "0.11.0"
                         * }
                         * ```
                         *
                         * **Response Fields**:
                         * - `status`: Overall health status ("healthy" or "unhealthy")
                         * - `auth_required`: Whether API key authentication is enabled
                         * - `monitoring.enabled`: Whether monitoring is enabled
                         * - `stores.accessible`: Whether stores are accessible
                         * - `stores.flow_count`: Number of flows in store (if accessible)
                         * - `stores.job_count`: Number of active jobs (if accessible)
                         * - `version`: API version
                         *
                         * **Health Checks**:
                         * - Verifies monitoring registry is enabled
                         * - Checks flow registry accessibility
                         * - Checks runtime accessibility
                         * - Counts flows and jobs if accessible
                         *
                         * **Error Handling**:
                         * - Returns "healthy" status even if some checks fail
                         * - Stores may show as inaccessible if there are errors
                         * - Flow/job counts may be null if stores are inaccessible
                         *
                         * **Authentication**:
                         * - Requires API key if `ROUTILUX_API_KEY_ENABLED=true`
                         * - Use `X-API-Key` header for authentication
                         *
                         * **Related Endpoints**:
                         * - GET /api/v1/health/live - Liveness probe (recommended)
                         * - GET /api/v1/health/ready - Readiness probe (recommended)
                         * - GET /api/v1/health/stats - Detailed statistics (recommended)
                         *
                         * Returns:
                         * dict: Health status with monitoring and store information
                         *
                         * Raises:
                         * HTTPException: 401 if authentication fails
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
