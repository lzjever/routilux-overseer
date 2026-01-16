/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a breakpoint.
 */
export type BreakpointCreateRequest = {
    type: BreakpointCreateRequest.type;
    routine_id?: (string | null);
    slot_name?: (string | null);
    event_name?: (string | null);
    source_routine_id?: (string | null);
    source_event_name?: (string | null);
    target_routine_id?: (string | null);
    target_slot_name?: (string | null);
    condition?: (string | null);
    enabled?: boolean;
};
export namespace BreakpointCreateRequest {
    export enum type {
        ROUTINE = 'routine',
        SLOT = 'slot',
        EVENT = 'event',
        CONNECTION = 'connection',
    }
}

