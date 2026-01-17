/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExecutionMetricsResponse } from '../models/ExecutionMetricsResponse';
import type { ExecutionTraceResponse } from '../models/ExecutionTraceResponse';
import type { JobMonitoringData } from '../models/JobMonitoringData';
import type { routilux__api__models__monitor__RoutineInfo } from '../models/routilux__api__models__monitor__RoutineInfo';
import type { RoutineExecutionStatus } from '../models/RoutineExecutionStatus';
import type { SlotQueueStatus } from '../models/SlotQueueStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MonitorService {
    /**
     * Get Job Metrics
     * Get execution metrics for a job.
     *
     * **Overview**:
     * Returns aggregated execution metrics for a job, including performance statistics
     * for each routine, total event counts, and error information.
     *
     * **Data Source**: MonitorCollector.get_metrics(job_id) → ExecutionMetrics object
     *
     * **Request Example**:
     * ```
     * GET /api/jobs/job-123/metrics
     * ```
     *
     * **Response Example**:
     * ```json
     * {
         * "job_id": "job-123",
         * "flow_id": "data_processing_flow",
         * "start_time": "2025-01-15T10:00:00.000Z",
         * "end_time": "2025-01-15T10:05:30.500Z",
         * "duration": 330.5,
         * "routine_metrics": {
             * "data_source": {
                 * "routine_id": "data_source",
                 * "execution_count": 100,
                 * "total_duration": 50.2,
                 * "avg_duration": 0.502,
                 * "min_duration": 0.1,
                 * "max_duration": 2.5,
                 * "error_count": 0,
                 * "last_execution": "2025-01-15T10:05:25.000Z"
                 * },
                 * "processor": {
                     * "routine_id": "processor",
                     * "execution_count": 95,
                     * "total_duration": 280.3,
                     * "avg_duration": 2.95,
                     * "min_duration": 1.2,
                     * "max_duration": 5.8,
                     * "error_count": 2,
                     * "last_execution": "2025-01-15T10:05:28.000Z"
                     * }
                     * },
                     * "total_events": 195,
                     * "total_slot_calls": 195,
                     * "total_event_emits": 195,
                     * "errors": [
                         * {
                             * "error_id": "err-001",
                             * "job_id": "job-123",
                             * "routine_id": "processor",
                             * "timestamp": "2025-01-15T10:03:15.000Z",
                             * "error_type": "ValueError",
                             * "error_message": "Invalid data format",
                             * "traceback": "Traceback..."
                             * }
                             * ]
                             * }
                             * ```
                             *
                             * **Metrics Explained**:
                             * - `execution_count`: Number of times routine executed
                             * - `total_duration`: Sum of all execution durations
                             * - `avg_duration`: Average execution time
                             * - `min_duration`/`max_duration`: Fastest and slowest executions
                             * - `error_count`: Number of errors encountered
                             * - `last_execution`: Timestamp of most recent execution
                             *
                             * **Use Cases**:
                             * - Performance analysis
                             * - Identifying bottlenecks
                             * - Error tracking
                             * - Routine performance comparison
                             *
                             * **Error Responses**:
                             * - `404 Not Found`: Job not found or no metrics available
                             *
                             * **Related Endpoints**:
                             * - GET /api/jobs/{job_id}/trace - Get detailed execution trace
                             * - GET /api/jobs/{job_id}/monitoring - Get complete monitoring data
                             *
                             * Args:
                             * job_id: Unique job identifier
                             *
                             * Returns:
                             * ExecutionMetricsResponse: Aggregated execution metrics
                             *
                             * Raises:
                             * HTTPException: 404 if job not found or no metrics available
                             * HTTPException: 500 if monitor collector is not available
                             * @param jobId
                             * @returns ExecutionMetricsResponse Successful Response
                             * @throws ApiError
                             */
                            public static getJobMetricsApiJobsJobIdMetricsGet(
                                jobId: string,
                            ): CancelablePromise<ExecutionMetricsResponse> {
                                return __request(OpenAPI, {
                                    method: 'GET',
                                    url: '/api/jobs/{job_id}/metrics',
                                    path: {
                                        'job_id': jobId,
                                    },
                                    errors: {
                                        422: `Validation Error`,
                                    },
                                });
                            }
                            /**
                             * Get Job Trace
                             * Get execution trace for a job.
                             *
                             * **Overview**:
                             * Returns a chronological list of execution events showing the complete execution
                             * flow of a job. Each event represents a routine start/end, slot call, or event emission.
                             *
                             * **Data Source**: MonitorCollector.get_execution_trace(job_id, limit) → List[ExecutionRecord]
                             *
                             * **Request Example**:
                             * ```
                             * GET /api/jobs/job-123/trace?limit=50
                             * ```
                             *
                             * **Response Example**:
                             * ```json
                             * {
                                 * "events": [
                                     * {
                                         * "event_id": "evt-001",
                                         * "job_id": "job-123",
                                         * "routine_id": "data_source",
                                         * "event_type": "routine_start",
                                         * "timestamp": "2025-01-15T10:00:00.100Z",
                                         * "data": {"input": {"data": "item_1", "index": 1}},
                                         * "duration": null,
                                         * "status": null
                                         * },
                                         * {
                                             * "event_id": "evt-002",
                                             * "job_id": "job-123",
                                             * "routine_id": "data_source",
                                             * "event_type": "event_emit",
                                             * "timestamp": "2025-01-15T10:00:00.150Z",
                                             * "data": {
                                                 * "event": "output",
                                                 * "data": {"data": "item_1", "index": 1, "timestamp": "2025-01-15T10:00:00.150Z"}
                                                 * },
                                                 * "duration": null,
                                                 * "status": "completed"
                                                 * },
                                                 * {
                                                     * "event_id": "evt-003",
                                                     * "job_id": "job-123",
                                                     * "routine_id": "processor",
                                                     * "event_type": "routine_end",
                                                     * "timestamp": "2025-01-15T10:00:03.100Z",
                                                     * "data": {"result": "PROCESSED_item_1"},
                                                     * "duration": 2.85,
                                                     * "status": "completed"
                                                     * }
                                                     * ],
                                                     * "total": 3
                                                     * }
                                                     * ```
                                                     *
                                                     * **Event Types**:
                                                     * - `routine_start`: Routine execution started
                                                     * - `routine_end`: Routine execution ended (includes duration)
                                                     * - `slot_call`: Data received in a slot
                                                     * - `event_emit`: Event emitted from a routine
                                                     *
                                                     * **Use Cases**:
                                                     * - Debugging execution flow
                                                     * - Understanding data flow
                                                     * - Performance analysis
                                                     * - Audit trail
                                                     *
                                                     * **Performance Note**:
                                                     * - Large traces can be memory-intensive
                                                     * - Use `limit` parameter to control response size
                                                     * - Default limit in JobState is 1000 records
                                                     *
                                                     * **Error Responses**:
                                                     * - `404 Not Found`: Job not found
                                                     * - `500 Internal Server Error`: Monitor collector not available
                                                     *
                                                     * **Related Endpoints**:
                                                     * - GET /api/jobs/{job_id}/execution-history - Get execution history (formatted)
                                                     * - GET /api/jobs/{job_id}/metrics - Get aggregated metrics
                                                     *
                                                     * Args:
                                                     * job_id: Unique job identifier
                                                     * limit: Maximum number of events to return (1-10000)
                                                     *
                                                     * Returns:
                                                     * ExecutionTraceResponse: List of execution events with total count
                                                     *
                                                     * Raises:
                                                     * HTTPException: 404 if job not found
                                                     * HTTPException: 500 if monitor collector not available
                                                     * HTTPException: 422 if limit is invalid
                                                     * @param jobId
                                                     * @param limit Maximum number of trace events to return. Range: 1-10000. If not provided, returns all available events (may be large). Events are returned in chronological order (oldest first).
                                                     * @returns ExecutionTraceResponse Successful Response
                                                     * @throws ApiError
                                                     */
                                                    public static getJobTraceApiJobsJobIdTraceGet(
                                                        jobId: string,
                                                        limit?: (number | null),
                                                    ): CancelablePromise<ExecutionTraceResponse> {
                                                        return __request(OpenAPI, {
                                                            method: 'GET',
                                                            url: '/api/jobs/{job_id}/trace',
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
                                                     *
                                                     * **Overview**:
                                                     * Returns execution logs stored in the job's shared_log. These are append-only
                                                     * log entries that routines can write to during execution.
                                                     *
                                                     * **Data Source**: JobState.shared_log (List[Dict[str, Any]])
                                                     *
                                                     * **Request Example**:
                                                     * ```
                                                     * GET /api/jobs/job-123/logs
                                                     * ```
                                                     *
                                                     * **Response Example**:
                                                     * ```json
                                                     * {
                                                         * "job_id": "job-123",
                                                         * "logs": [
                                                             * {
                                                                 * "timestamp": "2025-01-15T10:00:00",
                                                                 * "level": "INFO",
                                                                 * "routine_id": "data_source",
                                                                 * "message": "Processing started"
                                                                 * },
                                                                 * {
                                                                     * "timestamp": "2025-01-15T10:00:05",
                                                                     * "level": "ERROR",
                                                                     * "routine_id": "processor",
                                                                     * "message": "Processing failed",
                                                                     * "error": "ValueError: Invalid input data"
                                                                     * }
                                                                     * ],
                                                                     * "total": 2
                                                                     * }
                                                                     * ```
                                                                     *
                                                                     * **Log Structure**:
                                                                     * - `timestamp`: When the log entry was created
                                                                     * - `level`: Log level (INFO, WARNING, ERROR, DEBUG)
                                                                     * - `routine_id`: Which routine created the log entry
                                                                     * - `message`: Log message
                                                                     * - `error`: Optional error information (for ERROR level)
                                                                     *
                                                                     * **Use Cases**:
                                                                     * - Debugging: See what routines logged
                                                                     * - Audit: Track execution events
                                                                     * - Troubleshooting: Understand execution flow
                                                                     *
                                                                     * **Note**: Logs are written by routines using `job_state.shared_log.append()`.
                                                                     * Not all routines write logs - this depends on routine implementation.
                                                                     *
                                                                     * **Error Responses**:
                                                                     * - `404 Not Found`: Job not found
                                                                     *
                                                                     * **Related Endpoints**:
                                                                     * - GET /api/jobs/{job_id}/trace - Get structured execution trace
                                                                     * - GET /api/jobs/{job_id}/execution-history - Get execution history
                                                                     *
                                                                     * Args:
                                                                     * job_id: Unique job identifier
                                                                     *
                                                                     * Returns:
                                                                     * dict: Job logs with total count
                                                                     *
                                                                     * Raises:
                                                                     * HTTPException: 404 if job not found
                                                                     * @param jobId
                                                                     * @returns any Successful Response
                                                                     * @throws ApiError
                                                                     */
                                                                    public static getJobLogsApiJobsJobIdLogsGet(
                                                                        jobId: string,
                                                                    ): CancelablePromise<any> {
                                                                        return __request(OpenAPI, {
                                                                            method: 'GET',
                                                                            url: '/api/jobs/{job_id}/logs',
                                                                            path: {
                                                                                'job_id': jobId,
                                                                            },
                                                                            errors: {
                                                                                422: `Validation Error`,
                                                                            },
                                                                        });
                                                                    }
                                                                    /**
                                                                     * Get Flow Metrics
                                                                     * Get aggregated metrics for all jobs of a flow.
                                                                     * @param flowId
                                                                     * @returns any Successful Response
                                                                     * @throws ApiError
                                                                     */
                                                                    public static getFlowMetricsApiFlowsFlowIdMetricsGet(
                                                                        flowId: string,
                                                                    ): CancelablePromise<any> {
                                                                        return __request(OpenAPI, {
                                                                            method: 'GET',
                                                                            url: '/api/flows/{flow_id}/metrics',
                                                                            path: {
                                                                                'flow_id': flowId,
                                                                            },
                                                                            errors: {
                                                                                422: `Validation Error`,
                                                                            },
                                                                        });
                                                                    }
                                                                    /**
                                                                     * Get Routine Queue Status
                                                                     * Get queue status for all slots in a specific routine.
                                                                     *
                                                                     * **Overview**:
                                                                     * Returns queue status information for all input slots in a routine, including
                                                                     * queue length, usage percentage, and pressure level. Essential for monitoring
                                                                     * queue health and identifying bottlenecks.
                                                                     *
                                                                     * **Data Source**: Flow.routines[routine_id].slots[slot_name].get_queue_status()
                                                                     *
                                                                     * **Request Example**:
                                                                     * ```
                                                                     * GET /api/jobs/job-123/routines/data_processor/queue-status
                                                                     * ```
                                                                     *
                                                                     * **Response Example**:
                                                                     * ```json
                                                                     * [
                                                                         * {
                                                                             * "slot_name": "input",
                                                                             * "routine_id": "data_processor",
                                                                             * "unconsumed_count": 5,
                                                                             * "total_count": 100,
                                                                             * "max_length": 1000,
                                                                             * "watermark_threshold": 800,
                                                                             * "usage_percentage": 0.1,
                                                                             * "pressure_level": "low",
                                                                             * "is_full": false,
                                                                             * "is_near_full": false
                                                                             * },
                                                                             * {
                                                                                 * "slot_name": "secondary",
                                                                                 * "routine_id": "data_processor",
                                                                                 * "unconsumed_count": 0,
                                                                                 * "total_count": 0,
                                                                                 * "max_length": 500,
                                                                                 * "watermark_threshold": 400,
                                                                                 * "usage_percentage": 0.0,
                                                                                 * "pressure_level": "low",
                                                                                 * "is_full": false,
                                                                                 * "is_near_full": false
                                                                                 * }
                                                                                 * ]
                                                                                 * ```
                                                                                 *
                                                                                 * **Queue Metrics Explained**:
                                                                                 * - `unconsumed_count`: Number of items waiting to be processed
                                                                                 * - `total_count`: Total items that have been in the queue
                                                                                 * - `max_length`: Maximum queue capacity
                                                                                 * - `usage_percentage`: Queue usage (0.0 = empty, 1.0 = full)
                                                                                 * - `pressure_level`: Queue pressure: "low", "medium", "high", "critical"
                                                                                 * - `is_full`: Queue is at maximum capacity
                                                                                 * - `is_near_full`: Queue is above watermark threshold
                                                                                 *
                                                                                 * **Pressure Levels**:
                                                                                 * - `low`: usage < 50%
                                                                                 * - `medium`: 50% <= usage < 80%
                                                                                 * - `high`: 80% <= usage < 95%
                                                                                 * - `critical`: usage >= 95% or is_full
                                                                                 *
                                                                                 * **Use Cases**:
                                                                                 * - Monitor queue health
                                                                                 * - Identify bottlenecks
                                                                                 * - Detect queue pressure issues
                                                                                 * - Optimize flow performance
                                                                                 *
                                                                                 * **Error Responses**:
                                                                                 * - `404 Not Found`: Job, flow, or routine not found
                                                                                 *
                                                                                 * **Related Endpoints**:
                                                                                 * - GET /api/jobs/{job_id}/queues/status - Get queue status for all routines
                                                                                 * - GET /api/jobs/{job_id}/monitoring - Get complete monitoring data
                                                                                 *
                                                                                 * Args:
                                                                                 * job_id: Unique job identifier
                                                                                 * routine_id: Routine identifier within the flow
                                                                                 *
                                                                                 * Returns:
                                                                                 * List[SlotQueueStatus]: Queue status for all slots in the routine
                                                                                 *
                                                                                 * Raises:
                                                                                 * HTTPException: 404 if job, flow, or routine not found
                                                                                 * @param jobId
                                                                                 * @param routineId
                                                                                 * @returns SlotQueueStatus Successful Response
                                                                                 * @throws ApiError
                                                                                 */
                                                                                public static getRoutineQueueStatusApiJobsJobIdRoutinesRoutineIdQueueStatusGet(
                                                                                    jobId: string,
                                                                                    routineId: string,
                                                                                ): CancelablePromise<Array<SlotQueueStatus>> {
                                                                                    return __request(OpenAPI, {
                                                                                        method: 'GET',
                                                                                        url: '/api/jobs/{job_id}/routines/{routine_id}/queue-status',
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
                                                                                public static getJobQueuesStatusApiJobsJobIdQueuesStatusGet(
                                                                                    jobId: string,
                                                                                ): CancelablePromise<Record<string, Array<SlotQueueStatus>>> {
                                                                                    return __request(OpenAPI, {
                                                                                        method: 'GET',
                                                                                        url: '/api/jobs/{job_id}/queues/status',
                                                                                        path: {
                                                                                            'job_id': jobId,
                                                                                        },
                                                                                        errors: {
                                                                                            422: `Validation Error`,
                                                                                        },
                                                                                    });
                                                                                }
                                                                                /**
                                                                                 * Get Routine Info
                                                                                 * Get routine metadata information (policy, config, slots, events).
                                                                                 * @param flowId
                                                                                 * @param routineId
                                                                                 * @returns routilux__api__models__monitor__RoutineInfo Successful Response
                                                                                 * @throws ApiError
                                                                                 */
                                                                                public static getRoutineInfoApiFlowsFlowIdRoutinesRoutineIdInfoGet(
                                                                                    flowId: string,
                                                                                    routineId: string,
                                                                                ): CancelablePromise<routilux__api__models__monitor__RoutineInfo> {
                                                                                    return __request(OpenAPI, {
                                                                                        method: 'GET',
                                                                                        url: '/api/flows/{flow_id}/routines/{routine_id}/info',
                                                                                        path: {
                                                                                            'flow_id': flowId,
                                                                                            'routine_id': routineId,
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
                                                                                public static getRoutinesStatusApiJobsJobIdRoutinesStatusGet(
                                                                                    jobId: string,
                                                                                ): CancelablePromise<Record<string, RoutineExecutionStatus>> {
                                                                                    return __request(OpenAPI, {
                                                                                        method: 'GET',
                                                                                        url: '/api/jobs/{job_id}/routines/status',
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
                                                                                 *
                                                                                 * **Overview**:
                                                                                 * Returns comprehensive monitoring data for a job, combining execution status,
                                                                                 * queue status, and routine metadata for all routines. This is the most complete
                                                                                 * monitoring endpoint, providing everything needed for a monitoring dashboard.
                                                                                 *
                                                                                 * **Data Sources**: Combines data from:
                                                                                 * - MonitorService.get_routine_execution_status() - Execution status
                                                                                 * - MonitorService.get_routine_queue_status() - Queue status
                                                                                 * - MonitorService.get_routine_info() - Routine metadata
                                                                                 * - Runtime.get_active_thread_count() - Active thread counts
                                                                                 *
                                                                                 * **Request Example**:
                                                                                 * ```
                                                                                 * GET /api/jobs/job-123/monitoring
                                                                                 * ```
                                                                                 *
                                                                                 * **Response Structure**:
                                                                                 * The response includes for each routine:
                                                                                 * - `execution_status`: Current execution state, thread count, execution counts
                                                                                 * - `queue_status`: Queue information for all slots
                                                                                 * - `info`: Routine metadata (slots, events, activation policy, config)
                                                                                 *
                                                                                 * **Response Example** (simplified):
                                                                                 * ```json
                                                                                 * {
                                                                                     * "job_id": "job-123",
                                                                                     * "flow_id": "data_processing_flow",
                                                                                     * "job_status": "running",
                                                                                     * "routines": {
                                                                                         * "data_source": {
                                                                                             * "routine_id": "data_source",
                                                                                             * "execution_status": {
                                                                                                 * "routine_id": "data_source",
                                                                                                 * "is_active": true,
                                                                                                 * "status": "running",
                                                                                                 * "last_execution_time": "2025-01-15T10:05:25.000Z",
                                                                                                 * "execution_count": 100,
                                                                                                 * "error_count": 0,
                                                                                                 * "active_thread_count": 2
                                                                                                 * },
                                                                                                 * "queue_status": [
                                                                                                     * {
                                                                                                         * "slot_name": "trigger",
                                                                                                         * "routine_id": "data_source",
                                                                                                         * "unconsumed_count": 0,
                                                                                                         * "usage_percentage": 0.0,
                                                                                                         * "pressure_level": "low",
                                                                                                         * "is_full": false,
                                                                                                         * "is_near_full": false
                                                                                                         * }
                                                                                                         * ],
                                                                                                         * "info": {
                                                                                                             * "routine_id": "data_source",
                                                                                                             * "routine_type": "DataSource",
                                                                                                             * "activation_policy": {
                                                                                                                 * "type": "immediate",
                                                                                                                 * "config": {},
                                                                                                                 * "description": "Activate immediately when any slot receives data"
                                                                                                                 * },
                                                                                                                 * "config": {"name": "DataSource"},
                                                                                                                 * "slots": ["trigger"],
                                                                                                                 * "events": ["output"]
                                                                                                                 * }
                                                                                                                 * }
                                                                                                                 * },
                                                                                                                 * "updated_at": "2025-01-15T10:05:30.000Z"
                                                                                                                 * }
                                                                                                                 * ```
                                                                                                                 *
                                                                                                                 * **Use Cases**:
                                                                                                                 * - Build comprehensive monitoring dashboard
                                                                                                                 * - Real-time job monitoring
                                                                                                                 * - Performance analysis
                                                                                                                 * - Troubleshooting
                                                                                                                 *
                                                                                                                 * **Performance Note**:
                                                                                                                 * - This endpoint aggregates data from multiple sources
                                                                                                                 * - Response can be large for flows with many routines
                                                                                                                 * - Consider caching for frequently accessed jobs
                                                                                                                 *
                                                                                                                 * **Error Responses**:
                                                                                                                 * - `404 Not Found`: Job not found
                                                                                                                 *
                                                                                                                 * **Related Endpoints**:
                                                                                                                 * - GET /api/jobs/{job_id}/metrics - Get aggregated metrics
                                                                                                                 * - GET /api/jobs/{job_id}/routines/status - Get just execution status
                                                                                                                 * - GET /api/jobs/{job_id}/queues/status - Get just queue status
                                                                                                                 *
                                                                                                                 * Args:
                                                                                                                 * job_id: Unique job identifier
                                                                                                                 *
                                                                                                                 * Returns:
                                                                                                                 * JobMonitoringData: Complete monitoring data for all routines
                                                                                                                 *
                                                                                                                 * Raises:
                                                                                                                 * HTTPException: 404 if job not found
                                                                                                                 * @param jobId
                                                                                                                 * @returns JobMonitoringData Successful Response
                                                                                                                 * @throws ApiError
                                                                                                                 */
                                                                                                                public static getJobMonitoringDataApiJobsJobIdMonitoringGet(
                                                                                                                    jobId: string,
                                                                                                                ): CancelablePromise<JobMonitoringData> {
                                                                                                                    return __request(OpenAPI, {
                                                                                                                        method: 'GET',
                                                                                                                        url: '/api/jobs/{job_id}/monitoring',
                                                                                                                        path: {
                                                                                                                            'job_id': jobId,
                                                                                                                        },
                                                                                                                        errors: {
                                                                                                                            422: `Validation Error`,
                                                                                                                        },
                                                                                                                    });
                                                                                                                }
                                                                                                            }
