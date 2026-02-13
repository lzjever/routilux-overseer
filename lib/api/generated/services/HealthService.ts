/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class HealthService {
  /**
   * Liveness
   * Kubernetes liveness probe.
   *
   * Returns 200 if the process is alive.
   * Use this for container orchestration to detect unresponsive processes.
   *
   * **Response**:
   * ```json
   * {"status": "ok"}
   * ```
   * @returns any Successful Response
   * @throws ApiError
   */
  public static livenessApiV1HealthLiveGet(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/health/live",
    });
  }
  /**
   * Readiness
   * Kubernetes readiness probe.
   *
   * Returns 200 if the service is ready to accept traffic.
   *
   * Checks:
   * - Runtime is not shut down
   * - Can access core components
   *
   * **Response (ready)**:
   * ```json
   * {
   * "status": "ready",
   * "runtime": {
   * "shutdown": false,
   * "active_workers": 5
   * }
   * }
   * ```
   *
   * **Response (not ready)**:
   * ```json
   * {
   * "status": "not_ready",
   * "reason": "runtime_shutdown"
   * }
   * ```
   * @returns any Successful Response
   * @throws ApiError
   */
  public static readinessApiV1HealthReadyGet(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/health/ready",
    });
  }
  /**
   * Health Stats
   * Get detailed health statistics.
   *
   * Returns comprehensive statistics about the system's health and performance.
   * @returns any Successful Response
   * @throws ApiError
   */
  public static healthStatsApiV1HealthStatsGet(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/health/stats",
    });
  }
}
