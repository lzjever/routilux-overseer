/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Job execution trace response.
 */
export type JobTraceResponse = {
  /**
   * Job identifier
   */
  job_id: string;
  /**
   * Execution trace entries
   */
  trace_log: Array<Record<string, any>>;
  /**
   * Total number of trace entries
   */
  total_entries: number;
};
