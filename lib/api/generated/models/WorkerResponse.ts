/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Worker details response.
 */
export type WorkerResponse = {
  /**
   * Unique Worker identifier
   */
  worker_id: string;
  /**
   * Flow this Worker is executing
   */
  flow_id: string;
  /**
   * Current status: pending|running|idle|paused|completed|failed|cancelled
   */
  status: string;
  /**
   * Unix timestamp of creation
   */
  created_at?: number | null;
  /**
   * Unix timestamp of start
   */
  started_at?: number | null;
  /**
   * Number of jobs successfully processed
   */
  jobs_processed?: number;
  /**
   * Number of jobs that failed
   */
  jobs_failed?: number;
};
