/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExecutionEventResponse } from "./ExecutionEventResponse";
/**
 * Response model for execution trace.
 */
export type ExecutionTraceResponse = {
  events: Array<ExecutionEventResponse>;
  total: number;
};
