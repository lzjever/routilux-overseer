/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RuntimeInfo } from "./RuntimeInfo";
/**
 * Response model for listing all runtimes.
 *
 * Returns a list of all registered Runtime instances with their information.
 */
export type RuntimeListResponse = {
  /**
   * List of all registered Runtime instances.
   */
  runtimes: Array<RuntimeInfo>;
  /**
   * Total number of registered runtimes.
   */
  total: number;
  /**
   * ID of the default runtime. This is used when runtime_id is not specified.
   */
  default_runtime_id?: string | null;
};
