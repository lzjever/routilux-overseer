/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One-shot execution request.
 *
 * This endpoint creates a Worker, submits a Job, and optionally
 * waits for completion before returning.
 */
export type ExecuteRequest = {
    /**
     * Flow to execute
     */
    flow_id: string;
    /**
     * Initial routine to trigger
     */
    routine_id: string;
    /**
     * Initial slot to send data
     */
    slot_name: string;
    /**
     * Initial data to send
     */
    data?: Record<string, any>;
    /**
     * If true, wait for job completion before returning
     */
    wait?: boolean;
    /**
     * Timeout in seconds (only used if wait=true)
     */
    timeout?: number;
    /**
     * Job metadata (user_id, source, etc.)
     */
    metadata?: (Record<string, any> | null);
    /**
     * Idempotency key to prevent duplicate executions
     */
    idempotency_key?: (string | null);
};

