/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JobResponse } from './JobResponse';
/**
 * Response model for job list with pagination support.
 *
 * Returns a paginated list of jobs with total count for building pagination UI.
 *
 * **Example Response**:
 * ```json
 * {
     * "jobs": [
         * {
             * "job_id": "job-1",
             * "flow_id": "flow-1",
             * "status": "running",
             * "created_at": 1705312800,
             * "started_at": 1705312801,
             * "completed_at": null,
             * "error": null
             * }
             * ],
             * "total": 150,
             * "limit": 100,
             * "offset": 0
             * }
             * ```
             *
             * **Pagination**: Use `limit` and `offset` to implement pagination:
             * - Page 1: `limit=100, offset=0`
             * - Page 2: `limit=100, offset=100`
             * - Page 3: `limit=100, offset=200`
             */
            export type JobListResponse = {
                /**
                 * List of job objects matching the query criteria. Limited by the `limit` parameter and offset by the `offset` parameter.
                 */
                jobs: Array<JobResponse>;
                /**
                 * Total number of jobs matching the filter criteria (before pagination). Use this to calculate total pages: `Math.ceil(total / limit)`.
                 */
                total: number;
                /**
                 * Maximum number of jobs returned in this response. Range: 1-1000. Default: 100.
                 */
                limit?: number;
                /**
                 * Number of jobs skipped before returning results. Use this for pagination: `offset = (page - 1) * limit`.
                 */
                offset?: number;
            };

