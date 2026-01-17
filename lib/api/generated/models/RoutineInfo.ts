/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information about a routine in a flow.
 *
 * Contains all metadata about a routine including its interface (slots and events),
 * configuration, and class information.
 *
 * **Example Response**:
 * ```json
 * {
     * "routine_id": "data_processor",
     * "class_name": "DataTransformer",
     * "slots": ["input", "secondary"],
     * "events": ["output", "error"],
     * "config": {
         * "name": "DataProcessor",
         * "transformation": "uppercase"
         * }
         * }
         * ```
         */
        export type RoutineInfo = {
            /**
             * Unique identifier of this routine within the flow.
             */
            routine_id: string;
            /**
             * Name of the routine class (e.g., 'DataTransformer', 'DataSource'). This is the Python class name, useful for debugging and logging.
             */
            class_name: string;
            /**
             * List of input slot names defined in this routine. These are the slots that can receive data from other routines' events. Use these names when creating connections (target_slot).
             */
            slots: Array<string>;
            /**
             * List of output event names defined in this routine. These are the events that this routine can emit to send data to other routines. Use these names when creating connections (source_event).
             */
            events: Array<string>;
            /**
             * Configuration dictionary for this routine. Contains all configuration parameters set on the routine instance. This is a read-only snapshot of the routine's configuration.
             */
            config: Record<string, any>;
        };

