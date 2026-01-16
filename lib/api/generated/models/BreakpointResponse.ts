/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for breakpoint details.
 */
export type BreakpointResponse = {
    breakpoint_id: string;
    job_id: string;
    type: string;
    routine_id: (string | null);
    slot_name: (string | null);
    event_name: (string | null);
    source_routine_id?: (string | null);
    source_event_name?: (string | null);
    target_routine_id?: (string | null);
    target_slot_name?: (string | null);
    condition: (string | null);
    enabled: boolean;
    hit_count: number;
};

