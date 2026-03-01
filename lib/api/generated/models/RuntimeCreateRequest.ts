/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for creating/registering a new runtime.
 *
 * This allows clients to register a new Runtime instance with a custom ID.
 */
export type RuntimeCreateRequest = {
    /**
     * Unique identifier for this runtime. Must be unique across all runtimes.
     */
    runtime_id: string;
    /**
     * Maximum number of worker threads in the thread pool. Set to 0 to use GlobalJobManager's thread pool. Default: 10. Maximum recommended: 100.
     */
    thread_pool_size?: number;
    /**
     * Whether to set this runtime as the default. If True, this runtime will be used when runtime_id is not specified.
     */
    is_default?: boolean;
};

