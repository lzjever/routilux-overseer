/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for posting data to a routine slot in a running job.
 */
export type PostToJobRequest = {
    routine_id: string;
    slot_name: string;
    data?: (Record<string, any> | null);
};

