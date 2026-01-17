/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConnectionInfo } from './ConnectionInfo';
import type { routilux__api__models__flow__RoutineInfo } from './routilux__api__models__flow__RoutineInfo';
/**
 * Response model for flow details.
 */
export type FlowResponse = {
    flow_id: string;
    routines: Record<string, routilux__api__models__flow__RoutineInfo>;
    connections: Array<ConnectionInfo>;
    execution_strategy: string;
    max_workers: number;
    created_at?: (string | null);
    updated_at?: (string | null);
};

