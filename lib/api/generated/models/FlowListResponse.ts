/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FlowResponse } from './FlowResponse';
/**
 * Response model for flow list.
 *
 * Returns a list of all flows with total count.
 *
 * **Example Response**:
 * ```json
 * {
     * "flows": [
         * {
             * "flow_id": "flow_1",
             * "routines": {...},
             * "connections": [...]
             * }
             * ],
             * "total": 10
             * }
             * ```
             */
            export type FlowListResponse = {
                /**
                 * List of all flows in the system. Each flow contains complete information about routines and connections.
                 */
                flows: Array<FlowResponse>;
                /**
                 * Total number of flows in the system.
                 */
                total: number;
            };

