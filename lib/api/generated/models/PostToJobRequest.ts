/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for posting data to a routine slot in a running or paused job.
 *
 * This endpoint allows you to send data to a specific routine's input slot while the job is running.
 * This is the primary way to trigger routine execution in the new architecture where all routines
 * start in IDLE state.
 *
 * **When to Use**:
 * - Job is in RUNNING or PAUSED status
 * - You want to send data to a routine's input slot
 * - You want to trigger routine execution
 *
 * **Example Request**:
 * ```json
 * {
     * "routine_id": "data_source",
     * "slot_name": "trigger",
     * "data": {
         * "input": "test_data",
         * "index": 1
         * }
         * }
         * ```
         *
         * **Error Cases**:
         * - 404: Job, flow, routine, or slot not found
         * - 409: Job is not in RUNNING or PAUSED status
         * - 400: Invalid data format
         */
        export type PostToJobRequest = {
            /**
             * The ID of the routine to send data to. Must be a routine that exists in the flow.
             */
            routine_id: string;
            /**
             * The name of the input slot to send data to. Must be a slot defined in the routine.
             */
            slot_name: string;
            /**
             * The data to send to the slot. Can be any JSON-serializable object. If not provided, an empty dictionary will be sent. The data will be queued in the slot and processed according to the routine's activation policy.
             */
            data?: (Record<string, any> | null);
        };

