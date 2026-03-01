/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Routine execution status for monitoring.
 */
export type RoutineExecutionStatus = {
  /**
   * Routine ID
   */
  routine_id: string;
  /**
   * Whether routine is currently executing
   */
  is_active: boolean;
  /**
   * Execution status: pending, running, completed, failed
   */
  status: string;
  /**
   * Last execution timestamp
   */
  last_execution_time?: string | null;
  /**
   * Total number of executions
   */
  execution_count?: number;
  /**
   * Total number of errors
   */
  error_count?: number;
  /**
   * Number of active threads executing this routine
   */
  active_thread_count?: number;
};
