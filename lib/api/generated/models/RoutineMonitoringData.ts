/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { routilux__server__models__monitor__RoutineInfo } from './routilux__server__models__monitor__RoutineInfo';
import type { RoutineExecutionStatus } from './RoutineExecutionStatus';
import type { SlotQueueStatus } from './SlotQueueStatus';
/**
 * Complete monitoring data for a routine.
 */
export type RoutineMonitoringData = {
    /**
     * Routine ID
     */
    routine_id: string;
    /**
     * Execution status
     */
    execution_status: RoutineExecutionStatus;
    /**
     * Queue status for all slots
     */
    queue_status: Array<SlotQueueStatus>;
    /**
     * Routine metadata information
     */
    info: routilux__server__models__monitor__RoutineInfo;
};

