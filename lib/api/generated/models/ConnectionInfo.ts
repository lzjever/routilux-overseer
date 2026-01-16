/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information about a connection.
 */
export type ConnectionInfo = {
    connection_id: string;
    source_routine: string;
    source_event: string;
    target_routine: string;
    target_slot: string;
    param_mapping?: (Record<string, string> | null);
};

