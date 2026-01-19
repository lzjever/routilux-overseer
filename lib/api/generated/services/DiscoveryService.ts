/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FlowListResponse } from '../models/FlowListResponse';
import type { JobListResponse } from '../models/JobListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DiscoveryService {
    /**
     * Sync Flows
     * Sync flows from global registry to API store.
     *
     * **Overview**:
     * Discovers all flows from the global FlowRegistry and syncs them to the API store.
     * This allows the API to monitor and manage flows that were created outside the API
     * (e.g., programmatically or from DSL files). After syncing, these flows become
     * available through the standard flow management endpoints.
     *
     * **Endpoint**: `POST /api/discovery/flows/sync`
     *
     * **Use Cases**:
     * - Sync flows created programmatically
     * - Import flows from external sources
     * - Make flows available to API after creation
     * - Discover flows created in other processes
     * - Integrate with external flow creation tools
     *
     * **Request Example**:
     * ```
     * POST /api/discovery/flows/sync
     * ```
     *
     * **Response Example**:
     * ```json
     * {
         * "flows": [
             * {
                 * "flow_id": "programmatic_flow",
                 * "routines": {...},
                 * "connections": [...]
                 * }
                 * ],
                 * "total": 1
                 * }
                 * ```
                 *
                 * **Behavior**:
                 * - Reads all flows from global FlowRegistry
                 * - Returns list of discovered flows
                 * - Flows are now accessible via standard API endpoints
                 * - Does not modify existing flows in API store
                 *
                 * **Error Responses**:
                 * - `500 Internal Server Error`: Failed to access flow registry or sync flows
                 *
                 * **Best Practices**:
                 * 1. Sync flows after programmatic creation
                 * 2. Use this endpoint to integrate external flow sources
                 * 3. Check discovered flows: GET /api/discovery/flows
                 * 4. Sync regularly if flows are created outside API
                 *
                 * **Related Endpoints**:
                 * - GET /api/discovery/flows - Discover flows without syncing
                 * - GET /api/flows - List all flows in API store
                 * - POST /api/flows - Create flows via API
                 *
                 * Returns:
                 * FlowListResponse: List of discovered flows with total count
                 *
                 * Raises:
                 * HTTPException: 500 if sync fails
                 * @returns FlowListResponse Successful Response
                 * @throws ApiError
                 */
                public static syncFlowsApiV1DiscoveryFlowsSyncPost(): CancelablePromise<FlowListResponse> {
                    return __request(OpenAPI, {
                        method: 'POST',
                        url: '/api/v1/discovery/flows/sync',
                    });
                }
                /**
                 * Discover Flows
                 * Discover flows from global registry.
                 *
                 * **Overview**:
                 * Returns flows from the global FlowRegistry that may not be in the API store.
                 * This is a read-only operation that does not modify the API store. Use this to
                 * discover flows created outside the API before deciding to sync them.
                 *
                 * **Endpoint**: `GET /api/discovery/flows`
                 *
                 * **Use Cases**:
                 * - Discover flows created programmatically
                 * - Check for flows not yet in API store
                 * - Inspect flows before syncing
                 * - Audit flow sources
                 * - Build flow discovery tools
                 *
                 * **Request Example**:
                 * ```
                 * GET /api/discovery/flows
                 * ```
                 *
                 * **Response Example**:
                 * ```json
                 * {
                     * "flows": [
                         * {
                             * "flow_id": "programmatic_flow",
                             * "routines": {...},
                             * "connections": [...]
                             * }
                             * ],
                             * "total": 1
                             * }
                             * ```
                             *
                             * **Behavior**:
                             * - Reads flows from global FlowRegistry
                             * - Returns list without modifying API store
                             * - Safe to call repeatedly
                             * - Does not sync flows to API store
                             *
                             * **Difference from Sync**:
                             * - **Discover** (GET): Read-only, does not modify API store
                             * - **Sync** (POST): Discovers and makes flows available via API
                             *
                             * **Error Responses**:
                             * - `500 Internal Server Error`: Failed to access flow registry
                             *
                             * **Best Practices**:
                             * 1. Use discover to inspect flows before syncing
                             * 2. Compare with API store: GET /api/flows
                             * 3. Sync when ready: POST /api/discovery/flows/sync
                             *
                             * **Related Endpoints**:
                             * - POST /api/discovery/flows/sync - Sync discovered flows to API store
                             * - GET /api/flows - List flows in API store
                             *
                             * Returns:
                             * FlowListResponse: List of discovered flows with total count
                             *
                             * Raises:
                             * HTTPException: 500 if discovery fails
                             * @returns FlowListResponse Successful Response
                             * @throws ApiError
                             */
                            public static discoverFlowsApiV1DiscoveryFlowsGet(): CancelablePromise<FlowListResponse> {
                                return __request(OpenAPI, {
                                    method: 'GET',
                                    url: '/api/v1/discovery/flows',
                                });
                            }
                            /**
                             * Sync Jobs
                             * Sync jobs from Runtime to API storage.
                             *
                             * **Overview**:
                             * Discovers all jobs from the Runtime and syncs them to the API job storage.
                             * This allows the API to monitor and manage jobs that were started outside the API
                             * (e.g., programmatically or from other processes). After syncing, these jobs become
                             * available through the standard job management endpoints.
                             *
                             * **Endpoint**: `POST /api/discovery/jobs/sync`
                             *
                             * **Use Cases**:
                             * - Sync jobs started programmatically
                             * - Import jobs from external sources
                             * - Make jobs available to API after creation
                             * - Discover jobs created in other processes
                             * - Integrate with external job creation tools
                             *
                             * **Request Example**:
                             * ```
                             * POST /api/discovery/jobs/sync
                             * ```
                             *
                             * **Response Example**:
                             * ```json
                             * {
                                 * "jobs": [
                                     * {
                                         * "job_id": "job_xyz789",
                                         * "worker_id": "worker_abc123",
                                         * "flow_id": "data_processing_flow",
                                         * "status": "running",
                                         * "created_at": 1705312800,
                                         * "started_at": 1705312801,
                                         * "completed_at": null,
                                         * "error": null,
                                         * "metadata": {}
                                         * }
                                         * ],
                                         * "total": 1,
                                         * "limit": 1,
                                         * "offset": 0
                                         * }
                                         * ```
                                         *
                                         * **Behavior**:
                                         * - Reads all jobs from Runtime
                                         * - Syncs jobs to API job storage
                                         * - Associates jobs with their workers and flows
                                         * - Jobs are now accessible via standard API endpoints
                                         *
                                         * **Error Responses**:
                                         * - `500 Internal Server Error`: Failed to access runtime or sync jobs
                                         *
                                         * **Best Practices**:
                                         * 1. Sync jobs after programmatic creation
                                         * 2. Use this endpoint to integrate external job sources
                                         * 3. Check discovered jobs: GET /api/discovery/jobs
                                         * 4. Sync regularly if jobs are created outside API
                                         *
                                         * **Related Endpoints**:
                                         * - GET /api/discovery/jobs - Discover jobs without syncing
                                         * - GET /api/jobs - List all jobs in API storage
                                         * - POST /api/jobs - Create jobs via API
                                         *
                                         * Returns:
                                         * JobListResponse: List of discovered jobs with total count
                                         *
                                         * Raises:
                                         * HTTPException: 500 if sync fails
                                         * @returns JobListResponse Successful Response
                                         * @throws ApiError
                                         */
                                        public static syncJobsApiV1DiscoveryJobsSyncPost(): CancelablePromise<JobListResponse> {
                                            return __request(OpenAPI, {
                                                method: 'POST',
                                                url: '/api/v1/discovery/jobs/sync',
                                            });
                                        }
                                        /**
                                         * Discover Jobs
                                         * Discover jobs from Runtime.
                                         *
                                         * **Overview**:
                                         * Returns jobs from the Runtime that may not be in the API job storage.
                                         * This is a read-only operation that does not modify the storage. Use this to
                                         * discover jobs started outside the API before deciding to sync them.
                                         *
                                         * **Endpoint**: `GET /api/discovery/jobs`
                                         *
                                         * **Use Cases**:
                                         * - Discover jobs started programmatically
                                         * - Check for jobs not yet in API storage
                                         * - Inspect jobs before syncing
                                         * - Audit job sources
                                         * - Build job discovery tools
                                         *
                                         * **Request Example**:
                                         * ```
                                         * GET /api/discovery/jobs
                                         * ```
                                         *
                                         * **Response Example**:
                                         * ```json
                                         * {
                                             * "jobs": [
                                                 * {
                                                     * "job_id": "job_xyz789",
                                                     * "worker_id": "worker_abc123",
                                                     * "flow_id": "data_processing_flow",
                                                     * "status": "running",
                                                     * "created_at": 1705312800,
                                                     * "started_at": 1705312801,
                                                     * "completed_at": null,
                                                     * "error": null,
                                                     * "metadata": {}
                                                     * }
                                                     * ],
                                                     * "total": 1,
                                                     * "limit": 1,
                                                     * "offset": 0
                                                     * }
                                                     * ```
                                                     *
                                                     * **Behavior**:
                                                     * - Reads jobs from Runtime
                                                     * - Returns list without modifying API storage
                                                     * - Safe to call repeatedly
                                                     * - Does not sync jobs to API storage
                                                     *
                                                     * **Difference from Sync**:
                                                     * - **Discover** (GET): Read-only, does not modify API storage
                                                     * - **Sync** (POST): Discovers and syncs jobs to API storage
                                                     *
                                                     * **Error Responses**:
                                                     * - `500 Internal Server Error`: Failed to access runtime
                                                     *
                                                     * **Best Practices**:
                                                     * 1. Use discover to inspect jobs before syncing
                                                     * 2. Compare with API storage: GET /api/jobs
                                                     * 3. Sync when ready: POST /api/discovery/jobs/sync
                                                     *
                                                     * **Related Endpoints**:
                                                     * - POST /api/discovery/jobs/sync - Sync discovered jobs to API storage
                                                     * - GET /api/jobs - List jobs in API storage
                                                     *
                                                     * Returns:
                                                     * JobListResponse: List of discovered jobs with total count
                                                     *
                                                     * Raises:
                                                     * HTTPException: 500 if discovery fails
                                                     * @returns JobListResponse Successful Response
                                                     * @throws ApiError
                                                     */
                                                    public static discoverJobsApiV1DiscoveryJobsGet(): CancelablePromise<JobListResponse> {
                                                        return __request(OpenAPI, {
                                                            method: 'GET',
                                                            url: '/api/v1/discovery/jobs',
                                                        });
                                                    }
                                                    /**
                                                     * Sync Workers
                                                     * Sync workers from Runtime to WorkerRegistry.
                                                     *
                                                     * **Overview**:
                                                     * Discovers all active workers from the Runtime and ensures they are registered
                                                     * in the WorkerRegistry. This allows the API to monitor and manage workers that
                                                     * were created outside the API (e.g., programmatically). After syncing, these workers
                                                     * become available through the standard worker management endpoints.
                                                     *
                                                     * **Endpoint**: `POST /api/discovery/workers/sync`
                                                     *
                                                     * **Use Cases**:
                                                     * - Sync workers created programmatically
                                                     * - Import workers from external sources
                                                     * - Make workers available to API after creation
                                                     * - Discover workers created in other processes
                                                     * - Integrate with external worker creation tools
                                                     *
                                                     * **Request Example**:
                                                     * ```
                                                     * POST /api/discovery/workers/sync
                                                     * ```
                                                     *
                                                     * **Response Example**:
                                                     * ```json
                                                     * {
                                                         * "workers": [
                                                             * {
                                                                 * "worker_id": "worker_abc123",
                                                                 * "flow_id": "data_processing_flow",
                                                                 * "status": "running"
                                                                 * }
                                                                 * ],
                                                                 * "total": 1
                                                                 * }
                                                                 * ```
                                                                 *
                                                                 * **Behavior**:
                                                                 * - Reads all active workers from Runtime
                                                                 * - Registers workers in WorkerRegistry if not already registered
                                                                 * - Returns list of discovered workers
                                                                 * - Workers are now accessible via standard API endpoints
                                                                 *
                                                                 * **Error Responses**:
                                                                 * - `500 Internal Server Error`: Failed to access runtime or sync workers
                                                                 *
                                                                 * **Best Practices**:
                                                                 * 1. Sync workers after programmatic creation
                                                                 * 2. Use this endpoint to integrate external worker sources
                                                                 * 3. Check worker status: GET /api/v1/workers/{worker_id}
                                                                 * 4. Sync regularly if workers are created outside API
                                                                 *
                                                                 * **Related Endpoints**:
                                                                 * - GET /api/v1/workers - List all workers
                                                                 * - GET /api/v1/workers/{worker_id} - Get worker details
                                                                 * - POST /api/v1/workers - Create workers via API
                                                                 *
                                                                 * Returns:
                                                                 * dict: List of discovered workers with total count
                                                                 *
                                                                 * Raises:
                                                                 * HTTPException: 500 if sync fails
                                                                 * @returns any Successful Response
                                                                 * @throws ApiError
                                                                 */
                                                                public static syncWorkersApiV1DiscoveryWorkersSyncPost(): CancelablePromise<any> {
                                                                    return __request(OpenAPI, {
                                                                        method: 'POST',
                                                                        url: '/api/v1/discovery/workers/sync',
                                                                    });
                                                                }
                                                            }
