/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to submit a Job to a Worker.
 *
 * A Job is a single task/request that flows through the workflow.
 * If worker_id is not provided, a new Worker is created automatically.
 */
export type JobSubmitRequest = {
    /**
     * Flow ID (used to find or create Worker)
     */
    flow_id: string;
    /**
     * Target Worker ID. If None, creates new Worker.
     */
    worker_id?: (string | null);
    /**
     * Target routine to receive data
     */
    routine_id: string;
    /**
     * Target slot on the routine
     */
    slot_name: string;
    /**
     * Data to send to the slot
     */
    data?: Record<string, any>;
    /**
     * Optional custom job ID. Auto-generated if not provided.
     */
    job_id?: (string | null);
    /**
     * Job metadata (user_id, source, trace_id, etc.)
     */
    metadata?: (Record<string, any> | null);
    /**
     * Idempotency key to prevent duplicate submissions
     */
    idempotency_key?: (string | null);
};

