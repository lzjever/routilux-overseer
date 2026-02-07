/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddConnectionRequest } from '../models/AddConnectionRequest';
import type { AddRoutineRequest } from '../models/AddRoutineRequest';
import type { ConnectionInfo } from '../models/ConnectionInfo';
import type { FlowCreateRequest } from '../models/FlowCreateRequest';
import type { FlowListResponse } from '../models/FlowListResponse';
import type { FlowResponse } from '../models/FlowResponse';
import type { routilux__server__models__flow__RoutineInfo } from '../models/routilux__server__models__flow__RoutineInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FlowsService {
    /**
     * List Flows
     * List all flows in the system.
     *
     * **Overview**:
     * Returns a list of all flows registered in the system, including their routines and connections.
     * Use this endpoint to discover available flows and their structure.
     *
     * **Response Example**:
     * ```json
     * {
         * "flows": [
             * {
                 * "flow_id": "data_processing_flow",
                 * "routines": {
                     * "data_source": {
                         * "routine_id": "data_source",
                         * "class_name": "DataSource",
                         * "slots": ["trigger"],
                         * "events": ["output"],
                         * "config": {"name": "Source"}
                         * }
                         * },
                         * "connections": [
                             * {
                                 * "connection_id": "conn_0",
                                 * "source_routine": "data_source",
                                 * "source_event": "output",
                                 * "target_routine": "processor",
                                 * "target_slot": "input"
                                 * }
                                 * ],
                                 * "created_at": "2025-01-15T10:00:00",
                                 * "updated_at": "2025-01-15T10:05:00"
                                 * }
                                 * ],
                                 * "total": 10
                                 * }
                                 * ```
                                 *
                                 * **Use Cases**:
                                 * - Discover available flows
                                 * - Build flow selection UI
                                 * - Inspect flow structure
                                 * - Verify flow registration
                                 *
                                 * **Performance Note**:
                                 * - Returns complete flow information (routines + connections)
                                 * - For large numbers of flows, consider pagination in future versions
                                 *
                                 * Returns:
                                 * FlowListResponse: List of all flows with total count
                                 *
                                 * Raises:
                                 * HTTPException: 500 if flow store is inaccessible
                                 * @returns FlowListResponse Successful Response
                                 * @throws ApiError
                                 */
                                public static listFlowsApiV1FlowsGet(): CancelablePromise<FlowListResponse> {
                                    return __request(OpenAPI, {
                                        method: 'GET',
                                        url: '/api/v1/flows',
                                    });
                                }
                                /**
                                 * Create Flow
                                 * Create a new flow.
                                 *
                                 * **Overview**:
                                 * Creates a new flow in the system. You can create a flow in three ways:
                                 * 1. **Empty flow**: Just provide a flow_id (or let system generate one)
                                 * 2. **From YAML DSL**: Provide flow definition as YAML string
                                 * 3. **From JSON DSL**: Provide flow definition as JSON object
                                 *
                                 * **Creation Methods**:
                                 *
                                 * **1. Empty Flow** (for dynamic building):
                                 * ```json
                                 * {
                                     * "flow_id": "my_new_flow"
                                     * }
                                     * ```
                                     * Then use POST /api/flows/{flow_id}/routines and POST /api/flows/{flow_id}/connections
                                     * to build the flow dynamically.
                                     *
                                     * **2. From YAML DSL**:
                                     * ```json
                                     * {
                                         * "flow_id": "my_flow",
                                         * "dsl": "flow_id: my_flow
                                         * routines:
                                         * source:
                                         * class: data_source
                                         * config:
                                         * name: Source"
                                         * }
                                         * ```
                                         * Note: `class` field must be a factory name (e.g., "data_source"), not a class path.
                                         *
                                         * **Note on flow_id Priority**:
                                         * - If both `request.flow_id` and DSL contain `flow_id`, `request.flow_id` takes precedence
                                         * - This allows creating new flows from templates by overriding the template's flow_id
                                         * - Example: `{"flow_id": "new_flow", "dsl": "flow_id: template_flow
                                         * ..."}` will create a flow with ID "new_flow"
                                         *
                                         * **3. From JSON DSL**:
                                         * ```json
                                         * {
                                             * "flow_id": "my_flow",
                                             * "dsl_dict": {
                                                 * "flow_id": "my_flow",
                                                 * "routines": {
                                                     * "source": {
                                                         * "class": "data_source",
                                                         * "config": {"name": "Source"}
                                                         * }
                                                         * },
                                                         * "connections": []
                                                         * }
                                                         * }
                                                         * ```
                                                         * **Note on flow_id Priority**: Same as YAML DSL - `request.flow_id` overrides DSL `flow_id`.
                                                         *
                                                         * **Response Example**:
                                                         * ```json
                                                         * {
                                                             * "flow_id": "my_new_flow",
                                                             * "routines": {},
                                                             * "connections": [],
                                                             * "created_at": "2025-01-15T10:00:00",
                                                             * "updated_at": null
                                                             * }
                                                             * ```
                                                             *
                                                             * **Error Responses**:
                                                             * - `400 Bad Request`: Invalid DSL format or creation failed
                                                             * - `409 Conflict`: Flow with this flow_id already exists (returns `FLOW_ALREADY_EXISTS` error code)
                                                             * - `422 Validation Error`: Invalid request parameters
                                                             *
                                                             * **Best Practices**:
                                                             * 1. Use empty flow + dynamic building for interactive flow builders
                                                             * 2. Use DSL for predefined/reusable flows
                                                             * 3. Validate flow after creation: POST /api/flows/{flow_id}/validate
                                                             * 4. **All routines in DSL must be registered in factory** - use factory names: `class: data_source`
                                                             *
                                                             * **Related Endpoints**:
                                                             * - POST /api/flows/{flow_id}/routines - Add routine to flow
                                                             * - POST /api/flows/{flow_id}/connections - Add connection to flow
                                                             * - POST /api/flows/{flow_id}/validate - Validate flow structure
                                                             * - GET /api/flows/{flow_id}/dsl - Export flow as DSL
                                                             *
                                                             * Args:
                                                             * request: FlowCreateRequest with flow_id and optional DSL
                                                             *
                                                             * Returns:
                                                             * FlowResponse: Created flow information
                                                             *
                                                             * Raises:
                                                             * HTTPException: 400 if creation fails
                                                             * HTTPException: 422 if request validation fails
                                                             * @param requestBody
                                                             * @returns FlowResponse Successful Response
                                                             * @throws ApiError
                                                             */
                                                            public static createFlowApiV1FlowsPost(
                                                                requestBody: FlowCreateRequest,
                                                            ): CancelablePromise<FlowResponse> {
                                                                return __request(OpenAPI, {
                                                                    method: 'POST',
                                                                    url: '/api/v1/flows',
                                                                    body: requestBody,
                                                                    mediaType: 'application/json',
                                                                    errors: {
                                                                        422: `Validation Error`,
                                                                    },
                                                                });
                                                            }
                                                            /**
                                                             * Get Flow
                                                             * Get detailed information about a specific flow.
                                                             *
                                                             * **Overview**:
                                                             * Returns complete information about a flow including all routines, their configurations,
                                                             * slots, events, and all connections between routines.
                                                             *
                                                             * **Request Example**:
                                                             * ```
                                                             * GET /api/flows/data_processing_flow
                                                             * ```
                                                             *
                                                             * **Response Example**:
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
                                                                         * "processor": {
                                                                             * "routine_id": "processor",
                                                                             * "class_name": "DataTransformer",
                                                                             * "slots": ["input"],
                                                                             * "events": ["output"],
                                                                             * "config": {"name": "Processor", "transformation": "uppercase"}
                                                                             * }
                                                                             * },
                                                                             * "connections": [
                                                                                 * {
                                                                                     * "connection_id": "conn_0",
                                                                                     * "source_routine": "data_source",
                                                                                     * "source_event": "output",
                                                                                     * "target_routine": "processor",
                                                                                     * "target_slot": "input"
                                                                                     * }
                                                                                     * ],
                                                                                     * "created_at": "2025-01-15T10:00:00",
                                                                                     * "updated_at": "2025-01-15T10:05:00"
                                                                                     * }
                                                                                     * ```
                                                                                     *
                                                                                     * **Use Cases**:
                                                                                     * - Inspect flow structure before execution
                                                                                     * - Build flow visualization UI
                                                                                     * - Verify flow configuration
                                                                                     * - Understand data flow paths
                                                                                     *
                                                                                     * **Error Responses**:
                                                                                     * - `404 Not Found`: Flow with this ID does not exist
                                                                                     *
                                                                                     * **Related Endpoints**:
                                                                                     * - GET /api/flows/{flow_id}/routines - Get just routines (lighter)
                                                                                     * - GET /api/flows/{flow_id}/connections - Get just connections (lighter)
                                                                                     * - GET /api/flows/{flow_id}/dsl - Export flow as DSL
                                                                                     *
                                                                                     * Args:
                                                                                     * flow_id: Unique flow identifier
                                                                                     *
                                                                                     * Returns:
                                                                                     * FlowResponse: Complete flow information
                                                                                     *
                                                                                     * Raises:
                                                                                     * HTTPException: 404 if flow not found
                                                                                     * @param flowId
                                                                                     * @returns FlowResponse Successful Response
                                                                                     * @throws ApiError
                                                                                     */
                                                                                    public static getFlowApiV1FlowsFlowIdGet(
                                                                                        flowId: string,
                                                                                    ): CancelablePromise<FlowResponse> {
                                                                                        return __request(OpenAPI, {
                                                                                            method: 'GET',
                                                                                            url: '/api/v1/flows/{flow_id}',
                                                                                            path: {
                                                                                                'flow_id': flowId,
                                                                                            },
                                                                                            errors: {
                                                                                                422: `Validation Error`,
                                                                                            },
                                                                                        });
                                                                                    }
                                                                                    /**
                                                                                     * Delete Flow
                                                                                     * Delete a flow from the system.
                                                                                     *
                                                                                     * **Overview**:
                                                                                     * Permanently removes a flow from the system. This operation cannot be undone.
                                                                                     * The flow and all its routines/connections are deleted.
                                                                                     *
                                                                                     * **Warning**: This operation is **irreversible**. Make sure you don't need the flow
                                                                                     * before deleting it. Consider exporting the flow as DSL first for backup.
                                                                                     *
                                                                                     * **Request Example**:
                                                                                     * ```
                                                                                     * DELETE /api/flows/data_processing_flow
                                                                                     * ```
                                                                                     *
                                                                                     * **Response**: 204 No Content (successful deletion)
                                                                                     *
                                                                                     * **Error Responses**:
                                                                                     * - `404 Not Found`: Flow with this ID does not exist
                                                                                     *
                                                                                     * **Best Practices**:
                                                                                     * 1. Export flow before deletion: GET /api/flows/{flow_id}/dsl
                                                                                     * 2. Check for active jobs: GET /api/jobs?flow_id={flow_id}
                                                                                     * 3. Consider archiving instead of deleting
                                                                                     *
                                                                                     * **Related Endpoints**:
                                                                                     * - GET /api/flows/{flow_id}/dsl - Export flow before deletion
                                                                                     * - GET /api/jobs?flow_id={flow_id} - Check for active jobs
                                                                                     *
                                                                                     * Args:
                                                                                     * flow_id: Unique flow identifier
                                                                                     *
                                                                                     * Returns:
                                                                                     * None (204 No Content)
                                                                                     *
                                                                                     * Raises:
                                                                                     * HTTPException: 404 if flow not found
                                                                                     * @param flowId
                                                                                     * @returns void
                                                                                     * @throws ApiError
                                                                                     */
                                                                                    public static deleteFlowApiV1FlowsFlowIdDelete(
                                                                                        flowId: string,
                                                                                    ): CancelablePromise<void> {
                                                                                        return __request(OpenAPI, {
                                                                                            method: 'DELETE',
                                                                                            url: '/api/v1/flows/{flow_id}',
                                                                                            path: {
                                                                                                'flow_id': flowId,
                                                                                            },
                                                                                            errors: {
                                                                                                422: `Validation Error`,
                                                                                            },
                                                                                        });
                                                                                    }
                                                                                    /**
                                                                                     * Get Flow Metrics
                                                                                     * Get aggregated metrics for all jobs of a flow.
                                                                                     * @param flowId
                                                                                     * @returns any Successful Response
                                                                                     * @throws ApiError
                                                                                     */
                                                                                    public static getFlowMetricsApiV1FlowsFlowIdMetricsGet(
                                                                                        flowId: string,
                                                                                    ): CancelablePromise<any> {
                                                                                        return __request(OpenAPI, {
                                                                                            method: 'GET',
                                                                                            url: '/api/v1/flows/{flow_id}/metrics',
                                                                                            path: {
                                                                                                'flow_id': flowId,
                                                                                            },
                                                                                            errors: {
                                                                                                422: `Validation Error`,
                                                                                            },
                                                                                        });
                                                                                    }
                                                                                    /**
                                                                                     * Export Flow Dsl
                                                                                     * Export flow as DSL (Domain Specific Language).
                                                                                     *
                                                                                     * **Overview**:
                                                                                     * Exports a flow to its DSL representation, which can be used to recreate the flow
                                                                                     * or store it as a template. The DSL includes all routines, their configurations,
                                                                                     * and all connections.
                                                                                     *
                                                                                     * **Use Cases**:
                                                                                     * - Backup flows before deletion
                                                                                     * - Share flows between systems
                                                                                     * - Version control flows
                                                                                     * - Create flow templates
                                                                                     * - Migrate flows
                                                                                     *
                                                                                     * **Request Examples**:
                                                                                     * ```
                                                                                     * # Export as YAML (human-readable)
                                                                                     * GET /api/flows/data_processing_flow/dsl?format=yaml
                                                                                     *
                                                                                     * # Export as JSON (machine-readable)
                                                                                     * GET /api/flows/data_processing_flow/dsl?format=json
                                                                                     * ```
                                                                                     *
                                                                                     * **Response Example (YAML)**:
                                                                                     * ```json
                                                                                     * {
                                                                                         * "format": "yaml",
                                                                                         * "dsl": "flow_id: data_processing_flow
                                                                                         * routines:
                                                                                         * source:
                                                                                         * class: DataSource
                                                                                         * config:
                                                                                         * name: Source
                                                                                         * connections:
                                                                                         * - from: source.output
                                                                                         * to: processor.input"
                                                                                         * }
                                                                                         * ```
                                                                                         *
                                                                                         * **Response Example (JSON)**:
                                                                                         * ```json
                                                                                         * {
                                                                                             * "format": "json",
                                                                                             * "dsl": "{
                                                                                                 * "flow_id": "data_processing_flow",
                                                                                                 * "routines": {
                                                                                                     * "source": {
                                                                                                         * "class": "DataSource",
                                                                                                         * "config": {
                                                                                                             * "name": "Source"
                                                                                                             * }
                                                                                                             * }
                                                                                                             * },
                                                                                                             * "connections": [
                                                                                                                 * {
                                                                                                                     * "from": "source.output",
                                                                                                                     * "to": "processor.input"
                                                                                                                     * }
                                                                                                                     * ]
                                                                                                                     * }"
                                                                                                                     * }
                                                                                                                     * ```
                                                                                                                     *
                                                                                                                     * **DSL Format**:
                                                                                                                     * The DSL includes:
                                                                                                                     * - `flow_id`: Flow identifier
                                                                                                                     * - `routines`: Dictionary of routine_id -> routine specification
                                                                                                                     * - `class`: Factory name (must be registered in factory)
                                                                                                                     * - `config`: Routine configuration
                                                                                                                     * - `connections`: List of connections
                                                                                                                     * - `from`: "{routine_id}.{event_name}"
                                                                                                                     * - `to`: "{routine_id}.{slot_name}"
                                                                                                                     *
                                                                                                                     * **Factory-Only Requirement**:
                                                                                                                     * All routines in the flow must be registered in the factory for export to succeed.
                                                                                                                     * The exported DSL uses factory names instead of class paths for portability and security.
                                                                                                                     *
                                                                                                                     * **Recreating from DSL**:
                                                                                                                     * ```javascript
                                                                                                                     * // Export flow
                                                                                                                     * const export = await api.flows.exportDSL(flow_id, "yaml");
                                                                                                                     *
                                                                                                                     * // Later, recreate from DSL
                                                                                                                     * const newFlow = await api.flows.create({
                                                                                                                         * flow_id: "restored_flow",
                                                                                                                         * dsl: export.dsl
                                                                                                                         * });
                                                                                                                         * ```
                                                                                                                         *
                                                                                                                         * **Error Responses**:
                                                                                                                         * - `404 Not Found`: Flow not found
                                                                                                                         *
                                                                                                                         * **Related Endpoints**:
                                                                                                                         * - POST /api/flows - Create flow from DSL
                                                                                                                         * - DELETE /api/flows/{flow_id} - Delete flow (export first!)
                                                                                                                         *
                                                                                                                         * Args:
                                                                                                                         * flow_id: Unique flow identifier
                                                                                                                         * format: Export format: "yaml" or "json"
                                                                                                                         *
                                                                                                                         * Returns:
                                                                                                                         * dict: Format and DSL string
                                                                                                                         *
                                                                                                                         * Raises:
                                                                                                                         * HTTPException: 404 if flow not found
                                                                                                                         * HTTPException: 422 if format is invalid
                                                                                                                         * @param flowId
                                                                                                                         * @param format Export format: 'yaml' (human-readable) or 'json' (machine-readable). Default: yaml.
                                                                                                                         * @returns any Successful Response
                                                                                                                         * @throws ApiError
                                                                                                                         */
                                                                                                                        public static exportFlowDslApiV1FlowsFlowIdDslGet(
                                                                                                                            flowId: string,
                                                                                                                            format: string = 'yaml',
                                                                                                                        ): CancelablePromise<any> {
                                                                                                                            return __request(OpenAPI, {
                                                                                                                                method: 'GET',
                                                                                                                                url: '/api/v1/flows/{flow_id}/dsl',
                                                                                                                                path: {
                                                                                                                                    'flow_id': flowId,
                                                                                                                                },
                                                                                                                                query: {
                                                                                                                                    'format': format,
                                                                                                                                },
                                                                                                                                errors: {
                                                                                                                                    422: `Validation Error`,
                                                                                                                                },
                                                                                                                            });
                                                                                                                        }
                                                                                                                        /**
                                                                                                                         * Validate Flow
                                                                                                                         * Validate flow structure and configuration.
                                                                                                                         *
                                                                                                                         * **Overview**:
                                                                                                                         * Validates a flow's structure and returns a list of any issues found.
                                                                                                                         * This is useful before executing a flow to catch configuration errors early.
                                                                                                                         *
                                                                                                                         * **Validation Checks**:
                                                                                                                         * - Circular dependencies (errors)
                                                                                                                         * - Unconnected events (warnings)
                                                                                                                         * - Unconnected slots (warnings)
                                                                                                                         * - Invalid connections (errors)
                                                                                                                         * - Missing routines in connections
                                                                                                                         * - Invalid routine configurations
                                                                                                                         *
                                                                                                                         * **Request Example**:
                                                                                                                         * ```
                                                                                                                         * POST /api/flows/data_processing_flow/validate
                                                                                                                         * ```
                                                                                                                         *
                                                                                                                         * **Response Example (Valid Flow)**:
                                                                                                                         * ```json
                                                                                                                         * {
                                                                                                                             * "valid": true,
                                                                                                                             * "issues": []
                                                                                                                             * }
                                                                                                                             * ```
                                                                                                                             *
                                                                                                                             * **Response Example (Invalid Flow)**:
                                                                                                                             * ```json
                                                                                                                             * {
                                                                                                                                 * "valid": false,
                                                                                                                                 * "issues": [
                                                                                                                                     * "Circular dependency detected: routine_A -> routine_B -> routine_A",
                                                                                                                                     * "Event 'output' in routine 'source' is not connected to any slot",
                                                                                                                                     * "Slot 'input' in routine 'processor' has no incoming connections"
                                                                                                                                     * ]
                                                                                                                                     * }
                                                                                                                                     * ```
                                                                                                                                     *
                                                                                                                                     * **Issue Types**:
                                                                                                                                     * - **Errors**: Must be fixed before flow can execute properly
                                                                                                                                     * - **Warnings**: May indicate design issues but won't prevent execution
                                                                                                                                     *
                                                                                                                                     * **Use Cases**:
                                                                                                                                     * - Validate flow before execution
                                                                                                                                     * - Check flow after dynamic modifications
                                                                                                                                     * - CI/CD pipeline validation
                                                                                                                                     * - Flow builder validation
                                                                                                                                     *
                                                                                                                                     * **Best Practices**:
                                                                                                                                     * 1. Validate after creating/modifying flows
                                                                                                                                     * 2. Fix all errors before execution
                                                                                                                                     * 3. Review warnings for potential issues
                                                                                                                                     * 4. Re-validate after adding routines/connections
                                                                                                                                     *
                                                                                                                                     * **Error Responses**:
                                                                                                                                     * - `404 Not Found`: Flow not found
                                                                                                                                     *
                                                                                                                                     * **Related Endpoints**:
                                                                                                                                     * - POST /api/flows/{flow_id}/routines - Add routine (then validate)
                                                                                                                                     * - POST /api/flows/{flow_id}/connections - Add connection (then validate)
                                                                                                                                     * - POST /api/jobs - Start job (validates automatically)
                                                                                                                                     *
                                                                                                                                     * Args:
                                                                                                                                     * flow_id: Unique flow identifier
                                                                                                                                     *
                                                                                                                                     * Returns:
                                                                                                                                     * dict: Validation result with list of issues
                                                                                                                                     *
                                                                                                                                     * Raises:
                                                                                                                                     * HTTPException: 404 if flow not found
                                                                                                                                     * @param flowId
                                                                                                                                     * @returns any Successful Response
                                                                                                                                     * @throws ApiError
                                                                                                                                     */
                                                                                                                                    public static validateFlowApiV1FlowsFlowIdValidatePost(
                                                                                                                                        flowId: string,
                                                                                                                                    ): CancelablePromise<any> {
                                                                                                                                        return __request(OpenAPI, {
                                                                                                                                            method: 'POST',
                                                                                                                                            url: '/api/v1/flows/{flow_id}/validate',
                                                                                                                                            path: {
                                                                                                                                                'flow_id': flowId,
                                                                                                                                            },
                                                                                                                                            errors: {
                                                                                                                                                422: `Validation Error`,
                                                                                                                                            },
                                                                                                                                        });
                                                                                                                                    }
                                                                                                                                    /**
                                                                                                                                     * Get Routine Info
                                                                                                                                     * Get routine metadata information (policy, config, slots, events).
                                                                                                                                     * @param flowId
                                                                                                                                     * @param routineId
                                                                                                                                     * @returns routilux__server__models__flow__RoutineInfo Successful Response
                                                                                                                                     * @throws ApiError
                                                                                                                                     */
                                                                                                                                    public static getRoutineInfoApiV1FlowsFlowIdRoutinesRoutineIdInfoGet(
                                                                                                                                        flowId: string,
                                                                                                                                        routineId: string,
                                                                                                                                    ): CancelablePromise<routilux__server__models__flow__RoutineInfo> {
                                                                                                                                        return __request(OpenAPI, {
                                                                                                                                            method: 'GET',
                                                                                                                                            url: '/api/v1/flows/{flow_id}/routines/{routine_id}/info',
                                                                                                                                            path: {
                                                                                                                                                'flow_id': flowId,
                                                                                                                                                'routine_id': routineId,
                                                                                                                                            },
                                                                                                                                            errors: {
                                                                                                                                                422: `Validation Error`,
                                                                                                                                            },
                                                                                                                                        });
                                                                                                                                    }
                                                                                                                                    /**
                                                                                                                                     * List Flow Routines
                                                                                                                                     * List all routines in a flow with their interface information.
                                                                                                                                     *
                                                                                                                                     * **Overview**:
                                                                                                                                     * Returns a dictionary of all routines in the flow, including their slots, events,
                                                                                                                                     * configuration, and class information. This is essential for understanding flow
                                                                                                                                     * structure and building connections.
                                                                                                                                     *
                                                                                                                                     * **Request Example**:
                                                                                                                                     * ```
                                                                                                                                     * GET /api/flows/data_processing_flow/routines
                                                                                                                                     * ```
                                                                                                                                     *
                                                                                                                                     * **Response Example**:
                                                                                                                                     * ```json
                                                                                                                                     * {
                                                                                                                                         * "data_source": {
                                                                                                                                             * "routine_id": "data_source",
                                                                                                                                             * "class_name": "DataSource",
                                                                                                                                             * "slots": ["trigger"],
                                                                                                                                             * "events": ["output"],
                                                                                                                                             * "config": {"name": "Source"}
                                                                                                                                             * },
                                                                                                                                             * "processor": {
                                                                                                                                                 * "routine_id": "processor",
                                                                                                                                                 * "class_name": "DataTransformer",
                                                                                                                                                 * "slots": ["input"],
                                                                                                                                                 * "events": ["output"],
                                                                                                                                                 * "config": {"name": "Processor", "transformation": "uppercase"}
                                                                                                                                                 * }
                                                                                                                                                 * }
                                                                                                                                                 * ```
                                                                                                                                                 *
                                                                                                                                                 * **Use Cases**:
                                                                                                                                                 * - Discover flow structure
                                                                                                                                                 * - Build connection UI (see available slots/events)
                                                                                                                                                 * - Verify routine configuration
                                                                                                                                                 * - Understand data flow paths
                                                                                                                                                 *
                                                                                                                                                 * **Interface Information**:
                                                                                                                                                 * - `slots`: Input slots (use as target_slot in connections)
                                                                                                                                                 * - `events`: Output events (use as source_event in connections)
                                                                                                                                                 * - `config`: Current routine configuration
                                                                                                                                                 *
                                                                                                                                                 * **Error Responses**:
                                                                                                                                                 * - `404 Not Found`: Flow not found
                                                                                                                                                 *
                                                                                                                                                 * **Related Endpoints**:
                                                                                                                                                 * - GET /api/flows/{flow_id} - Get complete flow information
                                                                                                                                                 * - GET /api/flows/{flow_id}/connections - List connections
                                                                                                                                                 * - GET /api/factory/objects/{name}/interface - Get routine interface from factory
                                                                                                                                                 *
                                                                                                                                                 * Args:
                                                                                                                                                 * flow_id: Unique flow identifier
                                                                                                                                                 *
                                                                                                                                                 * Returns:
                                                                                                                                                 * Dict[str, RoutineInfo]: Dictionary mapping routine_id to routine information
                                                                                                                                                 *
                                                                                                                                                 * Raises:
                                                                                                                                                 * HTTPException: 404 if flow not found
                                                                                                                                                 * @param flowId
                                                                                                                                                 * @returns routilux__server__models__flow__RoutineInfo Successful Response
                                                                                                                                                 * @throws ApiError
                                                                                                                                                 */
                                                                                                                                                public static listFlowRoutinesApiV1FlowsFlowIdRoutinesGet(
                                                                                                                                                    flowId: string,
                                                                                                                                                ): CancelablePromise<Record<string, routilux__server__models__flow__RoutineInfo>> {
                                                                                                                                                    return __request(OpenAPI, {
                                                                                                                                                        method: 'GET',
                                                                                                                                                        url: '/api/v1/flows/{flow_id}/routines',
                                                                                                                                                        path: {
                                                                                                                                                            'flow_id': flowId,
                                                                                                                                                        },
                                                                                                                                                        errors: {
                                                                                                                                                            422: `Validation Error`,
                                                                                                                                                        },
                                                                                                                                                    });
                                                                                                                                                }
                                                                                                                                                /**
                                                                                                                                                 * Add Routine To Flow
                                                                                                                                                 * Add a routine to an existing flow.
                                                                                                                                                 *
                                                                                                                                                 * **Overview**:
                                                                                                                                                 * Dynamically adds a routine to an existing flow. The routine can be created from:
                                                                                                                                                 * 1. **Factory name** (recommended): Use a registered factory name like "data_source"
                                                                                                                                                 * 2. **Class path**: Use full module path like "mymodule.DataProcessor"
                                                                                                                                                 *
                                                                                                                                                 * **Factory-Only Requirement**:
                                                                                                                                                 * - All routines must be registered in the factory before use
                                                                                                                                                 * - Use GET /api/factory/objects to see available factory names
                                                                                                                                                 * - Factory names are required - class paths are no longer supported
                                                                                                                                                 *
                                                                                                                                                 * **Request Example**:
                                                                                                                                                 * ```json
                                                                                                                                                 * {
                                                                                                                                                     * "routine_id": "data_processor",
                                                                                                                                                     * "object_name": "data_transformer",
                                                                                                                                                     * "config": {
                                                                                                                                                         * "name": "MyProcessor",
                                                                                                                                                         * "transformation": "uppercase",
                                                                                                                                                         * "timeout": 30
                                                                                                                                                         * }
                                                                                                                                                         * }
                                                                                                                                                         * ```
                                                                                                                                                         *
                                                                                                                                                         * **Response Example**:
                                                                                                                                                         * ```json
                                                                                                                                                         * {
                                                                                                                                                             * "routine_id": "data_processor",
                                                                                                                                                             * "status": "added"
                                                                                                                                                             * }
                                                                                                                                                             * ```
                                                                                                                                                             *
                                                                                                                                                             * **Configuration**:
                                                                                                                                                             * - `config` is optional and will be merged with factory defaults
                                                                                                                                                             * - Configuration is applied to the routine instance
                                                                                                                                                             * - Use GET /api/factory/objects/{name} to see example_config for reference
                                                                                                                                                             *
                                                                                                                                                             * **Error Responses**:
                                                                                                                                                             * - `404 Not Found`: Flow not found
                                                                                                                                                             * - `400 Bad Request`: Routine ID already exists, or object_name not found in factory
                                                                                                                                                             * - `422 Validation Error`: Invalid request parameters
                                                                                                                                                             *
                                                                                                                                                             * **Validation**:
                                                                                                                                                             * - Routine ID must be unique within the flow
                                                                                                                                                             * - Object name must exist in factory (factory-only, no class paths)
                                                                                                                                                             * - Config must be a valid dictionary
                                                                                                                                                             *
                                                                                                                                                             * **Best Practices**:
                                                                                                                                                             * 1. Use factory names when possible (safer, discoverable)
                                                                                                                                                             * 2. Check available objects first: GET /api/objects
                                                                                                                                                             * 3. Verify routine interface: GET /api/objects/{name}/interface
                                                                                                                                                             * 4. Validate flow after adding routines: POST /api/flows/{flow_id}/validate
                                                                                                                                                             *
                                                                                                                                                             * **Related Endpoints**:
                                                                                                                                                             * - GET /api/factory/objects - List available factory objects
                                                                                                                                                             * - GET /api/factory/objects/{name}/interface - Get routine interface (slots/events)
                                                                                                                                                             * - GET /api/flows/{flow_id}/routines - List routines in flow
                                                                                                                                                             * - DELETE /api/flows/{flow_id}/routines/{routine_id} - Remove routine
                                                                                                                                                             *
                                                                                                                                                             * Args:
                                                                                                                                                             * flow_id: Flow identifier
                                                                                                                                                             * request: AddRoutineRequest with routine_id, object_name, and optional config
                                                                                                                                                             *
                                                                                                                                                             * Returns:
                                                                                                                                                             * dict: Status confirmation with routine_id
                                                                                                                                                             *
                                                                                                                                                             * Raises:
                                                                                                                                                             * HTTPException: 404 if flow not found
                                                                                                                                                             * HTTPException: 400 if routine ID conflict or object_name invalid
                                                                                                                                                             * HTTPException: 422 if request validation fails
                                                                                                                                                             * @param flowId
                                                                                                                                                             * @param requestBody
                                                                                                                                                             * @returns any Successful Response
                                                                                                                                                             * @throws ApiError
                                                                                                                                                             */
                                                                                                                                                            public static addRoutineToFlowApiV1FlowsFlowIdRoutinesPost(
                                                                                                                                                                flowId: string,
                                                                                                                                                                requestBody: AddRoutineRequest,
                                                                                                                                                            ): CancelablePromise<any> {
                                                                                                                                                                return __request(OpenAPI, {
                                                                                                                                                                    method: 'POST',
                                                                                                                                                                    url: '/api/v1/flows/{flow_id}/routines',
                                                                                                                                                                    path: {
                                                                                                                                                                        'flow_id': flowId,
                                                                                                                                                                    },
                                                                                                                                                                    body: requestBody,
                                                                                                                                                                    mediaType: 'application/json',
                                                                                                                                                                    errors: {
                                                                                                                                                                        422: `Validation Error`,
                                                                                                                                                                    },
                                                                                                                                                                });
                                                                                                                                                            }
                                                                                                                                                            /**
                                                                                                                                                             * List Flow Connections
                                                                                                                                                             * List all connections in a flow.
                                                                                                                                                             *
                                                                                                                                                             * **Overview**:
                                                                                                                                                             * Returns a list of all data flow connections in the flow, showing how routines
                                                                                                                                                             * are connected via events and slots.
                                                                                                                                                             *
                                                                                                                                                             * **Request Example**:
                                                                                                                                                             * ```
                                                                                                                                                             * GET /api/flows/data_processing_flow/connections
                                                                                                                                                             * ```
                                                                                                                                                             *
                                                                                                                                                             * **Response Example**:
                                                                                                                                                             * ```json
                                                                                                                                                             * [
                                                                                                                                                                 * {
                                                                                                                                                                     * "connection_id": "conn_0",
                                                                                                                                                                     * "source_routine": "data_source",
                                                                                                                                                                     * "source_event": "output",
                                                                                                                                                                     * "target_routine": "processor",
                                                                                                                                                                     * "target_slot": "input"
                                                                                                                                                                     * },
                                                                                                                                                                     * {
                                                                                                                                                                         * "connection_id": "conn_1",
                                                                                                                                                                         * "source_routine": "processor",
                                                                                                                                                                         * "source_event": "output",
                                                                                                                                                                         * "target_routine": "sink",
                                                                                                                                                                         * "target_slot": "input"
                                                                                                                                                                         * }
                                                                                                                                                                         * ]
                                                                                                                                                                         * ```
                                                                                                                                                                         *
                                                                                                                                                                         * **Connection Structure**:
                                                                                                                                                                         * Each connection represents a data flow path:
                                                                                                                                                                         * - `source_routine` emits `source_event`
                                                                                                                                                                         * - Data flows to `target_routine`'s `target_slot`
                                                                                                                                                                         * - `connection_id` is auto-generated (used for deletion)
                                                                                                                                                                         *
                                                                                                                                                                         * **Use Cases**:
                                                                                                                                                                         * - Visualize flow structure
                                                                                                                                                                         * - Verify connections
                                                                                                                                                                         * - Build flow diagram
                                                                                                                                                                         * - Debug data flow issues
                                                                                                                                                                         *
                                                                                                                                                                         * **Connection Order**:
                                                                                                                                                                         * - Connections are returned in the order they were created
                                                                                                                                                                         * - Connection index matches list index (for deletion)
                                                                                                                                                                         *
                                                                                                                                                                         * **Error Responses**:
                                                                                                                                                                         * - `404 Not Found`: Flow not found
                                                                                                                                                                         *
                                                                                                                                                                         * **Related Endpoints**:
                                                                                                                                                                         * - GET /api/flows/{flow_id}/routines - List routines (see what can be connected)
                                                                                                                                                                         * - POST /api/flows/{flow_id}/connections - Add new connection
                                                                                                                                                                         * - DELETE /api/flows/{flow_id}/connections/{connection_index} - Remove connection
                                                                                                                                                                         *
                                                                                                                                                                         * Args:
                                                                                                                                                                         * flow_id: Unique flow identifier
                                                                                                                                                                         *
                                                                                                                                                                         * Returns:
                                                                                                                                                                         * List[ConnectionInfo]: List of all connections in the flow
                                                                                                                                                                         *
                                                                                                                                                                         * Raises:
                                                                                                                                                                         * HTTPException: 404 if flow not found
                                                                                                                                                                         * @param flowId
                                                                                                                                                                         * @returns ConnectionInfo Successful Response
                                                                                                                                                                         * @throws ApiError
                                                                                                                                                                         */
                                                                                                                                                                        public static listFlowConnectionsApiV1FlowsFlowIdConnectionsGet(
                                                                                                                                                                            flowId: string,
                                                                                                                                                                        ): CancelablePromise<Array<ConnectionInfo>> {
                                                                                                                                                                            return __request(OpenAPI, {
                                                                                                                                                                                method: 'GET',
                                                                                                                                                                                url: '/api/v1/flows/{flow_id}/connections',
                                                                                                                                                                                path: {
                                                                                                                                                                                    'flow_id': flowId,
                                                                                                                                                                                },
                                                                                                                                                                                errors: {
                                                                                                                                                                                    422: `Validation Error`,
                                                                                                                                                                                },
                                                                                                                                                                            });
                                                                                                                                                                        }
                                                                                                                                                                        /**
                                                                                                                                                                         * Add Connection To Flow
                                                                                                                                                                         * Add a connection between routines in a flow.
                                                                                                                                                                         *
                                                                                                                                                                         * **Overview**:
                                                                                                                                                                         * Creates a data flow connection from a source routine's event to a target routine's slot.
                                                                                                                                                                         * This defines how data flows through the workflow.
                                                                                                                                                                         *
                                                                                                                                                                         * **Connection Structure**:
                                                                                                                                                                         * - **Source**: Routine that emits data (via event)
                                                                                                                                                                         * - **Target**: Routine that receives data (via slot)
                                                                                                                                                                         * - Data flows: source_routine.event → target_routine.slot
                                                                                                                                                                         *
                                                                                                                                                                         * **Request Example**:
                                                                                                                                                                         * ```json
                                                                                                                                                                         * {
                                                                                                                                                                             * "source_routine": "data_source",
                                                                                                                                                                             * "source_event": "output",
                                                                                                                                                                             * "target_routine": "data_processor",
                                                                                                                                                                             * "target_slot": "input"
                                                                                                                                                                             * }
                                                                                                                                                                             * ```
                                                                                                                                                                             *
                                                                                                                                                                             * **Response Example**:
                                                                                                                                                                             * ```json
                                                                                                                                                                             * {
                                                                                                                                                                                 * "status": "connected"
                                                                                                                                                                                 * }
                                                                                                                                                                                 * ```
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Validation**:
                                                                                                                                                                                 * - Both source and target routines must exist in the flow
                                                                                                                                                                                 * - Source routine must have the specified event
                                                                                                                                                                                 * - Target routine must have the specified slot
                                                                                                                                                                                 * - Connection is validated for correctness
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Error Responses**:
                                                                                                                                                                                 * - `404 Not Found`: Flow, source routine, or target routine not found
                                                                                                                                                                                 * - `400 Bad Request`: Event or slot doesn't exist, invalid connection
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Discovering Interfaces**:
                                                                                                                                                                                 * Before creating connections, discover routine interfaces:
                                                                                                                                                                                 * 1. Get routine info: GET /api/flows/{flow_id}/routines/{routine_id}
                                                                                                                                                                                 * 2. Or get factory interface: GET /api/objects/{name}/interface
                                                                                                                                                                                 * 3. Use the `events` list for source_event
                                                                                                                                                                                 * 4. Use the `slots` list for target_slot
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Best Practices**:
                                                                                                                                                                                 * 1. Verify routines exist before connecting
                                                                                                                                                                                 * 2. Check routine interfaces to ensure event/slot exist
                                                                                                                                                                                 * 3. Validate flow after adding connections: POST /api/flows/{flow_id}/validate
                                                                                                                                                                                 * 4. Use meaningful routine IDs for clarity
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Related Endpoints**:
                                                                                                                                                                                 * - GET /api/flows/{flow_id}/routines - List routines (see slots/events)
                                                                                                                                                                                 * - GET /api/objects/{name}/interface - Get routine interface
                                                                                                                                                                                 * - GET /api/flows/{flow_id}/connections - List all connections
                                                                                                                                                                                 * - DELETE /api/flows/{flow_id}/connections/{connection_index} - Remove connection
                                                                                                                                                                                 *
                                                                                                                                                                                 * Args:
                                                                                                                                                                                 * flow_id: Flow identifier
                                                                                                                                                                                 * request: AddConnectionRequest with source and target information
                                                                                                                                                                                 *
                                                                                                                                                                                 * Returns:
                                                                                                                                                                                 * dict: Status confirmation
                                                                                                                                                                                 *
                                                                                                                                                                                 * Raises:
                                                                                                                                                                                 * HTTPException: 404 if flow or routines not found
                                                                                                                                                                                 * HTTPException: 400 if connection is invalid
                                                                                                                                                                                 * HTTPException: 422 if request validation fails
                                                                                                                                                                                 * @param flowId
                                                                                                                                                                                 * @param requestBody
                                                                                                                                                                                 * @returns any Successful Response
                                                                                                                                                                                 * @throws ApiError
                                                                                                                                                                                 */
                                                                                                                                                                                public static addConnectionToFlowApiV1FlowsFlowIdConnectionsPost(
                                                                                                                                                                                    flowId: string,
                                                                                                                                                                                    requestBody: AddConnectionRequest,
                                                                                                                                                                                ): CancelablePromise<any> {
                                                                                                                                                                                    return __request(OpenAPI, {
                                                                                                                                                                                        method: 'POST',
                                                                                                                                                                                        url: '/api/v1/flows/{flow_id}/connections',
                                                                                                                                                                                        path: {
                                                                                                                                                                                            'flow_id': flowId,
                                                                                                                                                                                        },
                                                                                                                                                                                        body: requestBody,
                                                                                                                                                                                        mediaType: 'application/json',
                                                                                                                                                                                        errors: {
                                                                                                                                                                                            422: `Validation Error`,
                                                                                                                                                                                        },
                                                                                                                                                                                    });
                                                                                                                                                                                }
                                                                                                                                                                                /**
                                                                                                                                                                                 * Remove Routine From Flow
                                                                                                                                                                                 * Remove a routine from a flow.
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Overview**:
                                                                                                                                                                                 * Removes a routine from a flow and automatically removes all connections
                                                                                                                                                                                 * involving that routine (both incoming and outgoing).
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Warning**: This operation automatically removes all connections involving
                                                                                                                                                                                 * this routine. The routine and its connections cannot be recovered.
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Request Example**:
                                                                                                                                                                                 * ```
                                                                                                                                                                                 * DELETE /api/flows/data_processing_flow/routines/processor
                                                                                                                                                                                 * ```
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Response**: 204 No Content (successful deletion)
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Automatic Cleanup**:
                                                                                                                                                                                 * When a routine is removed, the following are automatically removed:
                                                                                                                                                                                 * - All connections where this routine is the source
                                                                                                                                                                                 * - All connections where this routine is the target
                                                                                                                                                                                 * - The routine itself
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Error Responses**:
                                                                                                                                                                                 * - `404 Not Found`: Flow or routine not found
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Best Practices**:
                                                                                                                                                                                 * 1. Check connections first: GET /api/flows/{flow_id}/connections
                                                                                                                                                                                 * 2. Verify no active jobs: GET /api/jobs?flow_id={flow_id}
                                                                                                                                                                                 * 3. Consider exporting flow: GET /api/flows/{flow_id}/dsl (for backup)
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Related Endpoints**:
                                                                                                                                                                                 * - GET /api/flows/{flow_id}/routines - List routines
                                                                                                                                                                                 * - GET /api/flows/{flow_id}/connections - List connections (to see what will be removed)
                                                                                                                                                                                 * - POST /api/flows/{flow_id}/routines - Add routine
                                                                                                                                                                                 *
                                                                                                                                                                                 * Args:
                                                                                                                                                                                 * flow_id: Unique flow identifier
                                                                                                                                                                                 * routine_id: Routine identifier to remove
                                                                                                                                                                                 *
                                                                                                                                                                                 * Returns:
                                                                                                                                                                                 * None (204 No Content)
                                                                                                                                                                                 *
                                                                                                                                                                                 * Raises:
                                                                                                                                                                                 * HTTPException: 404 if flow or routine not found
                                                                                                                                                                                 * @param flowId
                                                                                                                                                                                 * @param routineId
                                                                                                                                                                                 * @returns void
                                                                                                                                                                                 * @throws ApiError
                                                                                                                                                                                 */
                                                                                                                                                                                public static removeRoutineFromFlowApiV1FlowsFlowIdRoutinesRoutineIdDelete(
                                                                                                                                                                                    flowId: string,
                                                                                                                                                                                    routineId: string,
                                                                                                                                                                                ): CancelablePromise<void> {
                                                                                                                                                                                    return __request(OpenAPI, {
                                                                                                                                                                                        method: 'DELETE',
                                                                                                                                                                                        url: '/api/v1/flows/{flow_id}/routines/{routine_id}',
                                                                                                                                                                                        path: {
                                                                                                                                                                                            'flow_id': flowId,
                                                                                                                                                                                            'routine_id': routineId,
                                                                                                                                                                                        },
                                                                                                                                                                                        errors: {
                                                                                                                                                                                            422: `Validation Error`,
                                                                                                                                                                                        },
                                                                                                                                                                                    });
                                                                                                                                                                                }
                                                                                                                                                                                /**
                                                                                                                                                                                 * Remove Connection From Flow
                                                                                                                                                                                 * Remove a connection from a flow.
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Overview**:
                                                                                                                                                                                 * Removes a specific connection from a flow by its index. The index corresponds
                                                                                                                                                                                 * to the connection's position in the list returned by GET /api/flows/{flow_id}/connections.
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Warning**: This operation is **irreversible**. The connection cannot be recovered.
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Request Example**:
                                                                                                                                                                                 * ```
                                                                                                                                                                                 * DELETE /api/flows/data_processing_flow/connections/0
                                                                                                                                                                                 * ```
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Response**: 204 No Content (successful deletion)
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Finding Connection Index**:
                                                                                                                                                                                 * 1. Get all connections: GET /api/flows/{flow_id}/connections
                                                                                                                                                                                 * 2. Find the connection you want to remove
                                                                                                                                                                                 * 3. Use its index in the list (0-based)
                                                                                                                                                                                 *
                                                                                                                                                                                 * **Example**:
                                                                                                                                                                                 * ```javascript
                                                                                                                                                                                 * // Get connections
                                                                                                                                                                                 * const connections = await api.flows.getConnections(flow_id);
                                                                                                                                                                                 * // connections = [
                                                                                                                                                                                     * //   { connection_id: "conn_0", source_routine: "source", ... },  // index 0
                                                                                                                                                                                     * //   { connection_id: "conn_1", source_routine: "processor", ... }  // index 1
                                                                                                                                                                                     * // ]
                                                                                                                                                                                     *
                                                                                                                                                                                     * // Remove first connection (index 0)
                                                                                                                                                                                     * await api.flows.removeConnection(flow_id, 0);
                                                                                                                                                                                     * ```
                                                                                                                                                                                     *
                                                                                                                                                                                     * **Error Responses**:
                                                                                                                                                                                     * - `404 Not Found`: Flow not found or connection_index out of range
                                                                                                                                                                                     *
                                                                                                                                                                                     * **Best Practices**:
                                                                                                                                                                                     * 1. List connections first to find the correct index
                                                                                                                                                                                     * 2. Verify connection before deletion
                                                                                                                                                                                     * 3. Validate flow after removal: POST /api/flows/{flow_id}/validate
                                                                                                                                                                                     *
                                                                                                                                                                                     * **Related Endpoints**:
                                                                                                                                                                                     * - GET /api/flows/{flow_id}/connections - List connections (to find index)
                                                                                                                                                                                     * - POST /api/flows/{flow_id}/connections - Add connection
                                                                                                                                                                                     *
                                                                                                                                                                                     * Args:
                                                                                                                                                                                     * flow_id: Unique flow identifier
                                                                                                                                                                                     * connection_index: Zero-based index of the connection to remove
                                                                                                                                                                                     *
                                                                                                                                                                                     * Returns:
                                                                                                                                                                                     * None (204 No Content)
                                                                                                                                                                                     *
                                                                                                                                                                                     * Raises:
                                                                                                                                                                                     * HTTPException: 404 if flow not found or index out of range
                                                                                                                                                                                     * @param flowId
                                                                                                                                                                                     * @param connectionIndex
                                                                                                                                                                                     * @returns void
                                                                                                                                                                                     * @throws ApiError
                                                                                                                                                                                     */
                                                                                                                                                                                    public static removeConnectionFromFlowApiV1FlowsFlowIdConnectionsConnectionIndexDelete(
                                                                                                                                                                                        flowId: string,
                                                                                                                                                                                        connectionIndex: number,
                                                                                                                                                                                    ): CancelablePromise<void> {
                                                                                                                                                                                        return __request(OpenAPI, {
                                                                                                                                                                                            method: 'DELETE',
                                                                                                                                                                                            url: '/api/v1/flows/{flow_id}/connections/{connection_index}',
                                                                                                                                                                                            path: {
                                                                                                                                                                                                'flow_id': flowId,
                                                                                                                                                                                                'connection_index': connectionIndex,
                                                                                                                                                                                            },
                                                                                                                                                                                            errors: {
                                                                                                                                                                                                422: `Validation Error`,
                                                                                                                                                                                            },
                                                                                                                                                                                        });
                                                                                                                                                                                    }
                                                                                                                                                                                }
