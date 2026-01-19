/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExecuteRequest } from '../models/ExecuteRequest';
import type { ExecuteResponse } from '../models/ExecuteResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExecuteService {
    /**
     * Execute Flow
     * One-shot flow execution.
     *
     * This is a convenience endpoint that:
     * 1. Creates a new Worker
     * 2. Submits a Job with the provided data
     * 3. Optionally waits for completion
     *
     * Use this for simple "submit and get result" workflows.
     * For complex interactive workflows, use the Worker and Job endpoints directly.
     *
     * **Example Request (async)**:
     * ```json
     * {
         * "flow_id": "data_processing_flow",
         * "routine_id": "data_source",
         * "slot_name": "input",
         * "data": {"value": 42},
         * "wait": false
         * }
         * ```
         *
         * **Example Request (sync)**:
         * ```json
         * {
             * "flow_id": "data_processing_flow",
             * "routine_id": "data_source",
             * "slot_name": "input",
             * "data": {"value": 42},
             * "wait": true,
             * "timeout": 30.0
             * }
             * ```
             * @param requestBody
             * @returns ExecuteResponse Successful Response
             * @throws ApiError
             */
            public static executeFlowApiV1ExecutePost(
                requestBody: ExecuteRequest,
            ): CancelablePromise<ExecuteResponse> {
                return __request(OpenAPI, {
                    method: 'POST',
                    url: '/api/v1/execute',
                    body: requestBody,
                    mediaType: 'application/json',
                    errors: {
                        422: `Validation Error`,
                    },
                });
            }
        }
