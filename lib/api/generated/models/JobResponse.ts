/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for job details.
 *
 * Contains all essential information about a job's current state.
 *
 * **Status Values**:
 * - `pending`: Job created but not yet started
 * - `running`: Job is currently executing
 * - `idle`: All routines are idle, waiting for data
 * - `completed`: Job finished successfully
 * - `failed`: Job failed due to an error
 * - `paused`: Job execution is paused
 * - `cancelled`: Job was cancelled
 *
 * **Timestamps**: All timestamps are Unix timestamps (seconds since epoch).
 *
 * **Example Response**:
 * ```json
 * {
     * "job_id": "550e8400-e29b-41d4-a716-446655440000",
     * "flow_id": "data_processing_flow",
     * "status": "running",
     * "created_at": 1705312800,
     * "started_at": 1705312801,
     * "completed_at": null,
     * "error": null
     * }
     * ```
     */
    export type JobResponse = {
        /**
         * Unique identifier for this job. UUID format. Use this ID for all subsequent API calls.
         */
        job_id: string;
        /**
         * The flow ID that this job is executing.
         */
        flow_id: string;
        /**
         * Current execution status of the job. Possible values: pending, running, idle, completed, failed, paused, cancelled.
         */
        status: string;
        /**
         * Unix timestamp (seconds) when the job was created.
         */
        created_at?: (number | null);
        /**
         * Unix timestamp (seconds) when the job execution started. Null if job hasn't started yet.
         */
        started_at?: (number | null);
        /**
         * Unix timestamp (seconds) when the job completed (successfully or with error). Null if job is still running or hasn't started.
         */
        completed_at?: (number | null);
        /**
         * Error message if the job failed. Null if job is successful or still running.
         */
        error?: (string | null);
    };

