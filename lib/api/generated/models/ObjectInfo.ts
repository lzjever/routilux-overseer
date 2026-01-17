/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Information about an available object in the factory.
 *
 * This is a summary view used in the object list endpoint.
 * For detailed metadata, use GET /api/factory/objects/{name}.
 * For interface information (slots/events), use GET /api/factory/objects/{name}/interface.
 *
 * **Example Response**:
 * ```json
 * {
     * "name": "data_source",
     * "type": "class",
     * "description": "Generates sample data with metadata",
     * "category": "data_generation",
     * "tags": ["source", "generator"],
     * "example_config": {"name": "Exampledata_source"},
     * "version": "1.0.0"
     * }
     * ```
     */
    export type ObjectInfo = {
        /**
         * Unique name of the object in the factory.
         */
        name: string;
        /**
         * Type of prototype: 'class' (class-based prototype) or 'instance' (instance-based prototype). Class prototypes create new instances each time. Instance prototypes clone a configured instance. This describes HOW the object is stored, not WHAT it is.
         */
        type: string;
        /**
         * Type of object: 'routine' or 'flow'. This distinguishes between Routines (executable components) and Flows (workflow definitions). Use this field to filter objects by type. Routines can be added to flows. Flows can be used as templates to create new flows.
         */
        object_type: string;
        /**
         * Human-readable description of what this object does.
         */
        description: string;
        /**
         * Category grouping for this object.
         */
        category: string;
        /**
         * List of tags for searching and filtering.
         */
        tags: Array<string>;
        /**
         * Example configuration dictionary.
         */
        example_config: Record<string, any>;
        /**
         * Version string for this object.
         */
        version: string;
    };

