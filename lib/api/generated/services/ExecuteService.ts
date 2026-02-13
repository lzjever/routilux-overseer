/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExecuteRequest } from "../models/ExecuteRequest";
import type { ExecuteResponse } from "../models/ExecuteResponse";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class ExecuteService {
  /**
   * Execute Flow
   * One-shot flow execution.
   *
   * **Overview**:
   * A convenience endpoint that combines worker creation, job submission, and optional
   * waiting into a single operation. This is ideal for simple "submit and get result"
   * workflows where you don't need persistent workers or complex job management.
   *
   * **Endpoint**: `POST /api/v1/execute`
   *
   * **Use Cases**:
   * - Simple one-time job execution
   * - Submit and wait for result patterns
   * - Fire-and-forget job execution
   * - Simple API integrations
   * - Testing and development
   *
   * **Execution Modes**:
   *
   * **1. Async Mode** (`wait: false`):
   * - Creates worker and submits job
   * - Returns immediately with job information
   * - Job executes in background
   * - Use job_id to check status later
   *
   * **2. Sync Mode** (`wait: true`):
   * - Creates worker and submits job
   * - Waits for job completion (up to timeout)
   * - Returns with job result or timeout status
   * - Blocks until completion or timeout
   *
   * **Request Fields**:
   * - `flow_id` (required): Flow to execute
   * - `routine_id` (required): Entry point routine name
   * - `slot_name` (required): Slot to trigger in the entry routine
   * - `data` (required): Input data for the job
   * - `wait` (optional): Whether to wait for completion (default: false)
   * - `timeout` (optional): Timeout in seconds when wait=true (default: 60.0)
   * - `metadata` (optional): Additional metadata for the job
   * - `idempotency_key` (optional): Key for idempotent requests
   *
   * **Request Examples**:
   *
   * **Async execution**:
   * ```json
   * {
   * "flow_id": "data_processing_flow",
   * "routine_id": "data_source",
   * "slot_name": "trigger",
   * "data": {"value": 42},
   * "wait": false
   * }
   * ```
   *
   * **Sync execution**:
   * ```json
   * {
   * "flow_id": "data_processing_flow",
   * "routine_id": "data_source",
   * "slot_name": "trigger",
   * "data": {"value": 42},
   * "wait": true,
   * "timeout": 30.0
   * }
   * ```
   *
   * **Response Examples**:
   *
   * **Async response**:
   * ```json
   * {
   * "job_id": "job_xyz789",
   * "worker_id": "worker_abc123",
   * "status": "pending"
   * }
   * ```
   *
   * **Sync response (completed)**:
   * ```json
   * {
   * "job_id": "job_xyz789",
   * "worker_id": "worker_abc123",
   * "status": "completed",
   * "output": "Processing complete...",
   * "result": {"processed": true},
   * "error": null,
   * "elapsed_seconds": 45.2
   * }
   * ```
   *
   * **Sync response (timeout)**:
   * ```json
   * {
   * "job_id": "job_xyz789",
   * "worker_id": "worker_abc123",
   * "status": "timeout",
   * "error": "Job did not complete within 30 seconds",
   * "elapsed_seconds": 30.0
   * }
   * ```
   *
   * **Worker Creation**:
   * - Always creates a new worker for each execution
   * - Worker is created automatically and managed internally
   * - Worker may be cleaned up after job completion
   *
   * **Idempotency**:
   * - Provide `idempotency_key` to ensure duplicate requests return the same result
   * - Idempotency cache is valid for 24 hours
   * - Useful for retry scenarios
   *
   * **Error Responses**:
   * - `404 Not Found`: Flow, routine, or slot not found
   * - `400 Bad Request`: Execution failed (invalid data, runtime error)
   * - `503 Service Unavailable`: Runtime is shutting down
   *
   * **When to Use**:
   * - **Use this endpoint for**: Simple one-time executions, testing, simple integrations
   * - **Use Worker/Job endpoints for**: Multiple jobs, persistent workers, complex workflows
   *
   * **Best Practices**:
   * 1. Use async mode for long-running jobs
   * 2. Use sync mode for quick jobs that need results
   * 3. Set appropriate timeout for sync mode
   * 4. Use idempotency keys for critical operations
   * 5. Check status if using async mode
   *
   * **Related Endpoints**:
   * - POST /api/v1/jobs - Submit job to existing worker
   * - POST /api/v1/workers - Create persistent worker
   * - GET /api/v1/jobs/{job_id} - Check job status (for async mode)
   *
   * Args:
   * request: ExecuteRequest with flow_id, routine_id, slot_name, data, and optional wait/timeout
   *
   * Returns:
   * ExecuteResponse: Job information (async) or job result (sync)
   *
   * Raises:
   * HTTPException: 404 if flow, routine, or slot not found
   * HTTPException: 400 if execution fails
   * HTTPException: 503 if runtime is shutting down
   * @param requestBody
   * @returns ExecuteResponse Successful Response
   * @throws ApiError
   */
  public static executeFlowApiV1ExecutePost(
    requestBody: ExecuteRequest
  ): CancelablePromise<ExecuteResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/execute",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
