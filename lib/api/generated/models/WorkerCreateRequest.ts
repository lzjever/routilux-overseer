/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to create a new Worker.
 *
 * A Worker is a long-running execution instance of a Flow.
 */
export type WorkerCreateRequest = {
    /**
     * Flow ID to instantiate as a Worker
     */
    flow_id: string;
    /**
     * Optional custom worker ID. Auto-generated if not provided.
     */
    worker_id?: (string | null);
};

