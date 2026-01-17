/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConnectionInfo } from '../models/ConnectionInfo';
import type { FlowCreateRequest } from '../models/FlowCreateRequest';
import type { FlowListResponse } from '../models/FlowListResponse';
import type { FlowResponse } from '../models/FlowResponse';
import type { routilux__api__models__flow__RoutineInfo } from '../models/routilux__api__models__flow__RoutineInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FlowsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * List Flows
     * List all flows.
     * @returns FlowListResponse Successful Response
     * @throws ApiError
     */
    public listFlowsApiFlowsGet(): CancelablePromise<FlowListResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/flows',
        });
    }
    /**
     * Create Flow
     * Create a new flow.
     * @param requestBody
     * @returns FlowResponse Successful Response
     * @throws ApiError
     */
    public createFlowApiFlowsPost(
        requestBody: FlowCreateRequest,
    ): CancelablePromise<FlowResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/flows',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Flow
     * Get flow details.
     * @param flowId
     * @returns FlowResponse Successful Response
     * @throws ApiError
     */
    public getFlowApiFlowsFlowIdGet(
        flowId: string,
    ): CancelablePromise<FlowResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/flows/{flow_id}',
            path: {
                'flow_id': flowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Flow
     * Delete a flow.
     * @param flowId
     * @returns void
     * @throws ApiError
     */
    public deleteFlowApiFlowsFlowIdDelete(
        flowId: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/flows/{flow_id}',
            path: {
                'flow_id': flowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export Flow Dsl
     * Export flow as DSL.
     * @param flowId
     * @param format
     * @returns any Successful Response
     * @throws ApiError
     */
    public exportFlowDslApiFlowsFlowIdDslGet(
        flowId: string,
        format: string = 'yaml',
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/flows/{flow_id}/dsl',
            path: {
                'flow_id': flowId,
            },
            query: {
                'format': format,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Validate Flow
     * Validate flow structure.
     * @param flowId
     * @returns any Successful Response
     * @throws ApiError
     */
    public validateFlowApiFlowsFlowIdValidatePost(
        flowId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/flows/{flow_id}/validate',
            path: {
                'flow_id': flowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Flow Routines
     * List all routines in a flow.
     * @param flowId
     * @returns routilux__api__models__flow__RoutineInfo Successful Response
     * @throws ApiError
     */
    public listFlowRoutinesApiFlowsFlowIdRoutinesGet(
        flowId: string,
    ): CancelablePromise<Record<string, routilux__api__models__flow__RoutineInfo>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/flows/{flow_id}/routines',
            path: {
                'flow_id': flowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Routine To Flow
     * Add a routine to an existing flow.
     * @param flowId
     * @param routineId
     * @param classPath
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public addRoutineToFlowApiFlowsFlowIdRoutinesPost(
        flowId: string,
        routineId: string,
        classPath: string,
        requestBody?: (Record<string, any> | null),
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/flows/{flow_id}/routines',
            path: {
                'flow_id': flowId,
            },
            query: {
                'routine_id': routineId,
                'class_path': classPath,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Flow Connections
     * List all connections in a flow.
     * @param flowId
     * @returns ConnectionInfo Successful Response
     * @throws ApiError
     */
    public listFlowConnectionsApiFlowsFlowIdConnectionsGet(
        flowId: string,
    ): CancelablePromise<Array<ConnectionInfo>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/flows/{flow_id}/connections',
            path: {
                'flow_id': flowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Connection To Flow
     * Add a connection to an existing flow.
     * @param flowId
     * @param sourceRoutine
     * @param sourceEvent
     * @param targetRoutine
     * @param targetSlot
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public addConnectionToFlowApiFlowsFlowIdConnectionsPost(
        flowId: string,
        sourceRoutine: string,
        sourceEvent: string,
        targetRoutine: string,
        targetSlot: string,
        requestBody?: (Record<string, string> | null),
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/flows/{flow_id}/connections',
            path: {
                'flow_id': flowId,
            },
            query: {
                'source_routine': sourceRoutine,
                'source_event': sourceEvent,
                'target_routine': targetRoutine,
                'target_slot': targetSlot,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Routine From Flow
     * Remove a routine from a flow.
     * @param flowId
     * @param routineId
     * @returns void
     * @throws ApiError
     */
    public removeRoutineFromFlowApiFlowsFlowIdRoutinesRoutineIdDelete(
        flowId: string,
        routineId: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/flows/{flow_id}/routines/{routine_id}',
            path: {
                'flow_id': flowId,
                'routine_id': routineId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Connection From Flow
     * Remove a connection from a flow.
     * @param flowId
     * @param connectionIndex
     * @returns void
     * @throws ApiError
     */
    public removeConnectionFromFlowApiFlowsFlowIdConnectionsConnectionIndexDelete(
        flowId: string,
        connectionIndex: number,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/flows/{flow_id}/connections/{connection_index}',
            path: {
                'flow_id': flowId,
                'connection_index': connectionIndex,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
