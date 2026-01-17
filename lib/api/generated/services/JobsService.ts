/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JobListResponse } from '../models/JobListResponse';
import type { JobResponse } from '../models/JobResponse';
import type { JobStartRequest } from '../models/JobStartRequest';
import type { PostToJobRequest } from '../models/PostToJobRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JobsService {
    /**
     * Start Job
     * Start a new job execution from a flow.
     *
     * **Overview**:
     * This endpoint creates a new job and starts executing the specified flow asynchronously.
     * The endpoint returns immediately with a job_id - execution happens in the background.
     * All routines in the flow start in IDLE state, waiting for external data via the post endpoint.
     *
     * **Execution Model**:
     * - Job is created with status PENDING
     * - Job immediately transitions to RUNNING
     * - All routines start in IDLE state (waiting for data)
     * - Use POST /api/jobs/{job_id}/post to send data to routine slots
     * - Job will transition to COMPLETED when all routines are idle and no more work is pending
     * - Use POST /api/jobs/{job_id}/complete to manually mark job as complete
     *
     * **Request Example**:
     * ```json
     * {
         * "flow_id": "data_processing_flow",
         * "runtime_id": "production",
         * "timeout": 3600.0
         * }
         * ```
         *
         * **Response Example**:
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
             *
             * **Error Responses**:
             * - `400 Bad Request`: Flow not found, invalid timeout, or execution failed to start
             * - `422 Validation Error`: Invalid request parameters
             *
             * **Usage Flow**:
             * 1. Create/select a flow: GET /api/flows or POST /api/flows
             * 2. Start job: POST /api/jobs (this endpoint)
             * 3. Send data to routines: POST /api/jobs/{job_id}/post
             * 4. Monitor progress: GET /api/jobs/{job_id}/status or GET /api/jobs/{job_id}/monitoring
             * 5. Complete job: POST /api/jobs/{job_id}/complete (when done)
             *
             * **Runtime Selection**:
             * - If `runtime_id` is provided, the specified runtime will be used
             * - If `runtime_id` is not provided, the default runtime will be used
             * - Use GET /api/runtimes to see available runtimes
             *
             * **Timeout Behavior**:
             * - If timeout is reached, job is automatically cancelled
             * - Timeout applies to the entire job execution
             * - Maximum timeout: 86400 seconds (24 hours)
             *
             * Args:
             * request: JobStartRequest containing flow_id, optional runtime_id, and optional timeout
             *
             * Returns:
             * JobResponse: Job details including job_id, flow_id, and initial status
             *
             * Raises:
             * HTTPException: 400 if flow not found or execution failed
             * HTTPException: 422 if request validation fails
             * @param requestBody
             * @returns JobResponse Successful Response
             * @throws ApiError
             */
            public static startJobApiJobsPost(
                requestBody: JobStartRequest,
            ): CancelablePromise<JobResponse> {
                return __request(OpenAPI, {
                    method: 'POST',
                    url: '/api/jobs',
                    body: requestBody,
                    mediaType: 'application/json',
                    errors: {
                        422: `Validation Error`,
                    },
                });
            }
            /**
             * List all jobs
             * Retrieve a paginated list of jobs with optional filters
             * @param flowId Filter jobs by flow ID. Only jobs executing this flow will be returned. Example: 'data_processing_flow'. Leave empty to get jobs from all flows.
             * @param status Filter jobs by execution status. Valid values: 'pending', 'running', 'idle', 'completed', 'failed', 'paused', 'cancelled'. Case-sensitive. Leave empty to get jobs with any status.
             * @param limit Maximum number of jobs to return in this response. Range: 1-1000. Default: 100. Use this for pagination.
             * @param offset Number of jobs to skip before returning results. Use this for pagination: offset = (page - 1) * limit. Example: Page 1 (offset=0), Page 2 (offset=100), Page 3 (offset=200).
             * @returns JobListResponse Successful Response
             * @throws ApiError
             */
            public static listJobsApiJobsGet(
                flowId?: (string | null),
                status?: (string | null),
                limit: number = 100,
                offset?: number,
            ): CancelablePromise<JobListResponse> {
                return __request(OpenAPI, {
                    method: 'GET',
                    url: '/api/jobs',
                    query: {
                        'flow_id': flowId,
                        'status': status,
                        'limit': limit,
                        'offset': offset,
                    },
                    errors: {
                        422: `Validation Error`,
                    },
                });
            }
            /**
             * Get Job
             * Get detailed information about a specific job.
             *
             * **Overview**:
             * Returns complete information about a job including its current status, timestamps, and error information.
             *
             * **Response Fields**:
             * - `job_id`: Unique identifier (use this for all job operations)
             * - `flow_id`: The flow being executed
             * - `status`: Current execution status
             * - `created_at`: When job was created (Unix timestamp)
             * - `started_at`: When execution started (Unix timestamp, null if not started)
             * - `completed_at`: When execution completed (Unix timestamp, null if still running)
             * - `error`: Error message if job failed (null if successful or still running)
             *
             * **Request Example**:
             * ```
             * GET /api/jobs/550e8400-e29b-41d4-a716-446655440000
             * ```
             *
             * **Response Example**:
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
                 *
                 * **Status Interpretation**:
                 * - `running`: Job is actively executing. Check routine status for details.
                 * - `idle`: All routines are idle. Send data via POST /api/jobs/{job_id}/post to continue.
                 * - `completed`: Job finished successfully. Check completed_at timestamp.
                 * - `failed`: Job failed. Check error field for details.
                 * - `paused`: Job execution is paused. Use POST /api/jobs/{job_id}/resume to continue.
                 * - `cancelled`: Job was cancelled. Cannot be resumed.
                 *
                 * **Error Responses**:
                 * - `404 Not Found`: Job with this ID does not exist
                 *
                 * **Related Endpoints**:
                 * - GET /api/jobs/{job_id}/status - Get only status (lighter weight)
                 * - GET /api/jobs/{job_id}/monitoring - Get complete monitoring data
                 * - GET /api/jobs/{job_id}/state - Get full serialized job state
                 *
                 * Args:
                 * job_id: Unique job identifier (UUID format)
                 *
                 * Returns:
                 * JobResponse: Complete job information
                 *
                 * Raises:
                 * HTTPException: 404 if job not found
                 * HTTPException: 422 if job_id format is invalid
                 * @param jobId
                 * @returns JobResponse Successful Response
                 * @throws ApiError
                 */
                public static getJobApiJobsJobIdGet(
                    jobId: string,
                ): CancelablePromise<JobResponse> {
                    return __request(OpenAPI, {
                        method: 'GET',
                        url: '/api/jobs/{job_id}',
                        path: {
                            'job_id': jobId,
                        },
                        errors: {
                            422: `Validation Error`,
                        },
                    });
                }
                /**
                 * Post To Job
                 * Post data to a routine's input slot in a running or paused job.
                 *
                 * **Overview**:
                 * This is the primary mechanism for triggering routine execution in Routilux.
                 * In the new architecture, all routines start in IDLE state and wait for external data.
                 * Use this endpoint to send data to a routine's input slot, which will trigger execution
                 * according to the routine's activation policy.
                 *
                 * **When to Use**:
                 * - Job is in RUNNING or PAUSED status
                 * - You want to send data to a routine's input slot
                 * - You want to trigger routine execution
                 * - You're implementing an interactive workflow
                 *
                 * **Execution Flow**:
                 * 1. Data is queued in the routine's slot
                 * 2. Routine's activation policy is checked
                 * 3. If policy conditions are met, routine executes
                 * 4. Routine emits events to connected slots
                 * 5. Process continues downstream
                 *
                 * **Request Example**:
                 * ```json
                 * {
                     * "routine_id": "data_source",
                     * "slot_name": "trigger",
                     * "data": {
                         * "input": "test_data",
                         * "index": 1,
                         * "metadata": {
                             * "source": "api",
                             * "timestamp": "2025-01-15T10:00:00Z"
                             * }
                             * }
                             * }
                             * ```
                             *
                             * **Response Example**:
                             * ```json
                             * {
                                 * "status": "posted",
                                 * "job_id": "550e8400-e29b-41d4-a716-446655440000"
                                 * }
                                 * ```
                                 *
                                 * **Data Format**:
                                 * - `data` can be any JSON-serializable object
                                 * - If `data` is null or not provided, an empty dictionary `{}` is sent
                                 * - The data structure should match what the routine expects
                                 * - Use GET /api/factory/objects/{name}/interface to discover expected data format
                                 *
                                 * **Activation Policies**:
                                 * - **Immediate**: Routine executes as soon as data arrives
                                 * - **Batch Size**: Routine waits for N items before executing
                                 * - **All Slots Ready**: Routine waits for all input slots to have data
                                 * - **Time Interval**: Routine executes at most once per time interval
                                 *
                                 * **Error Responses**:
                                 * - `404 Not Found`: Job, flow, routine, or slot not found
                                 * - `409 Conflict`: Job is not in RUNNING or PAUSED status
                                 * - `400 Bad Request`: Invalid data format or routine configuration
                                 * - `422 Validation Error`: Invalid request parameters
                                 *
                                 * **Best Practices**:
                                 * 1. Check job status before posting: GET /api/jobs/{job_id}/status
                                 * 2. Verify routine and slot exist: GET /api/flows/{flow_id}/routines
                                 * 3. Use consistent data format across posts
                                 * 4. Monitor queue status: GET /api/jobs/{job_id}/routines/{routine_id}/queue-status
                                 * 5. Handle errors gracefully (job might complete/fail between status check and post)
                                 *
                                 * **Concurrent Posting**:
                                 * - Multiple posts to the same slot are queued safely
                                 * - Posts to different slots/routines can happen concurrently
                                 * - Queue pressure is monitored automatically
                                 *
                                 * Args:
                                 * job_id: Unique job identifier
                                 * request: PostToJobRequest containing routine_id, slot_name, and optional data
                                 *
                                 * Returns:
                                 * dict: Status confirmation with job_id
                                 *
                                 * Raises:
                                 * HTTPException: 404 if job, flow, routine, or slot not found
                                 * HTTPException: 409 if job is not in RUNNING or PAUSED status
                                 * HTTPException: 400 if data format is invalid
                                 * HTTPException: 422 if request validation fails
                                 * @param jobId
                                 * @param requestBody
                                 * @returns any Successful Response
                                 * @throws ApiError
                                 */
                                public static postToJobApiJobsJobIdPostPost(
                                    jobId: string,
                                    requestBody: PostToJobRequest,
                                ): CancelablePromise<any> {
                                    return __request(OpenAPI, {
                                        method: 'POST',
                                        url: '/api/jobs/{job_id}/post',
                                        path: {
                                            'job_id': jobId,
                                        },
                                        body: requestBody,
                                        mediaType: 'application/json',
                                        errors: {
                                            422: `Validation Error`,
                                        },
                                    });
                                }
                                /**
                                 * Pause Job
                                 * Pause job execution.
                                 *
                                 * **Overview**:
                                 * Pauses a running job, stopping all routine execution. The job state is preserved,
                                 * allowing you to resume execution later. Paused jobs can receive data via POST endpoint,
                                 * but routines will not execute until the job is resumed.
                                 *
                                 * **When to Use**:
                                 * - You need to temporarily stop execution for debugging
                                 * - You want to inspect job state without it changing
                                 * - You need to modify the flow before continuing
                                 * - You're implementing a manual approval step
                                 *
                                 * **Behavior**:
                                 * - Job status changes to PAUSED
                                 * - Currently executing routines complete their current task
                                 * - New routine activations are blocked
                                 * - Job state is preserved (can be resumed)
                                 * - Data can still be posted to slots (queued, not processed)
                                 *
                                 * **Request Example**:
                                 * ```
                                 * POST /api/jobs/550e8400-e29b-41d4-a716-446655440000/pause
                                 * ```
                                 *
                                 * **Response Example**:
                                 * ```json
                                 * {
                                     * "status": "paused",
                                     * "job_id": "550e8400-e29b-41d4-a716-446655440000"
                                     * }
                                     * ```
                                     *
                                     * **Resuming**:
                                     * - Use POST /api/jobs/{job_id}/resume to continue execution
                                     * - Queued data will be processed when resumed
                                     * - Execution continues from where it was paused
                                     *
                                     * **Error Responses**:
                                     * - `404 Not Found`: Job or flow not found
                                     * - `400 Bad Request`: Failed to pause (e.g., job already paused or completed)
                                     *
                                     * **Related Endpoints**:
                                     * - POST /api/jobs/{job_id}/resume - Resume paused job
                                     * - POST /api/jobs/{job_id}/cancel - Cancel job (cannot be resumed)
                                     * - GET /api/jobs/{job_id}/status - Check current status
                                     *
                                     * Args:
                                     * job_id: Unique job identifier
                                     *
                                     * Returns:
                                     * dict: Status confirmation with job_id
                                     *
                                     * Raises:
                                     * HTTPException: 404 if job or flow not found
                                     * HTTPException: 400 if pause operation fails
                                     * @param jobId
                                     * @returns any Successful Response
                                     * @throws ApiError
                                     */
                                    public static pauseJobApiJobsJobIdPausePost(
                                        jobId: string,
                                    ): CancelablePromise<any> {
                                        return __request(OpenAPI, {
                                            method: 'POST',
                                            url: '/api/jobs/{job_id}/pause',
                                            path: {
                                                'job_id': jobId,
                                            },
                                            errors: {
                                                422: `Validation Error`,
                                            },
                                        });
                                    }
                                    /**
                                     * Resume Job
                                     * Resume execution of a paused job.
                                     *
                                     * **Overview**:
                                     * Resumes a paused job, allowing routine execution to continue. All queued data
                                     * in slots will be processed according to each routine's activation policy.
                                     *
                                     * **When to Use**:
                                     * - Job is in PAUSED status
                                     * - You've finished debugging or inspection
                                     * - You want to continue execution after a manual step
                                     * - You've modified the flow and want to continue
                                     *
                                     * **Behavior**:
                                     * - Job status changes from PAUSED to RUNNING
                                     * - Queued data in slots is processed
                                     * - Routines resume execution based on activation policies
                                     * - Execution continues from where it was paused
                                     *
                                     * **Request Example**:
                                     * ```
                                     * POST /api/jobs/550e8400-e29b-41d4-a716-446655440000/resume
                                     * ```
                                     *
                                     * **Response Example**:
                                     * ```json
                                     * {
                                         * "status": "resumed",
                                         * "job_id": "550e8400-e29b-41d4-a716-446655440000"
                                         * }
                                         * ```
                                         *
                                         * **Error Responses**:
                                         * - `404 Not Found`: Job or flow not found
                                         * - `409 Conflict`: Job is not paused (cannot resume a running/completed job)
                                         * - `400 Bad Request`: Failed to resume (e.g., job executor not available)
                                         *
                                         * **Note**: You can only resume jobs that are in PAUSED status. Jobs that are
                                         * COMPLETED, FAILED, or CANCELLED cannot be resumed.
                                         *
                                         * **Related Endpoints**:
                                         * - POST /api/jobs/{job_id}/pause - Pause a running job
                                         * - GET /api/jobs/{job_id}/status - Check current status
                                         *
                                         * Args:
                                         * job_id: Unique job identifier
                                         *
                                         * Returns:
                                         * dict: Status confirmation with job_id
                                         *
                                         * Raises:
                                         * HTTPException: 404 if job or flow not found
                                         * HTTPException: 409 if job is not paused
                                         * HTTPException: 400 if resume operation fails
                                         * @param jobId
                                         * @returns any Successful Response
                                         * @throws ApiError
                                         */
                                        public static resumeJobApiJobsJobIdResumePost(
                                            jobId: string,
                                        ): CancelablePromise<any> {
                                            return __request(OpenAPI, {
                                                method: 'POST',
                                                url: '/api/jobs/{job_id}/resume',
                                                path: {
                                                    'job_id': jobId,
                                                },
                                                errors: {
                                                    422: `Validation Error`,
                                                },
                                            });
                                        }
                                        /**
                                         * Cancel Job
                                         * Cancel job execution.
                                         *
                                         * **Overview**:
                                         * Cancels a running or paused job, stopping all execution immediately.
                                         * Cancelled jobs cannot be resumed - this is a permanent action.
                                         *
                                         * **When to Use**:
                                         * - Job is taking too long and you want to stop it
                                         * - Job is in an error state and you want to abort
                                         * - You no longer need the job results
                                         * - You want to free up resources
                                         *
                                         * **Behavior**:
                                         * - Job status changes to CANCELLED
                                         * - All active routine executions are stopped
                                         * - Event loop is terminated
                                         * - Job state is preserved (for inspection)
                                         * - Job cannot be resumed (use a new job if needed)
                                         *
                                         * **Request Example**:
                                         * ```
                                         * POST /api/jobs/550e8400-e29b-41d4-a716-446655440000/cancel
                                         * ```
                                         *
                                         * **Response Example**:
                                         * ```json
                                         * {
                                             * "status": "cancelled",
                                             * "job_id": "550e8400-e29b-41d4-a716-446655440000"
                                             * }
                                             * ```
                                             *
                                             * **Error Responses**:
                                             * - `404 Not Found`: Job or flow not found
                                             * - `400 Bad Request`: Failed to cancel (e.g., job already completed)
                                             *
                                             * **Note**: Cancelled jobs are still visible in the job list and can be queried,
                                             * but they cannot be resumed or restarted. Create a new job if you need to
                                             * re-execute the flow.
                                             *
                                             * **Related Endpoints**:
                                             * - POST /api/jobs/{job_id}/pause - Pause job (can be resumed)
                                             * - GET /api/jobs/{job_id}/status - Check current status
                                             *
                                             * Args:
                                             * job_id: Unique job identifier
                                             *
                                             * Returns:
                                             * dict: Status confirmation with job_id
                                             *
                                             * Raises:
                                             * HTTPException: 404 if job or flow not found
                                             * HTTPException: 400 if cancel operation fails
                                             * @param jobId
                                             * @returns any Successful Response
                                             * @throws ApiError
                                             */
                                            public static cancelJobApiJobsJobIdCancelPost(
                                                jobId: string,
                                            ): CancelablePromise<any> {
                                                return __request(OpenAPI, {
                                                    method: 'POST',
                                                    url: '/api/jobs/{job_id}/cancel',
                                                    path: {
                                                        'job_id': jobId,
                                                    },
                                                    errors: {
                                                        422: `Validation Error`,
                                                    },
                                                });
                                            }
                                            /**
                                             * Get Job Status
                                             * Get current status of a job (lightweight endpoint).
                                             *
                                             * **Overview**:
                                             * Returns only the essential status information about a job. This is a lightweight
                                             * endpoint optimized for frequent polling. For complete job details, use GET /api/jobs/{job_id}.
                                             *
                                             * **Use Cases**:
                                             * - Polling job status in a UI (lightweight, fast)
                                             * - Checking if job is still running before posting data
                                             * - Quick status checks without full job details
                                             *
                                             * **Request Example**:
                                             * ```
                                             * GET /api/jobs/550e8400-e29b-41d4-a716-446655440000/status
                                             * ```
                                             *
                                             * **Response Example**:
                                             * ```json
                                             * {
                                                 * "job_id": "550e8400-e29b-41d4-a716-446655440000",
                                                 * "status": "running",
                                                 * "flow_id": "data_processing_flow"
                                                 * }
                                                 * ```
                                                 *
                                                 * **Status Values**:
                                                 * - `pending`: Job created but not started
                                                 * - `running`: Job is executing
                                                 * - `idle`: All routines idle, waiting for data
                                                 * - `completed`: Job finished successfully
                                                 * - `failed`: Job failed with error
                                                 * - `paused`: Job execution paused
                                                 * - `cancelled`: Job was cancelled
                                                 *
                                                 * **Polling Recommendations**:
                                                 * - Use reasonable polling intervals (e.g., 1-5 seconds)
                                                 * - Stop polling when status is `completed`, `failed`, or `cancelled`
                                                 * - Consider using WebSocket for real-time updates: WS /api/ws/jobs/{job_id}/monitor
                                                 *
                                                 * **Error Responses**:
                                                 * - `404 Not Found`: Job not found
                                                 *
                                                 * **Related Endpoints**:
                                                 * - GET /api/jobs/{job_id} - Get complete job details
                                                 * - GET /api/jobs/{job_id}/monitoring - Get full monitoring data
                                                 * - WS /api/ws/jobs/{job_id}/monitor - Real-time status updates
                                                 *
                                                 * Args:
                                                 * job_id: Unique job identifier
                                                 *
                                                 * Returns:
                                                 * dict: Job ID, status, and flow ID
                                                 *
                                                 * Raises:
                                                 * HTTPException: 404 if job not found
                                                 * @param jobId
                                                 * @returns any Successful Response
                                                 * @throws ApiError
                                                 */
                                                public static getJobStatusApiJobsJobIdStatusGet(
                                                    jobId: string,
                                                ): CancelablePromise<any> {
                                                    return __request(OpenAPI, {
                                                        method: 'GET',
                                                        url: '/api/jobs/{job_id}/status',
                                                        path: {
                                                            'job_id': jobId,
                                                        },
                                                        errors: {
                                                            422: `Validation Error`,
                                                        },
                                                    });
                                                }
                                                /**
                                                 * Get Job State
                                                 * Get complete serialized job state.
                                                 *
                                                 * **Overview**:
                                                 * Returns the full serialized state of a job, including all routine states, execution history,
                                                 * shared data, and internal state. This is useful for debugging, state inspection, or
                                                 * implementing state persistence/resumption.
                                                 *
                                                 * **Warning**: This endpoint returns a large amount of data. Use only when you need complete state.
                                                 * For most use cases, use GET /api/jobs/{job_id} or GET /api/jobs/{job_id}/monitoring instead.
                                                 *
                                                 * **Response Structure**:
                                                 * The response is a complete serialization of the JobState object, including:
                                                 * - `job_id`: Unique identifier
                                                 * - `flow_id`: Flow being executed
                                                 * - `status`: Current status
                                                 * - `routine_states`: State for each routine (Dict[routine_id, state])
                                                 * - `execution_history`: Complete execution history (List[ExecutionRecord])
                                                 * - `shared_data`: Shared data dictionary
                                                 * - `shared_log`: Execution log entries
                                                 * - `created_at`, `started_at`, `completed_at`: Timestamps
                                                 * - `error`, `error_traceback`: Error information if failed
                                                 * - And more internal state fields
                                                 *
                                                 * **Request Example**:
                                                 * ```
                                                 * GET /api/jobs/550e8400-e29b-41d4-a716-446655440000/state
                                                 * ```
                                                 *
                                                 * **Response Example** (simplified):
                                                 * ```json
                                                 * {
                                                     * "job_id": "550e8400-e29b-41d4-a716-446655440000",
                                                     * "flow_id": "data_processing_flow",
                                                     * "status": "running",
                                                     * "routine_states": {
                                                         * "data_source": {
                                                             * "counter": 5,
                                                             * "status": "completed"
                                                             * },
                                                             * "processor": {
                                                                 * "processed_count": 3,
                                                                 * "status": "running"
                                                                 * }
                                                                 * },
                                                                 * "execution_history": [...],
                                                                 * "shared_data": {
                                                                     * "total_processed": 8
                                                                     * },
                                                                     * "shared_log": [...],
                                                                     * "created_at": "2025-01-15T10:00:00",
                                                                     * "started_at": "2025-01-15T10:00:01",
                                                                     * "completed_at": null,
                                                                     * "error": null
                                                                     * }
                                                                     * ```
                                                                     *
                                                                     * **Use Cases**:
                                                                     * - Debugging: Inspect complete job state
                                                                     * - State persistence: Save state for later resumption
                                                                     * - Analysis: Analyze execution patterns
                                                                     * - Troubleshooting: Understand job behavior
                                                                     *
                                                                     * **Performance Note**:
                                                                     * - This endpoint can return large responses for long-running jobs
                                                                     * - Execution history may be truncated (default limit: 1000 records)
                                                                     * - Consider using GET /api/jobs/{job_id}/execution-history for just history
                                                                     *
                                                                     * **Error Responses**:
                                                                     * - `404 Not Found`: Job not found
                                                                     *
                                                                     * **Related Endpoints**:
                                                                     * - GET /api/jobs/{job_id} - Get job summary (lighter)
                                                                     * - GET /api/jobs/{job_id}/execution-history - Get just execution history
                                                                     * - GET /api/jobs/{job_id}/monitoring - Get monitoring data (structured)
                                                                     *
                                                                     * Args:
                                                                     * job_id: Unique job identifier
                                                                     *
                                                                     * Returns:
                                                                     * dict: Complete serialized job state
                                                                     *
                                                                     * Raises:
                                                                     * HTTPException: 404 if job not found
                                                                     * @param jobId
                                                                     * @returns any Successful Response
                                                                     * @throws ApiError
                                                                     */
                                                                    public static getJobStateApiJobsJobIdStateGet(
                                                                        jobId: string,
                                                                    ): CancelablePromise<any> {
                                                                        return __request(OpenAPI, {
                                                                            method: 'GET',
                                                                            url: '/api/jobs/{job_id}/state',
                                                                            path: {
                                                                                'job_id': jobId,
                                                                            },
                                                                            errors: {
                                                                                422: `Validation Error`,
                                                                            },
                                                                        });
                                                                    }
                                                                    /**
                                                                     * Complete Job
                                                                     * Manually mark a job as completed.
                                                                     *
                                                                     * **Overview**:
                                                                     * Manually completes a job that is in IDLE or RUNNING status. This is useful when:
                                                                     * - All work is done but the job is still in IDLE state
                                                                     * - You want to explicitly mark the job as complete
                                                                     * - The job is waiting but you've confirmed all processing is finished
                                                                     *
                                                                     * **When to Use**:
                                                                     * - Job is in IDLE status and you've confirmed all work is done
                                                                     * - Job is in RUNNING status but you want to force completion
                                                                     * - Implementing manual approval workflows
                                                                     * - Testing and development scenarios
                                                                     *
                                                                     * **Behavior**:
                                                                     * - Job status changes to COMPLETED
                                                                     * - `completed_at` timestamp is set
                                                                     * - Event loop is stopped
                                                                     * - All routine execution stops
                                                                     * - Job cannot be resumed (create new job if needed)
                                                                     *
                                                                     * **Request Example**:
                                                                     * ```
                                                                     * POST /api/jobs/550e8400-e29b-41d4-a716-446655440000/complete?reason=All%20processing%20finished
                                                                     * ```
                                                                     *
                                                                     * **Response Example**:
                                                                     * ```json
                                                                     * {
                                                                         * "status": "completed",
                                                                         * "job_id": "550e8400-e29b-41d4-a716-446655440000",
                                                                         * "reason": "All processing finished"
                                                                         * }
                                                                         * ```
                                                                         *
                                                                         * **Error Responses**:
                                                                         * - `404 Not Found`: Job not found
                                                                         * - `400 Bad Request`: Job is already in a terminal state (completed/failed/cancelled)
                                                                         *
                                                                         * **Note**: This is different from automatic completion. Automatic completion happens
                                                                         * when all routines are idle and no more work is pending. This endpoint allows you
                                                                         * to manually trigger completion.
                                                                         *
                                                                         * **Related Endpoints**:
                                                                         * - POST /api/jobs/{job_id}/fail - Mark job as failed
                                                                         * - GET /api/jobs/{job_id}/status - Check current status
                                                                         *
                                                                         * Args:
                                                                         * job_id: Unique job identifier
                                                                         * reason: Optional reason for completion (for logging/audit)
                                                                         *
                                                                         * Returns:
                                                                         * dict: Status confirmation with job_id and reason
                                                                         *
                                                                         * Raises:
                                                                         * HTTPException: 404 if job not found
                                                                         * HTTPException: 400 if job is in terminal state
                                                                         * @param jobId
                                                                         * @param reason Optional reason for completion
                                                                         * @returns any Successful Response
                                                                         * @throws ApiError
                                                                         */
                                                                        public static completeJobApiJobsJobIdCompletePost(
                                                                            jobId: string,
                                                                            reason?: (string | null),
                                                                        ): CancelablePromise<any> {
                                                                            return __request(OpenAPI, {
                                                                                method: 'POST',
                                                                                url: '/api/jobs/{job_id}/complete',
                                                                                path: {
                                                                                    'job_id': jobId,
                                                                                },
                                                                                query: {
                                                                                    'reason': reason,
                                                                                },
                                                                                errors: {
                                                                                    422: `Validation Error`,
                                                                                },
                                                                            });
                                                                        }
                                                                        /**
                                                                         * Fail Job
                                                                         * Manually mark a job as failed.
                                                                         *
                                                                         * **Overview**:
                                                                         * Manually marks a job as failed with an optional error message. This is useful when:
                                                                         * - External system detects an error condition
                                                                         * - Manual intervention determines the job should fail
                                                                         * - Testing error handling scenarios
                                                                         *
                                                                         * **When to Use**:
                                                                         * - External validation fails
                                                                         * - Manual review determines job should fail
                                                                         * - Implementing error workflows
                                                                         * - Testing error scenarios
                                                                         *
                                                                         * **Behavior**:
                                                                         * - Job status changes to FAILED
                                                                         * - Error message is stored in job_state.error
                                                                         * - Error is also stored in shared_data["error"]
                                                                         * - Job execution stops
                                                                         * - Job cannot be resumed (create new job if needed)
                                                                         *
                                                                         * **Request Example**:
                                                                         * ```
                                                                         * POST /api/jobs/550e8400-e29b-41d4-a716-446655440000/fail?error=External%20validation%20failed
                                                                         * ```
                                                                         *
                                                                         * **Response Example**:
                                                                         * ```json
                                                                         * {
                                                                             * "status": "failed",
                                                                             * "job_id": "550e8400-e29b-41d4-a716-446655440000",
                                                                             * "error": "External validation failed"
                                                                             * }
                                                                             * ```
                                                                             *
                                                                             * **Error Responses**:
                                                                             * - `404 Not Found`: Job not found
                                                                             * - `400 Bad Request`: Job is already in a terminal state
                                                                             *
                                                                             * **Related Endpoints**:
                                                                             * - POST /api/jobs/{job_id}/complete - Mark job as completed
                                                                             * - GET /api/jobs/{job_id} - Get job details (includes error field)
                                                                             *
                                                                             * Args:
                                                                             * job_id: Unique job identifier
                                                                             * error: Optional error message describing the failure
                                                                             *
                                                                             * Returns:
                                                                             * dict: Status confirmation with job_id and error message
                                                                             *
                                                                             * Raises:
                                                                             * HTTPException: 404 if job not found
                                                                             * HTTPException: 400 if job is in terminal state
                                                                             * @param jobId
                                                                             * @param error Error message describing the failure
                                                                             * @returns any Successful Response
                                                                             * @throws ApiError
                                                                             */
                                                                            public static failJobApiJobsJobIdFailPost(
                                                                                jobId: string,
                                                                                error?: (string | null),
                                                                            ): CancelablePromise<any> {
                                                                                return __request(OpenAPI, {
                                                                                    method: 'POST',
                                                                                    url: '/api/jobs/{job_id}/fail',
                                                                                    path: {
                                                                                        'job_id': jobId,
                                                                                    },
                                                                                    query: {
                                                                                        'error': error,
                                                                                    },
                                                                                    errors: {
                                                                                        422: `Validation Error`,
                                                                                    },
                                                                                });
                                                                            }
                                                                            /**
                                                                             * Wait For Job
                                                                             * Wait for a job to complete (blocking endpoint).
                                                                             *
                                                                             * **Overview**:
                                                                             * Blocks until the job reaches a terminal state (completed, failed, or cancelled),
                                                                             * or until the timeout is reached. This is useful for synchronous workflows where
                                                                             * you need to wait for job completion before proceeding.
                                                                             *
                                                                             * **When to Use**:
                                                                             * - Synchronous workflows
                                                                             * - Scripts that need to wait for completion
                                                                             * - Testing scenarios
                                                                             * - Simple automation
                                                                             *
                                                                             * **Behavior**:
                                                                             * - Blocks the request until job completes or timeout
                                                                             * - Polls job status at regular intervals
                                                                             * - Returns immediately if job is already in terminal state
                                                                             * - Returns timeout status if timeout is reached
                                                                             *
                                                                             * **Request Example**:
                                                                             * ```
                                                                             * POST /api/jobs/550e8400-e29b-41d4-a716-446655440000/wait?timeout=120
                                                                             * ```
                                                                             *
                                                                             * **Response Example (Completed)**:
                                                                             * ```json
                                                                             * {
                                                                                 * "status": "completed",
                                                                                 * "job_id": "550e8400-e29b-41d4-a716-446655440000",
                                                                                 * "final_status": "completed",
                                                                                 * "waited_seconds": 45.2
                                                                                 * }
                                                                                 * ```
                                                                                 *
                                                                                 * **Response Example (Timeout)**:
                                                                                 * ```json
                                                                                 * {
                                                                                     * "status": "timeout",
                                                                                     * "job_id": "550e8400-e29b-41d4-a716-446655440000",
                                                                                     * "final_status": "running",
                                                                                     * "waited_seconds": 120.0,
                                                                                     * "message": "Job did not complete within timeout period"
                                                                                     * }
                                                                                     * ```
                                                                                     *
                                                                                     * **Timeout Behavior**:
                                                                                     * - If timeout is reached, returns with status "timeout"
                                                                                     * - Job continues running (not cancelled)
                                                                                     * - You can call this endpoint again to wait more
                                                                                     *
                                                                                     * **Performance Note**:
                                                                                     * - This endpoint blocks the HTTP connection
                                                                                     * - Use for scripts/automation, not for interactive UIs
                                                                                     * - For UIs, use polling: GET /api/jobs/{job_id}/status
                                                                                     * - For real-time updates, use WebSocket: WS /api/ws/jobs/{job_id}/monitor
                                                                                     *
                                                                                     * **Error Responses**:
                                                                                     * - `404 Not Found`: Job not found
                                                                                     * - `422 Validation Error`: Invalid timeout value
                                                                                     *
                                                                                     * **Related Endpoints**:
                                                                                     * - GET /api/jobs/{job_id}/status - Non-blocking status check
                                                                                     * - WS /api/ws/jobs/{job_id}/monitor - Real-time status updates
                                                                                     *
                                                                                     * Args:
                                                                                     * job_id: Unique job identifier
                                                                                     * timeout: Maximum time to wait in seconds (1-3600, default: 60)
                                                                                     *
                                                                                     * Returns:
                                                                                     * dict: Final status and wait duration
                                                                                     *
                                                                                     * Raises:
                                                                                     * HTTPException: 404 if job not found
                                                                                     * HTTPException: 422 if timeout is invalid
                                                                                     * @param jobId
                                                                                     * @param timeout Maximum time to wait in seconds. Range: 1-3600. Default: 60 seconds.
                                                                                     * @returns any Successful Response
                                                                                     * @throws ApiError
                                                                                     */
                                                                                    public static waitForJobApiJobsJobIdWaitPost(
                                                                                        jobId: string,
                                                                                        timeout?: (number | null),
                                                                                    ): CancelablePromise<any> {
                                                                                        return __request(OpenAPI, {
                                                                                            method: 'POST',
                                                                                            url: '/api/jobs/{job_id}/wait',
                                                                                            path: {
                                                                                                'job_id': jobId,
                                                                                            },
                                                                                            query: {
                                                                                                'timeout': timeout,
                                                                                            },
                                                                                            errors: {
                                                                                                422: `Validation Error`,
                                                                                            },
                                                                                        });
                                                                                    }
                                                                                    /**
                                                                                     * Get Execution History
                                                                                     * Get execution history for a job.
                                                                                     *
                                                                                     * **Overview**:
                                                                                     * Returns a formatted list of execution records showing the complete execution history
                                                                                     * of a job. Each record represents a routine execution, event emission, or slot call.
                                                                                     *
                                                                                     * **Use Cases**:
                                                                                     * - Debugging: Understand execution flow
                                                                                     * - Analysis: Analyze execution patterns
                                                                                     * - Audit: Track what happened during execution
                                                                                     * - Troubleshooting: Identify where errors occurred
                                                                                     *
                                                                                     * **Request Examples**:
                                                                                     * ```
                                                                                     * # Get all execution history
                                                                                     * GET /api/jobs/job-123/execution-history
                                                                                     *
                                                                                     * # Get history for a specific routine
                                                                                     * GET /api/jobs/job-123/execution-history?routine_id=data_processor
                                                                                     *
                                                                                     * # Get last 100 records
                                                                                     * GET /api/jobs/job-123/execution-history?limit=100
                                                                                     * ```
                                                                                     *
                                                                                     * **Response Example**:
                                                                                     * ```json
                                                                                     * {
                                                                                         * "job_id": "job-123",
                                                                                         * "routine_id": null,
                                                                                         * "history": [
                                                                                             * {
                                                                                                 * "routine_id": "data_source",
                                                                                                 * "event_name": "output",
                                                                                                 * "timestamp": "2025-01-15T10:00:00.100Z",
                                                                                                 * "data": {
                                                                                                     * "data": "test_data",
                                                                                                     * "index": 1
                                                                                                     * },
                                                                                                     * "status": "completed"
                                                                                                     * },
                                                                                                     * {
                                                                                                         * "routine_id": "data_processor",
                                                                                                         * "event_name": "slot_call",
                                                                                                         * "timestamp": "2025-01-15T10:00:05.200Z",
                                                                                                         * "data": {
                                                                                                             * "slot": "input",
                                                                                                             * "data": {"data": "test_data", "index": 1}
                                                                                                             * },
                                                                                                             * "status": "completed"
                                                                                                             * }
                                                                                                             * ],
                                                                                                             * "total": 2
                                                                                                             * }
                                                                                                             * ```
                                                                                                             *
                                                                                                             * **Record Types**:
                                                                                                             * - `routine_start`: Routine execution started
                                                                                                             * - `routine_end`: Routine execution ended
                                                                                                             * - `slot_call`: Data received in a slot
                                                                                                             * - `event_emit`: Event emitted from a routine
                                                                                                             *
                                                                                                             * **Performance Note**:
                                                                                                             * - Execution history can be large for long-running jobs
                                                                                                             * - Default limit in JobState is 1000 records
                                                                                                             * - Use `limit` parameter to control response size
                                                                                                             * - Consider using GET /api/jobs/{job_id}/trace for structured trace data
                                                                                                             *
                                                                                                             * **Error Responses**:
                                                                                                             * - `404 Not Found`: Job not found
                                                                                                             *
                                                                                                             * **Related Endpoints**:
                                                                                                             * - GET /api/jobs/{job_id}/trace - Get structured execution trace
                                                                                                             * - GET /api/jobs/{job_id}/state - Get complete job state (includes history)
                                                                                                             *
                                                                                                             * Args:
                                                                                                             * job_id: Unique job identifier
                                                                                                             * routine_id: Optional routine ID filter
                                                                                                             * limit: Maximum number of records to return
                                                                                                             *
                                                                                                             * Returns:
                                                                                                             * dict: Execution history with total count
                                                                                                             *
                                                                                                             * Raises:
                                                                                                             * HTTPException: 404 if job not found
                                                                                                             * HTTPException: 422 if parameters are invalid
                                                                                                             * @param jobId
                                                                                                             * @param routineId Optional routine ID filter. If provided, only execution records for this routine are returned.
                                                                                                             * @param limit Maximum number of execution records to return. Range: 1-10000. If not provided, returns all records (may be large). Records are returned in chronological order (oldest first).
                                                                                                             * @returns any Successful Response
                                                                                                             * @throws ApiError
                                                                                                             */
                                                                                                            public static getExecutionHistoryApiJobsJobIdExecutionHistoryGet(
                                                                                                                jobId: string,
                                                                                                                routineId?: (string | null),
                                                                                                                limit?: (number | null),
                                                                                                            ): CancelablePromise<any> {
                                                                                                                return __request(OpenAPI, {
                                                                                                                    method: 'GET',
                                                                                                                    url: '/api/jobs/{job_id}/execution-history',
                                                                                                                    path: {
                                                                                                                        'job_id': jobId,
                                                                                                                    },
                                                                                                                    query: {
                                                                                                                        'routine_id': routineId,
                                                                                                                        'limit': limit,
                                                                                                                    },
                                                                                                                    errors: {
                                                                                                                        422: `Validation Error`,
                                                                                                                    },
                                                                                                                });
                                                                                                            }
                                                                                                            /**
                                                                                                             * Cleanup Jobs
                                                                                                             * Clean up old jobs from the system.
                                                                                                             *
                                                                                                             * **Overview**:
                                                                                                             * Removes jobs that are older than the specified age, optionally filtered by status.
                                                                                                             * This is useful for maintaining system performance and freeing up storage space.
                                                                                                             *
                                                                                                             * **When to Use**:
                                                                                                             * - Regular maintenance (e.g., daily cleanup of completed jobs)
                                                                                                             * - Free up storage space
                                                                                                             * - Remove old failed jobs
                                                                                                             * - Clean up test jobs
                                                                                                             *
                                                                                                             * **Safety**:
                                                                                                             * - Only removes jobs older than max_age_hours
                                                                                                             * - Can filter by status to preserve important jobs
                                                                                                             * - Returns count of removed jobs for confirmation
                                                                                                             * - Operation is logged for audit purposes
                                                                                                             *
                                                                                                             * **Request Examples**:
                                                                                                             * ```
                                                                                                             * # Remove all jobs older than 24 hours
                                                                                                             * POST /api/jobs/cleanup?max_age_hours=24
                                                                                                             *
                                                                                                             * # Remove only completed/failed jobs older than 7 days
                                                                                                             * POST /api/jobs/cleanup?max_age_hours=168&status=completed&status=failed
                                                                                                             *
                                                                                                             * # Remove all old jobs (any status) older than 30 days
                                                                                                             * POST /api/jobs/cleanup?max_age_hours=720
                                                                                                             * ```
                                                                                                             *
                                                                                                             * **Response Example**:
                                                                                                             * ```json
                                                                                                             * {
                                                                                                                 * "removed_count": 45,
                                                                                                                 * "max_age_hours": 24,
                                                                                                                 * "status_filter": ["completed", "failed"]
                                                                                                                 * }
                                                                                                                 * ```
                                                                                                                 *
                                                                                                                 * **Best Practices**:
                                                                                                                 * 1. **Regular Cleanup**: Set up a cron job to run cleanup daily
                                                                                                                 * 2. **Status Filtering**: Use status filter to preserve running/paused jobs
                                                                                                                 * 3. **Age Limits**: Use appropriate age limits (24h for dev, 7-30 days for production)
                                                                                                                 * 4. **Backup**: Consider backing up important job states before cleanup
                                                                                                                 * 5. **Monitoring**: Monitor removed_count to track cleanup effectiveness
                                                                                                                 *
                                                                                                                 * **Warning**: This operation is **irreversible**. Deleted jobs cannot be recovered.
                                                                                                                 * Make sure you don't need the job data before running cleanup.
                                                                                                                 *
                                                                                                                 * **Error Responses**:
                                                                                                                 * - `422 Validation Error`: Invalid max_age_hours or status values
                                                                                                                 *
                                                                                                                 * Args:
                                                                                                                 * max_age_hours: Maximum age in hours (1-720, default: 24)
                                                                                                                 * status: Optional list of statuses to clean up (can specify multiple times)
                                                                                                                 *
                                                                                                                 * Returns:
                                                                                                                 * dict: Number of jobs removed, max_age_hours, and status_filter
                                                                                                                 *
                                                                                                                 * Raises:
                                                                                                                 * HTTPException: 422 if parameters are invalid
                                                                                                                 * @param maxAgeHours Maximum age in hours. Jobs older than this will be removed. Range: 1-720 hours (1 hour to 30 days). Default: 24 hours.
                                                                                                                 * @param status Optional list of statuses to clean up. Only jobs with these statuses will be removed. If not provided, all jobs older than max_age_hours are removed regardless of status. Valid status values: 'pending', 'running', 'idle', 'completed', 'failed', 'paused', 'cancelled'. Example: ['completed', 'failed'] to clean up only finished jobs.
                                                                                                                 * @returns any Successful Response
                                                                                                                 * @throws ApiError
                                                                                                                 */
                                                                                                                public static cleanupJobsApiJobsCleanupPost(
                                                                                                                    maxAgeHours: number = 24,
                                                                                                                    status?: (Array<string> | null),
                                                                                                                ): CancelablePromise<any> {
                                                                                                                    return __request(OpenAPI, {
                                                                                                                        method: 'POST',
                                                                                                                        url: '/api/jobs/cleanup',
                                                                                                                        query: {
                                                                                                                            'max_age_hours': maxAgeHours,
                                                                                                                            'status': status,
                                                                                                                        },
                                                                                                                        errors: {
                                                                                                                            422: `Validation Error`,
                                                                                                                        },
                                                                                                                    });
                                                                                                                }
                                                                                                            }
