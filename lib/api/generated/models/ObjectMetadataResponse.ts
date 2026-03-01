/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for object metadata.
 *
 * Contains metadata about a registered object in the factory.
 * Use this to understand what an object does and how to configure it.
 *
 * **Example Response**:
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
 * **Note**: This endpoint returns metadata only. To get interface information (slots, events),
 * use GET /api/factory/objects/{name}/interface. To get object_type (routine/flow), use GET /api/factory/objects.
 */
export type ObjectMetadataResponse = {
  /**
   * Unique name of the object in the factory. Use this name when creating routines from factory.
   */
  name: string;
  /**
   * Human-readable description of what this object does.
   */
  description: string;
  /**
   * Category grouping for this object. Useful for filtering and organization. Common categories: 'data_generation', 'validation', 'transformation', 'monitoring', etc.
   */
  category: string;
  /**
   * List of tags associated with this object. Useful for searching and filtering. Tags are lowercase and typically describe the object's purpose or features.
   */
  tags: Array<string>;
  /**
   * Example configuration dictionary showing how to configure this object. Use this as a reference when creating routines. The actual config you provide will be merged with defaults.
   */
  example_config: Record<string, any>;
  /**
   * Version string for this object. Useful for tracking object versions.
   */
  version: string;
  /**
   * Full docstring from the class/object. Returned as-is for client parsing and display. Contains detailed documentation including purpose, configuration, input/output formats, etc.
   */
  docstring?: string | null;
};
