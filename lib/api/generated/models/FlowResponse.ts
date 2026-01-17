/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConnectionInfo } from './ConnectionInfo';
import type { RoutineInfo } from './RoutineInfo';
/**
 * Response model for flow details.
 */
export type FlowResponse = {
    flow_id: string;
    routines: Record<string, RoutineInfo>;
    connections: Array<ConnectionInfo>;
    created_at?: (string | null);
    updated_at?: (string | null);
};

