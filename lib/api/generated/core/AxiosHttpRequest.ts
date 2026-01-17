/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import type { CancelablePromise } from './CancelablePromise';
import { BaseHttpRequest } from './BaseHttpRequest';
import type { OpenAPIConfig } from './OpenAPI';
import { request } from './request';

export class AxiosHttpRequest extends BaseHttpRequest {
    constructor(config: OpenAPIConfig) {
        super(config);
    }

    public request<T>(options: ApiRequestOptions): CancelablePromise<T> {
        return request<T>(this.config, options);
    }
}
