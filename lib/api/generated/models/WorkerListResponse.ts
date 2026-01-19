/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkerResponse } from './WorkerResponse';
/**
 * Paginated list of Workers.
 */
export type WorkerListResponse = {
    /**
     * List of workers
     */
    workers: Array<WorkerResponse>;
    /**
     * Total number of workers matching filters
     */
    total: number;
    /**
     * Maximum workers per page
     */
    limit?: number;
    /**
     * Number of workers skipped
     */
    offset?: number;
};

