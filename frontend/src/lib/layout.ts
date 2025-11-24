import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

/**
 * Auto-layout nodes using dagre algorithm
 *
 * This utility provides automatic graph layout for the canvas,
 * organizing nodes in a hierarchical structure with proper spacing.
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 280;
  const nodeHeight = 180;

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 100,  // Vertical spacing between ranks
    nodesep: 80,   // Horizontal spacing between nodes
    edgesep: 50,   // Edge spacing
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
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
