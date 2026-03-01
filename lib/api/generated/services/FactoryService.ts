/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectListResponse } from '../models/ObjectListResponse';
import type { ObjectMetadataResponse } from '../models/ObjectMetadataResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FactoryService {
    /**
     * List Factory Objects
     * List all available objects registered in the factory.
     *
     * **Overview**:
     * Returns a list of all routines and flows registered in the ObjectFactory.
     * These are the building blocks you can use to create flows dynamically.
     *
     * **Endpoint**: `GET /api/factory/objects`
     *
     * **Use Cases**:
     * - Discover available routines for flow building
     * - Build routine selection UI
     * - Filter routines by category and object type
     * - Understand what's available in the system
     *
     * **Request Examples**:
     * ```
     * # Get all objects
     * GET /api/factory/objects
     *
     * # Get only routines
     * GET /api/factory/objects?object_type=routine
     *
     * # Get only flows
     * GET /api/factory/objects?object_type=flow
     *
     * # Get routines in a specific category
     * GET /api/factory/objects?category=data_generation&object_type=routine
     *
     * # Get all objects in a specific category
     * GET /api/factory/objects?category=data_generation
     * ```
     *
     * **Response Example**:
     * ```json
     * {
         * "objects": [
             * {
                 * "name": "data_source",
                 * "type": "class",
                 * "object_type": "routine",
                 * "description": "Generates sample data with metadata",
                 * "category": "data_generation",
                 * "tags": ["source", "generator"],
                 * "example_config": {"name": "Exampledata_source"},
                 * "version": "1.0.0"
                 * },
                 * {
                     * "name": "data_transformer",
                     * "type": "class",
                     * "object_type": "routine",
                     * "description": "Transforms data with various transformations",
                     * "category": "transformation",
                     * "tags": ["transformer", "processor"],
                     * "example_config": {"name": "Exampledata_transformer"},
                     * "version": "1.0.0"
                     * },
                     * {
                         * "name": "template_flow",
                         * "type": "instance",
                         * "object_type": "flow",
                         * "description": "A template flow for data processing",
                         * "category": "template",
                         * "tags": ["template", "workflow"],
                         * "example_config": {},
                         * "version": "1.0.0"
                         * }
                         * ],
                         * "total": 12
                         * }
                         * ```
                         *
                         * **Object Types**:
                         * - `type`: Prototype type - "class" (class-based) or "instance" (instance-based)
                         * - `object_type`: Object type - "routine" (executable component) or "flow" (workflow template)
                         *
                         * **Filtering**:
                         * - Use `category` to filter by functional category (e.g., "data_generation")
                         * - Use `object_type` to filter by object type (e.g., "routine" or "flow")
                         * - Combine both filters: `?category=data_generation&object_type=routine`
                         *
                         * **Categories**:
                         * Common categories include:
                         * - `data_generation`: Routines that generate data
                         * - `validation`: Routines that validate data
                         * - `transformation`: Routines that transform data
                         * - `monitoring`: Routines for monitoring
                         * - `debugging`: Routines for debugging
                         * - `sink`: Routines that consume data
                         *
                         * **Next Steps**:
                         * 1. Browse objects: GET /api/factory/objects
                         * 2. Get object details: GET /api/factory/objects/{name}
                         * 3. Get interface info: GET /api/factory/objects/{name}/interface (to see slots/events)
                         * 4. Use in flow: POST /api/flows/{flow_id}/routines with object_name
                         *
                         * **Related Endpoints**:
                         * - GET /api/factory/objects/{name} - Get object metadata
                         * - GET /api/factory/objects/{name}/interface - Get routine interface (slots/events)
                         *
                         * Args:
                         * category: Optional category filter (e.g., 'data_generation')
                         * object_type: Optional object type filter ('routine' or 'flow')
                         *
                         * Returns:
                         * ObjectListResponse: List of objects with total count. Each object includes:
                         * - `object_type`: "routine" or "flow" to distinguish object types
                         * - `type`: "class" or "instance" (prototype type)
                         * - `category`: Functional category for filtering
                         *
                         * Raises:
                         * HTTPException: 422 if object_type is invalid (not 'routine' or 'flow')
                         * HTTPException: 500 if factory is not accessible
                         * @param category Optional category filter. Only objects in this category will be returned. Common categories: 'data_generation', 'validation', 'transformation', 'monitoring', 'debugging', etc. Leave empty to get all objects regardless of category.
                         * @param objectType Optional object type filter. Filter by object type: 'routine' or 'flow'. Use 'routine' to get only Routines (executable components that can be added to flows). Use 'flow' to get only Flows (workflow templates that can be cloned). Leave empty to get all objects regardless of type.
                         * @returns ObjectListResponse Successful Response
                         * @throws ApiError
                         */
                        public static listFactoryObjectsApiV1FactoryObjectsGet(
                            category?: (string | null),
                            objectType?: (string | null),
                        ): CancelablePromise<ObjectListResponse> {
                            return __request(OpenAPI, {
                                method: 'GET',
                                url: '/api/v1/factory/objects',
                                query: {
                                    'category': category,
                                    'object_type': objectType,
                                },
                                errors: {
                                    422: `Validation Error`,
                                },
                            });
                        }
                        /**
                         * Get Factory Object Metadata
                         * Get metadata for a specific factory object.
                         *
                         * **Overview**:
                         * Returns detailed metadata about a registered object in the factory, including description,
                         * category, tags, example configuration, and version. Use this to understand what an object
                         * does and how to configure it.
                         *
                         * **Endpoint**: `GET /api/factory/objects/{name}`
                         *
                         * **Request Example**:
                         * ```
                         * GET /api/factory/objects/data_source
                         * ```
                         *
                         * **Response Example**:
                         * ```json
                         * {
                             * "name": "data_source",
                             * "description": "Generates sample data with metadata",
                             * "category": "data_generation",
                             * "tags": ["source", "generator"],
                             * "example_config": {
                                 * "name": "Exampledata_source"
                                 * },
                                 * "version": "1.0.0"
                                 * }
                                 * ```
                                 *
                                 * **Use Cases**:
                                 * - Understand what an object does
                                 * - See example configuration
                                 * - Check object version
                                 * - Build configuration UI
                                 *
                                 * **Note**: This endpoint returns metadata only. To get interface information
                                 * (slots and events), use GET /api/factory/objects/{name}/interface.
                                 *
                                 * **Error Responses**:
                                 * - `404 Not Found`: Object with this name is not registered in factory
                                 *
                                 * **Related Endpoints**:
                                 * - GET /api/factory/objects - List all factory objects
                                 * - GET /api/factory/objects/{name}/interface - Get routine interface (slots/events)
                                 *
                                 * Args:
                                 * name: Object name (factory registration name)
                                 *
                                 * Returns:
                                 * ObjectMetadataResponse: Object metadata
                                 *
                                 * Raises:
                                 * HTTPException: 404 if object not found
                                 * @param name
                                 * @returns ObjectMetadataResponse Successful Response
                                 * @throws ApiError
                                 */
                                public static getFactoryObjectMetadataApiV1FactoryObjectsNameGet(
                                    name: string,
                                ): CancelablePromise<ObjectMetadataResponse> {
                                    return __request(OpenAPI, {
                                        method: 'GET',
                                        url: '/api/v1/factory/objects/{name}',
                                        path: {
                                            'name': name,
                                        },
                                        errors: {
                                            422: `Validation Error`,
                                        },
                                    });
                                }
                                /**
                                 * Get Factory Object Interface
                                 * Get interface information for a routine (slots, events, activation policy).
                                 *
                                 * **Overview**:
                                 * Returns detailed interface information for a routine registered in the factory,
                                 * including all input slots, output events, activation policy, and configuration.
                                 * This is essential for understanding how to connect routines in a flow.
                                 *
                                 * **Endpoint**: `GET /api/factory/objects/{name}/interface`
                                 *
                                 * **Why This Endpoint**:
                                 * - You need to know which slots a routine has (for connections)
                                 * - You need to know which events a routine emits (for connections)
                                 * - You need to understand the activation policy
                                 * - You're building a flow dynamically and need interface details
                                 *
                                 * **Request Example**:
                                 * ```
                                 * GET /api/factory/objects/data_source/interface
                                 * ```
                                 *
                                 * **Response Example**:
                                 * ```json
                                 * {
                                     * "name": "data_source",
                                     * "type": "routine",
                                     * "slots": [
                                         * {
                                             * "name": "trigger",
                                             * "max_queue_length": 100,
                                             * "watermark": 80
                                             * }
                                             * ],
                                             * "events": [
                                                 * {
                                                     * "name": "output",
                                                     * "output_params": ["data", "index", "timestamp", "metadata"]
                                                     * }
                                                     * ],
                                                     * "activation_policy": {
                                                         * "type": "immediate",
                                                         * "config": {},
                                                         * "description": "Activate immediately when any slot receives data"
                                                         * },
                                                         * "config": {
                                                             * "name": "DataSource"
                                                             * }
                                                             * }
                                                             * ```
                                                             *
                                                             * **Slot Information**:
                                                             * - `name`: Slot name (use as target_slot in connections)
                                                             * - `max_queue_length`: Maximum queue capacity
                                                             * - `watermark`: Queue watermark threshold
                                                             *
                                                             * **Event Information**:
                                                             * - `name`: Event name (use as source_event in connections)
                                                             * - `output_params`: List of parameter names this event emits
                                                             *
                                                             * **Activation Policy**:
                                                             * - `type`: Policy type (immediate, batch_size, time_interval, all_slots_ready)
                                                             * - `config`: Policy configuration parameters
                                                             * - `description`: Human-readable description
                                                             *
                                                             * **Use Case: Building a Connection**:
                                                             * 1. Get source routine interface: GET /api/factory/objects/data_source/interface
                                                             * 2. Get target routine interface: GET /api/factory/objects/data_processor/interface
                                                             * 3. Find matching event/slot
                                                             * 4. Create connection: POST /api/flows/{flow_id}/connections
                                                             * ```json
                                                             * {
                                                                 * "source_routine": "data_source",
                                                                 * "source_event": "output",  // from source interface
                                                                 * "target_routine": "data_processor",
                                                                 * "target_slot": "input"  // from target interface
                                                                 * }
                                                                 * ```
                                                                 *
                                                                 * **Error Responses**:
                                                                 * - `404 Not Found`: Object not found in factory
                                                                 * - `400 Bad Request`: Object is not a Routine (e.g., it's a Flow)
                                                                 * - `500 Internal Server Error`: Failed to inspect object interface
                                                                 *
                                                                 * **Performance Note**:
                                                                 * - This endpoint creates a temporary instance to inspect the interface
                                                                 * - The instance is discarded after inspection
                                                                 * - Response is cached-friendly (interface doesn't change)
                                                                 *
                                                                 * **Related Endpoints**:
                                                                 * - GET /api/factory/objects/{name} - Get object metadata
                                                                 * - GET /api/factory/objects - List all factory objects
                                                                 * - POST /api/flows/{flow_id}/routines - Add routine to flow
                                                                 * - POST /api/flows/{flow_id}/connections - Create connection
                                                                 *
                                                                 * Args:
                                                                 * name: Object name (factory registration name)
                                                                 *
                                                                 * Returns:
                                                                 * dict: Interface information including slots, events, and activation policy
                                                                 *
                                                                 * Raises:
                                                                 * HTTPException: 404 if object not found
                                                                 * HTTPException: 400 if object is not a Routine
                                                                 * HTTPException: 500 if interface inspection fails
                                                                 * @param name
                                                                 * @returns any Successful Response
                                                                 * @throws ApiError
                                                                 */
                                                                public static getFactoryObjectInterfaceApiV1FactoryObjectsNameInterfaceGet(
                                                                    name: string,
                                                                ): CancelablePromise<any> {
                                                                    return __request(OpenAPI, {
                                                                        method: 'GET',
                                                                        url: '/api/v1/factory/objects/{name}/interface',
                                                                        path: {
                                                                            'name': name,
                                                                        },
                                                                        errors: {
                                                                            422: `Validation Error`,
                                                                        },
                                                                    });
                                                                }
                                                            }
