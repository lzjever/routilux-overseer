/**
 * Flow component type definitions for ReactFlow
 *
 * This file exports stable references to nodeTypes and edgeTypes
 * to prevent React Flow warnings about recreated objects.
 *
 * These should NEVER be recreated or modified after module initialization.
 */

import { NodeTypes, EdgeTypes, MarkerType } from "reactflow";
import { RoutineNode } from "./RoutineNode";
import { ConnectionEdge } from "./ConnectionEdge";

/**
 * Stable reference to node type definitions
 * Must be defined outside components to prevent React Flow warnings
 */
export const nodeTypes: NodeTypes = {
  routine: RoutineNode,
} as const;

/**
 * Stable reference to edge type definitions
 * Must be defined outside components to prevent React Flow warnings
 */
export const edgeTypes: EdgeTypes = {
  connection: ConnectionEdge,
} as const;

/**
 * Default edge options for all edges
 */
export const defaultEdgeOptions = {
  type: "connection",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
} as const;
