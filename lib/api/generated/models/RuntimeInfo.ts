/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information about a registered Runtime instance.
 *
 * This model provides details about a Runtime, including its configuration,
 * status, and active job count.
 */
export type RuntimeInfo = {
  /**
   * Unique identifier for this runtime. Use this ID when starting jobs.
   */
  runtime_id: string;
  /**
   * Maximum number of worker threads in the thread pool. 0 means using GlobalJobManager's thread pool.
   */
  thread_pool_size: number;
  /**
   * Whether this is the default runtime. If runtime_id is not specified when starting a job, the default runtime is used.
   */
  is_default: boolean;
  /**
   * Number of active jobs currently running in this runtime.
   */
  active_job_count: number;
  /**
   * Whether this runtime has been shut down.
   */
  is_shutdown: boolean;
};
