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
     * Discovers all flows from the global registry and adds them to the API store.
     * This allows the API to monitor flows created outside the API.
     *
     * Returns:
     * List of discovered flows.
     * @returns FlowListResponse Successful Response
     * @throws ApiError
     */
    public static syncFlowsApiDiscoveryFlowsSyncPost(): CancelablePromise<FlowListResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/discovery/flows/sync',
        });
    }
    /**
     * Discover Flows
     * Discover flows from global registry.
     *
     * Returns flows from the global registry that may not be in the API store.
     * Does not modify the API store.
     *
     * Returns:
     * List of discovered flows.
     * @returns FlowListResponse Successful Response
     * @throws ApiError
     */
    public static discoverFlowsApiDiscoveryFlowsGet(): CancelablePromise<FlowListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/discovery/flows',
        });
    }
    /**
     * Sync Jobs
     * Sync jobs from Runtime to API storage.
     *
     * Discovers all jobs from the Runtime and syncs them to the job storage.
     * This allows the API to monitor jobs started outside the API.
     *
     * Returns:
     * List of discovered jobs.
     * @returns JobListResponse Successful Response
     * @throws ApiError
     */
    public static syncJobsApiDiscoveryJobsSyncPost(): CancelablePromise<JobListResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/discovery/jobs/sync',
        });
    }
    /**
     * Discover Jobs
     * Discover jobs from Runtime.
     *
     * Returns jobs from the Runtime that may not be in the API storage.
     * Does not modify the storage.
     *
     * Returns:
     * List of discovered jobs.
     * @returns JobListResponse Successful Response
     * @throws ApiError
     */
    public static discoverJobsApiDiscoveryJobsGet(): CancelablePromise<JobListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/discovery/jobs',
        });
    }
    /**
     * Sync Workers
     * Sync workers from Runtime to WorkerRegistry.
     *
     * Discovers all active workers from Runtime and ensures they are registered.
     *
     * Returns:
     * List of discovered workers.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static syncWorkersApiDiscoveryWorkersSyncPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/discovery/workers/sync',
        });
    }
}
