/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectInfo } from './ObjectInfo';
/**
 * Response model for object list.
 *
 * Returns a list of all objects registered in the factory, optionally filtered by category.
 *
 * **Example Response**:
 * ```json
 * {
     * "objects": [
         * {
             * "name": "data_source",
             * "type": "class",
             * "description": "Generates sample data",
             * "category": "data_generation",
             * "tags": ["source"],
             * "example_config": {},
             * "version": "1.0.0"
             * }
             * ],
             * "total": 12
             * }
             * ```
             *
             * **Filtering**: Use the `category` query parameter to filter objects by category.
             * Example: GET /api/factory/objects?category=data_generation
             */
            export type ObjectListResponse = {
                /**
                 * List of objects matching the filter criteria (if category filter is applied). Each object contains metadata about a registered factory prototype.
                 */
                objects: Array<ObjectInfo>;
                /**
                 * Total number of objects in the list (after filtering, if applied).
                 */
                total: number;
            };

