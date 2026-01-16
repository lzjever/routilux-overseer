/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for starting a job.
 */
export type JobStartRequest = {
    flow_id: string;
    entry_routine_id: string;
    entry_params?: (Record<string, any> | null);
    timeout?: (number | null);
};

