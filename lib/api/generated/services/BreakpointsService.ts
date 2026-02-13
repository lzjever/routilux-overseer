/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BreakpointCreateRequest } from "../models/BreakpointCreateRequest";
import type { BreakpointListResponse } from "../models/BreakpointListResponse";
import type { BreakpointResponse } from "../models/BreakpointResponse";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class BreakpointsService {
  /**
   * Create Breakpoint
   * Create a slot-level breakpoint for a job.
   *
   * **Overview**:
   * Creates a breakpoint that pauses job execution when data is about to be
   * enqueued to a specific slot. When a breakpoint is hit, the enqueue operation
   * is skipped, effectively pausing execution at that point.
   *
   * **Endpoint**: `POST /api/v1/jobs/{job_id}/breakpoints`
   *
   * **Use Cases**:
   * - Debug job execution issues
   * - Inspect data at specific slots
   * - Control execution flow
   * - Step through job execution
   * - Analyze data transformations
   *
   * **Request Example**:
   * ```json
   * {
   * "routine_id": "data_processor",
   * "slot_name": "input",
   * "enabled": true,
   * "condition": null
   * }
   * ```
   *
   * **Response Example**:
   * ```json
   * {
   * "breakpoint_id": "bp_xyz789",
   * "job_id": "job_abc123",
   * "routine_id": "data_processor",
   * "slot_name": "input",
   * "condition": null,
   * "enabled": true,
   * "hit_count": 0
   * }
   * ```
   *
   * **Breakpoint Configuration**:
   * - `routine_id` (required): Routine ID where the slot is located
   * - `slot_name` (required): Slot name where breakpoint is set
   * - `condition` (optional): Conditional expression (e.g., "data.get('value') > 10")
   * - `enabled` (optional): Whether breakpoint is active (default: true)
   *
   * **Error Responses**:
   * - `404 Not Found`: Job not found, flow not found, routine not found in flow, or slot not found in routine
   * - `500 Internal Server Error`: Breakpoint manager not available
   *
   * **Best Practices**:
   * 1. Create breakpoints before job starts for best results
   * 2. Use slot breakpoints to intercept data at specific points
   * 3. Disable breakpoints when not debugging: PUT /api/workers/{worker_id}/breakpoints/{breakpoint_id}
   * 4. Remove breakpoints after debugging: DELETE /api/jobs/{job_id}/breakpoints/{breakpoint_id}
   *
   * **Related Endpoints**:
   * - GET /api/v1/jobs/{job_id}/breakpoints - List all breakpoints
   * - PUT /api/v1/workers/{worker_id}/breakpoints/{breakpoint_id} - Enable/disable breakpoint
   * - DELETE /api/v1/jobs/{job_id}/breakpoints/{breakpoint_id} - Delete breakpoint
   *
   * Args:
   * job_id: Unique job identifier
   * request: BreakpointCreateRequest with breakpoint configuration
   *
   * Returns:
   * BreakpointResponse: Created breakpoint information
   *
   * Raises:
   * HTTPException: 404 if job, flow, routine, or slot not found
   * HTTPException: 500 if breakpoint manager unavailable
   * @param jobId
   * @param requestBody
   * @returns BreakpointResponse Successful Response
   * @throws ApiError
   */
  public static createBreakpointApiV1JobsJobIdBreakpointsPost(
    jobId: string,
    requestBody: BreakpointCreateRequest
  ): CancelablePromise<BreakpointResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/jobs/{job_id}/breakpoints",
      path: {
        job_id: jobId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * List Breakpoints
   * List all breakpoints for a job.
   *
   * **Overview**:
   * Returns a list of all breakpoints associated with a job. Use this to inspect active
   * breakpoints, check breakpoint status, and manage debugging sessions.
   *
   * **Endpoint**: `GET /api/v1/jobs/{job_id}/breakpoints`
   *
   * **Use Cases**:
   * - View all active breakpoints for a job
   * - Check breakpoint status and hit counts
   * - Manage debugging sessions
   * - Verify breakpoint configuration
   *
   * **Request Example**:
   * ```
   * GET /api/jobs/job_abc123/breakpoints
   * ```
   *
   * **Response Example**:
   * ```json
   * {
   * "breakpoints": [
   * {
   * "breakpoint_id": "bp_xyz789",
   * "job_id": "job_abc123",
   * "routine_id": "data_processor",
   * "slot_name": "input",
   * "condition": null,
   * "enabled": true,
   * "hit_count": 3
   * }
   * ],
   * "total": 1
   * }
   * ```
   *
   * **Response Fields**:
   * - `breakpoints`: List of breakpoint objects
   * - `total`: Total number of breakpoints
   *
   * **Breakpoint Information**:
   * Each breakpoint includes:
   * - `breakpoint_id`: Unique breakpoint identifier
   * - `job_id`: Job ID this breakpoint is associated with
   * - `routine_id`: Routine ID where the slot is located (required)
   * - `slot_name`: Slot name where breakpoint is set (required)
   * - `condition`: Optional conditional expression
   * - `enabled`: Whether breakpoint is currently active
   * - `hit_count`: Number of times breakpoint was hit
   *
   * **Error Responses**:
   * - `404 Not Found`: Job with this ID does not exist
   *
   * **Related Endpoints**:
   * - POST /api/v1/jobs/{job_id}/breakpoints - Create new breakpoint
   * - PUT /api/v1/workers/{worker_id}/breakpoints/{breakpoint_id} - Enable/disable breakpoint
   * - DELETE /api/v1/jobs/{job_id}/breakpoints/{breakpoint_id} - Delete breakpoint
   *
   * Args:
   * job_id: Unique job identifier
   *
   * Returns:
   * BreakpointListResponse: List of breakpoints with total count
   *
   * Raises:
   * HTTPException: 404 if job not found
   * @param jobId
   * @returns BreakpointListResponse Successful Response
   * @throws ApiError
   */
  public static listBreakpointsApiV1JobsJobIdBreakpointsGet(
    jobId: string
  ): CancelablePromise<BreakpointListResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/jobs/{job_id}/breakpoints",
      path: {
        job_id: jobId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Delete Breakpoint
   * Delete a breakpoint.
   *
   * **Overview**:
   * Permanently removes a breakpoint from a job. After deletion, the breakpoint will no
   * longer intercept slot enqueue operations.
   *
   * **Endpoint**: `DELETE /api/v1/jobs/{job_id}/breakpoints/{breakpoint_id}`
   *
   * **Use Cases**:
   * - Remove breakpoints after debugging
   * - Clean up breakpoints when no longer needed
   * - Restore normal execution flow
   * - Manage debugging sessions
   *
   * **Request Example**:
   * ```
   * DELETE /api/jobs/job_abc123/breakpoints/bp_xyz789
   * ```
   *
   * **Response**: 204 No Content (successful deletion)
   *
   * **Behavior**:
   * - Breakpoint is removed from the job
   * - Execution continues normally after deletion
   * - Breakpoint cannot be recovered after deletion
   *
   * **Error Responses**:
   * - `404 Not Found`: Job or breakpoint not found, or breakpoint manager unavailable
   *
   * **Best Practices**:
   * 1. List breakpoints before deletion: GET /api/jobs/{job_id}/breakpoints
   * 2. Consider disabling instead of deleting: PUT /api/workers/{worker_id}/breakpoints/{breakpoint_id}
   * 3. Delete breakpoints when debugging is complete
   * 4. Verify deletion: GET /api/jobs/{job_id}/breakpoints
   *
   * **Related Endpoints**:
   * - GET /api/v1/jobs/{job_id}/breakpoints - List breakpoints
   * - POST /api/v1/jobs/{job_id}/breakpoints - Create breakpoint
   * - PUT /api/v1/workers/{worker_id}/breakpoints/{breakpoint_id} - Enable/disable breakpoint
   *
   * Args:
   * job_id: Unique job identifier
   * breakpoint_id: Unique breakpoint identifier
   *
   * Returns:
   * None (204 No Content)
   *
   * Raises:
   * HTTPException: 404 if job or breakpoint not found
   * @param jobId
   * @param breakpointId
   * @returns void
   * @throws ApiError
   */
  public static deleteBreakpointApiV1JobsJobIdBreakpointsBreakpointIdDelete(
    jobId: string,
    breakpointId: string
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/jobs/{job_id}/breakpoints/{breakpoint_id}",
      path: {
        job_id: jobId,
        breakpoint_id: breakpointId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
