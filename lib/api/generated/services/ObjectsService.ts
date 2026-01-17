/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectListResponse } from '../models/ObjectListResponse';
import type { ObjectMetadataResponse } from '../models/ObjectMetadataResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ObjectsService {
    /**
     * List Objects
     * List all available objects in the factory.
     *
     * Args:
     * category: Optional category filter.
     *
     * Returns:
     * List of available objects.
     * @param category Filter by category
     * @returns ObjectListResponse Successful Response
     * @throws ApiError
     */
    public static listObjectsApiObjectsGet(
        category?: (string | null),
    ): CancelablePromise<ObjectListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/objects',
            query: {
                'category': category,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Object Metadata
     * Get metadata for a specific object.
     *
     * Args:
     * name: Object name.
     *
     * Returns:
     * Object metadata.
     *
     * Raises:
     * HTTPException: If object not found.
     * @param name
     * @returns ObjectMetadataResponse Successful Response
     * @throws ApiError
     */
    public static getObjectMetadataApiObjectsNameGet(
        name: string,
    ): CancelablePromise<ObjectMetadataResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/objects/{name}',
            path: {
                'name': name,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
