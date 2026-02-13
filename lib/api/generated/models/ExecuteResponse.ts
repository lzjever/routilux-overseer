/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One-shot execution response.
 */
export type ExecuteResponse = {
  /**
   * Job identifier
   */
  job_id: string;
  /**
   * Worker identifier
   */
  worker_id: string;
  /**
   * Job status
   */
  status: string;
  /**
   * Captured stdout output (only if wait=true)
   */
  output?: string | null;
  /**
   * Job result data (only if wait=true and completed)
   */
  result?: Record<string, any> | null;
  /**
   * Error message (only if wait=true and failed)
   */
  error?: string | null;
  /**
   * Execution time (only if wait=true)
   */
  elapsed_seconds?: number | null;
};
