/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information about a connection between routines in a flow.
 *
 * Represents a data flow path from one routine's event to another routine's slot.
 *
 * **Example Response**:
 * ```json
 * {
     * "connection_id": "conn_0",
     * "source_routine": "data_source",
     * "source_event": "output",
     * "target_routine": "data_processor",
     * "target_slot": "input"
     * }
     * ```
     *
     * **Connection ID**: Auto-generated identifier for this connection.
     * Used when deleting connections by index.
     */
    export type ConnectionInfo = {
        /**
         * Auto-generated identifier for this connection. Format: 'conn_{index}'. Used when deleting connections.
         */
        connection_id: string;
        /**
         * ID of the routine that emits data (source).
         */
        source_routine: string;
        /**
         * Name of the event that emits data from the source routine.
         */
        source_event: string;
        /**
         * ID of the routine that receives data (target).
         */
        target_routine: string;
        /**
         * Name of the slot that receives data in the target routine.
         */
        target_slot: string;
    };

