/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for adding a routine to an existing flow.
 *
 * This endpoint allows you to dynamically add routines to a flow after it's been created.
 * The routine can be created from:
 * 1. **Factory name**: Use a registered factory name (e.g., "data_source")
 * 2. **Class path**: Use a full class path (e.g., "mymodule.DataProcessor")
 *
 * **Factory names are preferred** because they're safer and don't require knowing internal class paths.
 *
 * **Example Request**:
 * ```json
 * {
     * "routine_id": "my_processor",
     * "object_name": "data_transformer",
     * "config": {
         * "name": "MyProcessor",
         * "transformation": "uppercase"
         * }
         * }
         * ```
         *
         * **Error Cases**:
         * - 404: Flow not found
         * - 400: Routine ID already exists in flow
         * - 400: Invalid object_name (not in factory and invalid class path)
         * - 400: Failed to load routine class
         */
        export type AddRoutineRequest = {
            /**
             * Unique identifier for this routine within the flow. Must be unique within the flow. Use this ID to reference the routine in connections and other operations.
             */
            routine_id: string;
            /**
             * Name of the routine to create. Can be either: 1. A factory name (recommended): Registered name in ObjectFactory (e.g., 'data_source', 'data_transformer') 2. A class path: Full module path to the class (e.g., 'mymodule.DataProcessor') Factory names are checked first, then class paths. Use factory names when possible for better security and discoverability.
             */
            object_name: string;
            /**
             * Optional configuration dictionary to pass to the routine. These values will be merged with any default configuration from the factory prototype. The exact configuration options depend on the routine type. Common options include: 'name', 'timeout', 'processing_delay', etc.
             */
            config?: (Record<string, any> | null);
        };

