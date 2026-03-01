/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Job stdout output response.
 */
export type JobOutputResponse = {
  /**
   * Job identifier
   */
  job_id: string;
  /**
   * Captured stdout output
   */
  output: string;
  /**
   * Whether job has completed
   */
  is_complete: boolean;
  /**
   * Whether output was truncated
   */
  truncated?: boolean;
};
