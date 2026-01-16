/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for job details.
 */
export type JobResponse = {
    job_id: string;
    flow_id: string;
    status: string;
    created_at?: (number | null);
    started_at?: (number | null);
    completed_at?: (number | null);
    error?: (string | null);
};

