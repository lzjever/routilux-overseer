/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoutineMonitoringData } from './RoutineMonitoringData';
/**
 * Complete monitoring data for a job.
 */
export type JobMonitoringData = {
    /**
     * Job ID
     */
    job_id: string;
    /**
     * Flow ID
     */
    flow_id: string;
    /**
     * Job execution status
     */
    job_status: string;
    /**
     * Monitoring data for all routines
     */
    routines: Record<string, RoutineMonitoringData>;
    /**
     * Last update timestamp
     */
    updated_at: string;
};

