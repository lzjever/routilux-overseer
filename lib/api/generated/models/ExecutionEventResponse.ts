/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for execution event.
 */
export type ExecutionEventResponse = {
    event_id: string;
    job_id: string;
    routine_id: string;
    event_type: string;
    timestamp: string;
    data: Record<string, any>;
    duration: (number | null);
    status: (string | null);
};

