/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for routine metrics.
 */
export type RoutineMetricsResponse = {
    routine_id: string;
    execution_count: number;
    total_duration: number;
    avg_duration: number;
    min_duration: (number | null);
    max_duration: (number | null);
    error_count: number;
    last_execution: (string | null);
};

