/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for starting a new job execution.
 *
 * This endpoint creates a new job and starts executing the specified flow asynchronously.
 * The job will be in RUNNING status immediately after creation, and all routines start in IDLE state,
 * waiting for external data via the post endpoint.
 *
 * **Example Request**:
 * ```json
 * {
     * "flow_id": "data_processing_flow",
     * "runtime_id": "production",
     * "timeout": 3600.0
     * }
     * ```
     *
     * **Note**: If `runtime_id` is not provided, the default runtime will be used.
     */
    export type JobStartRequest = {
        /**
         * The unique identifier of the flow to execute. Must be a registered flow ID.
         */
        flow_id: string;
        /**
         * Optional runtime ID to use for execution. If not provided, uses the default runtime. Use this to select different execution environments (e.g., 'development', 'production').
         */
        runtime_id?: (string | null);
        /**
         * Execution timeout in seconds. If not provided, uses the flow's default timeout. Maximum allowed: 86400 seconds (24 hours). When timeout is reached, the job will be automatically cancelled.
         */
        timeout?: (number | null);
    };

