/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConnectionInfo } from './ConnectionInfo';
import type { RoutineInfo } from './RoutineInfo';
/**
 * Response model for flow details.
 *
 * Contains complete information about a flow including all routines and connections.
 *
 * **Example Response**:
 * ```json
 * {
     * "flow_id": "data_processing_flow",
     * "routines": {
         * "data_source": {
             * "routine_id": "data_source",
             * "class_name": "DataSource",
             * "slots": ["trigger"],
             * "events": ["output"],
             * "config": {"name": "Source"}
             * },
             * "data_processor": {
                 * "routine_id": "data_processor",
                 * "class_name": "DataTransformer",
                 * "slots": ["input"],
                 * "events": ["output"],
                 * "config": {"name": "Processor"}
                 * }
                 * },
                 * "connections": [
                     * {
                         * "connection_id": "conn_0",
                         * "source_routine": "data_source",
                         * "source_event": "output",
                         * "target_routine": "data_processor",
                         * "target_slot": "input"
                         * }
                         * ],
                         * "created_at": "2025-01-15T10:00:00",
                         * "updated_at": "2025-01-15T10:05:00"
                         * }
                         * ```
                         */
                        export type FlowResponse = {
                            /**
                             * Unique identifier for this flow. Use this ID to reference the flow in API calls.
                             */
                            flow_id: string;
                            /**
                             * Dictionary mapping routine IDs to routine information. Keys are routine IDs, values are RoutineInfo objects containing slots, events, and config.
                             */
                            routines: Record<string, RoutineInfo>;
                            /**
                             * List of all connections in the flow. Each connection represents a data flow path from a source routine's event to a target routine's slot.
                             */
                            connections: Array<ConnectionInfo>;
                            /**
                             * Timestamp when the flow was created. ISO 8601 format.
                             */
                            created_at?: (string | null);
                            /**
                             * Timestamp when the flow was last updated. ISO 8601 format.
                             */
                            updated_at?: (string | null);
                        };

