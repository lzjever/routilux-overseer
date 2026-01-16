/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for expression evaluation.
 */
export type ExpressionEvalRequest = {
    /**
     * Expression to evaluate
     */
    expression: string;
    /**
     * Routine ID for context
     */
    routine_id?: (string | null);
    /**
     * Stack frame index (default 0 = current frame)
     */
    frame_index?: number;
};

