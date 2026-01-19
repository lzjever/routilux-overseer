/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExecutionMetricsResponse } from '../models/ExecutionMetricsResponse';
import type { ExecutionTraceResponse } from '../models/ExecutionTraceResponse';
import type { JobFailRequest } from '../models/JobFailRequest';
import type { JobListResponse } from '../models/JobListResponse';
import type { JobMonitoringData } from '../models/JobMonitoringData';
import type { JobOutputResponse } from '../models/JobOutputResponse';
import type { JobResponse } from '../models/JobResponse';
import type { JobSubmitRequest } from '../models/JobSubmitRequest';
import type { JobTraceResponse } from '../models/JobTraceResponse';
import type { RoutineExecutionStatus } from '../models/RoutineExecutionStatus';
import type { SlotQueueStatus } from '../models/SlotQueueStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JobsService {
    /**
     * Submit Job
     * Submit a new Job to a Worker.
     *
     * If worker_id is not provided, a new Worker is created automatically.
     * Each Job submission creates a new JobContext that tracks this specific task.
     *
     * **Example Request**:
     * ```json
     * {
         * "flow_id": "data_processing_flow",
         * "routine_id": "data_source",
         * "slot_name": "input",
         * "data": {"value": 42}
         * }
         * ```
         * @param requestBody
         * @returns JobResponse Successful Response
         * @throws ApiError
         */
        public static submitJobApiV1JobsPost(
            requestBody: JobSubmitRequest,
        ): CancelablePromise<JobResponse> {
            return __request(OpenAPI, {
                method: 'POST',
                url: '/api/v1/jobs',
                body: requestBody,
                mediaType: 'application/json',
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * List Jobs
         * List all Jobs with optional filters.
         *
         * **Query Parameters**:
         * - `worker_id`: Filter by specific worker
         * - `flow_id`: Filter by flow being executed
         * - `status`: Filter by job status (pending, running, completed, failed)
         * - `limit`: Maximum results (1-1000, default 100)
         * - `offset`: Skip first N results (for pagination)
         * @param workerId Filter by worker ID
         * @param flowId Filter by flow ID
         * @param status Filter by status
         * @param limit Maximum jobs to return
         * @param offset Number of jobs to skip
         * @returns JobListResponse Successful Response
         * @throws ApiError
         */
        public static listJobsApiV1JobsGet(
            workerId?: (string | null),
            flowId?: (string | null),
            status?: (string | null),
            limit: number = 100,
            offset?: number,
        ): CancelablePromise<JobListResponse> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs',
                query: {
                    'worker_id': workerId,
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
         * Get Job details by ID.
         * @param jobId
         * @returns JobResponse Successful Response
         * @throws ApiError
         */
        public static getJobApiV1JobsJobIdGet(
            jobId: string,
        ): CancelablePromise<JobResponse> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Output
         * Get captured stdout output for a Job.
         *
         * Use `incremental=true` to get only new output since the last call.
         * @param jobId
         * @param incremental Return only new output since last call
         * @returns JobOutputResponse Successful Response
         * @throws ApiError
         */
        public static getJobOutputApiV1JobsJobIdOutputGet(
            jobId: string,
            incremental: boolean = false,
        ): CancelablePromise<JobOutputResponse> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/output',
                path: {
                    'job_id': jobId,
                },
                query: {
                    'incremental': incremental,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Trace
         * Get execution trace for a Job.
         *
         * Returns the trace_log entries recorded during job execution.
         * @param jobId
         * @returns JobTraceResponse Successful Response
         * @throws ApiError
         */
        public static getJobTraceApiV1JobsJobIdTraceGet(
            jobId: string,
        ): CancelablePromise<JobTraceResponse> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/trace',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Metrics
         * Get execution metrics for a job.
         * @param jobId
         * @returns ExecutionMetricsResponse Successful Response
         * @throws ApiError
         */
        public static getJobMetricsApiV1JobsJobIdMetricsGet(
            jobId: string,
        ): CancelablePromise<ExecutionMetricsResponse> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/metrics',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Execution Trace
         * Get execution trace for a job (from MonitorCollector).
         * @param jobId
         * @param limit Maximum number of trace events to return. Range: 1-10000.
         * @returns ExecutionTraceResponse Successful Response
         * @throws ApiError
         */
        public static getJobExecutionTraceApiV1JobsJobIdExecutionTraceGet(
            jobId: string,
            limit?: (number | null),
        ): CancelablePromise<ExecutionTraceResponse> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/execution-trace',
                path: {
                    'job_id': jobId,
                },
                query: {
                    'limit': limit,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Logs
         * Get execution logs for a job.
         * @param jobId
         * @returns any Successful Response
         * @throws ApiError
         */
        public static getJobLogsApiV1JobsJobIdLogsGet(
            jobId: string,
        ): CancelablePromise<any> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/logs',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Data
         * Get job-level data.
         * @param jobId
         * @returns any Successful Response
         * @throws ApiError
         */
        public static getJobDataApiV1JobsJobIdDataGet(
            jobId: string,
        ): CancelablePromise<any> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/data',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Monitoring Data
         * Get complete monitoring data for a job.
         * @param jobId
         * @returns JobMonitoringData Successful Response
         * @throws ApiError
         */
        public static getJobMonitoringDataApiV1JobsJobIdMonitoringGet(
            jobId: string,
        ): CancelablePromise<JobMonitoringData> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/monitoring',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Routines Status
         * Get execution status for all routines in a job.
         * @param jobId
         * @returns RoutineExecutionStatus Successful Response
         * @throws ApiError
         */
        public static getRoutinesStatusApiV1JobsJobIdRoutinesStatusGet(
            jobId: string,
        ): CancelablePromise<Record<string, RoutineExecutionStatus>> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/routines/status',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Routine Queue Status
         * Get queue status for all slots in a specific routine.
         * @param jobId
         * @param routineId
         * @returns SlotQueueStatus Successful Response
         * @throws ApiError
         */
        public static getRoutineQueueStatusApiV1JobsJobIdRoutinesRoutineIdQueueStatusGet(
            jobId: string,
            routineId: string,
        ): CancelablePromise<Array<SlotQueueStatus>> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/routines/{routine_id}/queue-status',
                path: {
                    'job_id': jobId,
                    'routine_id': routineId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Get Job Queues Status
         * Get queue status for all routines in a job.
         * @param jobId
         * @returns SlotQueueStatus Successful Response
         * @throws ApiError
         */
        public static getJobQueuesStatusApiV1JobsJobIdQueuesStatusGet(
            jobId: string,
        ): CancelablePromise<Record<string, Array<SlotQueueStatus>>> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/queues/status',
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
         * Mark a Job as completed.
         *
         * Use this to explicitly mark a job as done when all processing is complete.
         * @param jobId
         * @returns JobResponse Successful Response
         * @throws ApiError
         */
        public static completeJobApiV1JobsJobIdCompletePost(
            jobId: string,
        ): CancelablePromise<JobResponse> {
            return __request(OpenAPI, {
                method: 'POST',
                url: '/api/v1/jobs/{job_id}/complete',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Fail Job
         * Mark a Job as failed.
         *
         * Use this to explicitly mark a job as failed with an error message.
         * @param jobId
         * @param requestBody
         * @returns JobResponse Successful Response
         * @throws ApiError
         */
        public static failJobApiV1JobsJobIdFailPost(
            jobId: string,
            requestBody: JobFailRequest,
        ): CancelablePromise<JobResponse> {
            return __request(OpenAPI, {
                method: 'POST',
                url: '/api/v1/jobs/{job_id}/fail',
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
         * Get Job Status
         * Get current status of a Job (lightweight endpoint).
         *
         * Use this for frequent polling - returns minimal data.
         * @param jobId
         * @returns any Successful Response
         * @throws ApiError
         */
        public static getJobStatusApiV1JobsJobIdStatusGet(
            jobId: string,
        ): CancelablePromise<any> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/api/v1/jobs/{job_id}/status',
                path: {
                    'job_id': jobId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Wait For Job
         * Wait for a Job to complete (blocking endpoint).
         *
         * Blocks until the job reaches a terminal state (completed/failed) or timeout.
         * @param jobId
         * @param timeout Timeout in seconds
         * @returns any Successful Response
         * @throws ApiError
         */
        public static waitForJobApiV1JobsJobIdWaitPost(
            jobId: string,
            timeout: number = 60,
        ): CancelablePromise<any> {
            return __request(OpenAPI, {
                method: 'POST',
                url: '/api/v1/jobs/{job_id}/wait',
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
    }
