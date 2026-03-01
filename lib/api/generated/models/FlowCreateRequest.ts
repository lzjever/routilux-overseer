/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating a new flow.
 *
 * You can create a flow in three ways:
 * 1. **Empty flow**: Provide only `flow_id` (or let system generate one)
 * 2. **From YAML DSL**: Provide `dsl` as a YAML string
 * 3. **From JSON DSL**: Provide `dsl_dict` as a JSON object
 *
 * **Example 1: Create Empty Flow**:
 * ```json
 * {
 * "flow_id": "my_new_flow"
 * }
 * ```
 *
 * **Example 2: Create from YAML DSL**:
 * ```json
 * {
 * "flow_id": "my_flow",
 * "dsl": "flow_id: my_flow
 * routines:
 * source:
 * class: DataSource
 * config:
 * name: Source"
 * }
 * ```
 *
 * **Example 3: Create from JSON DSL**:
 * ```json
 * {
 * "flow_id": "my_flow",
 * "dsl_dict": {
 * "flow_id": "my_flow",
 * "routines": {
 * "source": {
 * "class": "DataSource",
 * "config": {"name": "Source"}
 * }
 * },
 * "connections": []
 * }
 * }
 * ```
 *
 * **Note**: Only one of `dsl` or `dsl_dict` should be provided. If both are provided, `dsl` takes precedence.
 *
 */
export type FlowCreateRequest = {
  /**
   * Optional flow identifier. If not provided, a UUID will be automatically generated. Must be unique across all flows. Use this ID to reference the flow in subsequent API calls.
   */
  flow_id?: string | null;
  /**
   * YAML DSL string defining the flow structure. If provided, the flow will be created from this YAML definition. See DSL documentation for format details. Mutually exclusive with `dsl_dict` - if both are provided, `dsl` takes precedence.
   */
  dsl?: string | null;
  /**
   * JSON dictionary defining the flow structure. If provided, the flow will be created from this JSON definition. Mutually exclusive with `dsl` - if both are provided, `dsl` takes precedence. This is useful when building flows programmatically.
   */
  dsl_dict?: Record<string, any> | null;
};
