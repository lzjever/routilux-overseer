/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JobResponse } from './JobResponse';
/**
 * Paginated list of Jobs.
 */
export type JobListResponse = {
    /**
     * List of jobs
     */
    jobs: Array<JobResponse>;
    /**
     * Total number of jobs matching filters
     */
    total: number;
    /**
     * Maximum jobs per page
     */
    limit?: number;
    /**
     * Number of jobs skipped
     */
    offset?: number;
};

