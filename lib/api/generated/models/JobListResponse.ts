/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JobResponse } from './JobResponse';
/**
 * Response model for job list with pagination support.
 */
export type JobListResponse = {
    jobs: Array<JobResponse>;
    total: number;
    limit?: number;
    offset?: number;
};

