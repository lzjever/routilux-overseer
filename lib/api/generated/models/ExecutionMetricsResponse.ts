/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoutineMetricsResponse } from './RoutineMetricsResponse';
/**
 * Response model for execution metrics.
 */
export type ExecutionMetricsResponse = {
    job_id: string;
    flow_id: string;
    start_time: string;
    end_time: (string | null);
    duration: (number | null);
    routine_metrics: Record<string, RoutineMetricsResponse>;
    total_events: number;
    total_slot_calls: number;
    total_event_emits: number;
    errors: Array<Record<string, any>>;
};

