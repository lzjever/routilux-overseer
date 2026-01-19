/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Routine metadata information.
 */
export type RoutineInfo = {
    /**
     * Routine ID
     */
    routine_id: string;
    /**
     * Routine class name
     */
    routine_type: string;
    /**
     * Activation policy type and configuration
     */
    activation_policy: Record<string, any>;
    /**
     * Routine configuration (_config)
     */
    config: Record<string, any>;
    /**
     * List of slot names
     */
    slots: Array<string>;
    /**
     * List of event names
     */
    events: Array<string>;
};

