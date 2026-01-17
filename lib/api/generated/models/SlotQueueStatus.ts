/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Slot queue status for monitoring.
 */
export type SlotQueueStatus = {
    /**
     * Slot name
     */
    slot_name: string;
    /**
     * Routine ID that owns this slot
     */
    routine_id: string;
    /**
     * Number of unconsumed data points
     */
    unconsumed_count: number;
    /**
     * Total number of data points in queue
     */
    total_count: number;
    /**
     * Maximum queue length
     */
    max_length: number;
    /**
     * Watermark threshold for auto-shrink
     */
    watermark_threshold: number;
    /**
     * Queue usage percentage (0.0-1.0)
     */
    usage_percentage: number;
    /**
     * Pressure level: low, medium, high, critical
     */
    pressure_level: string;
    /**
     * Whether queue is full
     */
    is_full: boolean;
    /**
     * Whether queue is near full (above watermark)
     */
    is_near_full: boolean;
};

