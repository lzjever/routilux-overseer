/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for breakpoint details.
 */
export type BreakpointResponse = {
    /**
     * Unique breakpoint identifier
     */
    breakpoint_id: string;
    /**
     * Job ID this breakpoint applies to
     */
    job_id: string;
    /**
     * Routine ID where the slot is located
     */
    routine_id: string;
    /**
     * Slot name where breakpoint is set
     */
    slot_name: string;
    /**
     * Optional condition expression
     */
    condition?: (string | null);
    /**
     * Whether breakpoint is active
     */
    enabled: boolean;
    /**
     * Number of times breakpoint has been hit
     */
    hit_count: number;
};

