/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RuntimeCreateRequest } from '../models/RuntimeCreateRequest';
import type { RuntimeListResponse } from '../models/RuntimeListResponse';
import type { RuntimeResponse } from '../models/RuntimeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RuntimesService {
    /**
     * List Runtimes
     * List all registered Runtime instances.
     *
     * **Overview**:
     * Returns a list of all Runtime instances registered in the system, including
     * their configuration, status, and active job counts. Use this to discover
     * available runtimes before starting a job.
     *
     * **Endpoint**: `GET /api/runtimes`
     *
     * **Use Cases**:
     * - Discover available runtimes
     * - Check runtime status and capacity
     * - Build runtime selection UI
     * - Monitor runtime health
     *
     * **Request Example**:
     * ```
     * GET /api/runtimes
     * ```
     *
     * **Response Example**:
     * ```json
     * {
         * "runtimes": [
             * {
                 * "runtime_id": "production",
                 * "thread_pool_size": 20,
                 * "is_default": true,
                 * "active_job_count": 3,
                 * "is_shutdown": false
                 * },
                 * {
                     * "runtime_id": "development",
                     * "thread_pool_size": 5,
                     * "is_default": false,
                     * "active_job_count": 0,
                     * "is_shutdown": false
                     * }
                     * ],
                     * "total": 2,
                     * "default_runtime_id": "production"
                     * }
                     * ```
                     *
                     * **Response Fields**:
                     * - `runtimes`: List of RuntimeInfo objects
                     * - `total`: Total number of registered runtimes
                     * - `default_runtime_id`: ID of the default runtime
                     *
                     * **Runtime Information**:
                     * - `runtime_id`: Unique identifier (use this in JobStartRequest)
                     * - `thread_pool_size`: Maximum worker threads
                     * - `is_default`: Whether this is the default runtime
                     * - `active_job_count`: Number of currently running jobs
                     * - `is_shutdown`: Whether runtime is shut down
                     *
                     * **Related Endpoints**:
                     * - GET /api/runtimes/{runtime_id} - Get specific runtime details
                     * - POST /api/runtimes - Register a new runtime
                     * - POST /api/jobs - Start a job with a specific runtime
                     *
                     * Returns:
                     * RuntimeListResponse: List of all registered runtimes
                     *
                     * Raises:
                     * HTTPException: 500 if registry is not accessible
                     * @returns RuntimeListResponse Successful Response
                     * @throws ApiError
                     */
                    public static listRuntimesApiRuntimesGet(): CancelablePromise<RuntimeListResponse> {
                        return __request(OpenAPI, {
                            method: 'GET',
                            url: '/api/runtimes',
                        });
                    }
                    /**
                     * Create Runtime
                     * Register a new Runtime instance.
                     *
                     * **Overview**:
                     * Creates and registers a new Runtime instance with the specified configuration.
                     * This allows you to create multiple runtimes for different environments (e.g.,
                     * production, development, testing) with different thread pool sizes.
                     *
                     * **Endpoint**: `POST /api/runtimes`
                     *
                     * **Use Cases**:
                     * - Create production runtime with large thread pool
                     * - Create development runtime with small thread pool
                     * - Create isolated runtime for testing
                     * - Set up multiple execution environments
                     *
                     * **Request Example**:
                     * ```json
                     * {
                         * "runtime_id": "production",
                         * "thread_pool_size": 20,
                         * "is_default": true
                         * }
                         * ```
                         *
                         * **Response Example**:
                         * ```json
                         * {
                             * "runtime": {
                                 * "runtime_id": "production",
                                 * "thread_pool_size": 20,
                                 * "is_default": true,
                                 * "active_job_count": 0,
                                 * "is_shutdown": false
                                 * }
                                 * }
                                 * ```
                                 *
                                 * **Error Responses**:
                                 * - `400 Bad Request`: Runtime ID already exists or invalid parameters
                                 * - `422 Validation Error`: Invalid request parameters
                                 *
                                 * **Thread Pool Size Guidelines**:
                                 * - `0`: Use GlobalJobManager's thread pool (recommended for most cases)
                                 * - `1-10`: Small workloads, development/testing
                                 * - `10-50`: Medium workloads, production
                                 * - `50-100`: Large workloads, high concurrency
                                 * - `>100`: Not recommended (may cause resource issues)
                                 *
                                 * **Related Endpoints**:
                                 * - GET /api/runtimes - List all runtimes
                                 * - GET /api/runtimes/{runtime_id} - Get runtime details
                                 * - POST /api/jobs - Start a job with this runtime
                                 *
                                 * Args:
                                 * request: RuntimeCreateRequest with runtime configuration
                                 *
                                 * Returns:
                                 * RuntimeResponse: Created runtime information
                                 *
                                 * Raises:
                                 * HTTPException: 400 if runtime ID already exists
                                 * HTTPException: 422 if validation fails
                                 * @param requestBody
                                 * @returns RuntimeResponse Successful Response
                                 * @throws ApiError
                                 */
                                public static createRuntimeApiRuntimesPost(
                                    requestBody: RuntimeCreateRequest,
                                ): CancelablePromise<RuntimeResponse> {
                                    return __request(OpenAPI, {
                                        method: 'POST',
                                        url: '/api/runtimes',
                                        body: requestBody,
                                        mediaType: 'application/json',
                                        errors: {
                                            422: `Validation Error`,
                                        },
                                    });
                                }
                                /**
                                 * Get Runtime
                                 * Get detailed information about a specific Runtime instance.
                                 *
                                 * **Overview**:
                                 * Returns detailed information about a registered Runtime, including its
                                 * configuration, status, and active job count. Use this to check if a runtime
                                 * is available and healthy before starting a job.
                                 *
                                 * **Endpoint**: `GET /api/runtimes/{runtime_id}`
                                 *
                                 * **Use Cases**:
                                 * - Check if a specific runtime exists
                                 * - Verify runtime status before starting a job
                                 * - Monitor runtime health
                                 * - Get runtime configuration details
                                 *
                                 * **Request Example**:
                                 * ```
                                 * GET /api/runtimes/production
                                 * ```
                                 *
                                 * **Response Example**:
                                 * ```json
                                 * {
                                     * "runtime": {
                                         * "runtime_id": "production",
                                         * "thread_pool_size": 20,
                                         * "is_default": true,
                                         * "active_job_count": 3,
                                         * "is_shutdown": false
                                         * }
                                         * }
                                         * ```
                                         *
                                         * **Error Responses**:
                                         * - `404 Not Found`: Runtime with this ID is not registered
                                         *
                                         * **Related Endpoints**:
                                         * - GET /api/runtimes - List all runtimes
                                         * - POST /api/runtimes - Register a new runtime
                                         * - POST /api/jobs - Start a job with this runtime
                                         *
                                         * Args:
                                         * runtime_id: Unique runtime identifier
                                         *
                                         * Returns:
                                         * RuntimeResponse: Runtime information
                                         *
                                         * Raises:
                                         * HTTPException: 404 if runtime not found
                                         * @param runtimeId
                                         * @returns RuntimeResponse Successful Response
                                         * @throws ApiError
                                         */
                                        public static getRuntimeApiRuntimesRuntimeIdGet(
                                            runtimeId: string,
                                        ): CancelablePromise<RuntimeResponse> {
                                            return __request(OpenAPI, {
                                                method: 'GET',
                                                url: '/api/runtimes/{runtime_id}',
                                                path: {
                                                    'runtime_id': runtimeId,
                                                },
                                                errors: {
                                                    422: `Validation Error`,
                                                },
                                            });
                                        }
                                    }
