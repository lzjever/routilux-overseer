import * as dagre from "dagre";
import type { Edge, Node } from "reactflow";

export function layoutNodes(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph({ directed: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph options with compact spacing (more commonly used defaults)
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100, // Horizontal spacing between nodes at the same rank (compact)
    ranksep: 80, // Vertical spacing between ranks (compact)
    edgesep: 10, // Spacing between edges
    ranker: "tight-tree", // Use tight-tree ranker for more compact layout
  });

  // Fixed node dimensions (should match actual rendered size)
  const nodeWidth = 300; // Increased to match actual node width
  const nodeHeight = 150; // Increased to match actual node height

  // Add nodes with dimensions
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges
  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
