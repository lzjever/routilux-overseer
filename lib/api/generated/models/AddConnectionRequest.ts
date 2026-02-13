/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for adding a connection between routines in a flow.
 *
 * Connections define how data flows from one routine to another:
 * - **Source**: The routine that emits the event
 * - **Target**: The routine that receives data in its slot
 *
 * **Example Request**:
 * ```json
 * {
 * "source_routine": "data_source",
 * "source_event": "output",
 * "target_routine": "data_processor",
 * "target_slot": "input"
 * }
 * ```
 *
 * **Validation**:
 * - Both source and target routines must exist in the flow
 * - Source routine must have the specified event
 * - Target routine must have the specified slot
 * - Event output parameters must be compatible with slot expectations
 *
 * **Error Cases**:
 * - 404: Flow, source routine, or target routine not found
 * - 400: Source event doesn't exist
 * - 400: Target slot doesn't exist
 * - 400: Invalid connection (e.g., circular dependency)
 */
export type AddConnectionRequest = {
  /**
   * ID of the routine that emits the event (source of data). Must be a routine that exists in the flow.
   */
  source_routine: string;
  /**
   * Name of the event emitted by the source routine. Must be an event defined in the source routine. Use GET /api/factory/objects/{name}/interface to discover available events.
   */
  source_event: string;
  /**
   * ID of the routine that receives the data (target). Must be a routine that exists in the flow.
   */
  target_routine: string;
  /**
   * Name of the input slot in the target routine that receives the data. Must be a slot defined in the target routine. Use GET /api/factory/objects/{name}/interface to discover available slots.
   */
  target_slot: string;
};
