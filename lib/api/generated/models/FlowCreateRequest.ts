/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a flow.
 */
export type FlowCreateRequest = {
    flow_id?: (string | null);
    dsl?: (string | null);
    dsl_dict?: (Record<string, any> | null);
    execution_strategy?: (string | null);
    max_workers?: (number | null);
};

