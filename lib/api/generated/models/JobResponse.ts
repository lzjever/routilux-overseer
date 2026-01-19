/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Job details response.
 *
 * Contains information about a single Job's execution state.
 */
export type JobResponse = {
    /**
     * Unique Job identifier
     */
    job_id: string;
    /**
     * Worker processing this Job
     */
    worker_id: string;
    /**
     * Flow being executed
     */
    flow_id: string;
    /**
     * Current status: pending|running|completed|failed
     */
    status: string;
    /**
     * Unix timestamp of creation
     */
    created_at?: (number | null);
    /**
     * Unix timestamp of start
     */
    started_at?: (number | null);
    /**
     * Unix timestamp of completion
     */
    completed_at?: (number | null);
    /**
     * Error message if failed
     */
    error?: (string | null);
    /**
     * Job metadata
     */
    metadata?: (Record<string, any> | null);
};

