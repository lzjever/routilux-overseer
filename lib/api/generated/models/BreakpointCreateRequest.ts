/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a slot-level breakpoint.
 */
export type BreakpointCreateRequest = {
  /**
   * Routine ID where the slot is located
   */
  routine_id: string;
  /**
   * Slot name where breakpoint is set
   */
  slot_name: string;
  /**
   * Optional Python expression to evaluate (e.g., "data.get('value') > 10")
   */
  condition?: string | null;
  /**
   * Whether breakpoint is active
   */
  enabled?: boolean;
};
