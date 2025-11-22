import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from './canvasStore';
import type { Node, Edge } from '@xyflow/react';

describe('canvasStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCanvasStore.setState({
      nodes: [],
      edges: [],
      lastCanvasClickPosition: { x: 0, y: 0 },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state structure', () => {
      const state = useCanvasStore.getState();

      expect(state).toHaveProperty('nodes');
      expect(state).toHaveProperty('edges');
      expect(state).toHaveProperty('lastCanvasClickPosition');
      expect(state).toHaveProperty('setNodes');
      expect(state).toHaveProperty('setEdges');
      expect(state).toHaveProperty('onNodesChange');
      expect(state).toHaveProperty('onEdgesChange');
      expect(state).toHaveProperty('onConnect');
      expect(state).toHaveProperty('addNode');
      expect(state).toHaveProperty('removeNode');
      expect(state).toHaveProperty('updateNode');
      expect(state).toHaveProperty('setLastClickPosition');
    });
  });

  describe('setNodes', () => {
    it('should set nodes correctly', () => {
      const testNodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Test Input' },
          position: { x: 100, y: 100 },
        },
        {
          id: 'node-2',
          type: 'model',
          data: { label: 'Test Model' },
          position: { x: 200, y: 200 },
        },
      ];

      useCanvasStore.getState().setNodes(testNodes);

      const { nodes } = useCanvasStore.getState();
      expect(nodes).toEqual(testNodes);
      expect(nodes).toHaveLength(2);
    });

    it('should replace existing nodes', () => {
      const initialNodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Initial' },
          position: { x: 0, y: 0 },
        },
      ];

      const newNodes: Node[] = [
        {
          id: 'node-2',
          type: 'model',
          data: { label: 'New' },
          position: { x: 100, y: 100 },
        },
      ];

      useCanvasStore.getState().setNodes(initialNodes);
      useCanvasStore.getState().setNodes(newNodes);

      const { nodes } = useCanvasStore.getState();
      expect(nodes).toEqual(newNodes);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('node-2');
    });

    it('should handle empty array', () => {
      useCanvasStore.getState().setNodes([]);

      const { nodes } = useCanvasStore.getState();
      expect(nodes).toEqual([]);
      expect(nodes).toHaveLength(0);
    });
  });

  describe('setEdges', () => {
    it('should set edges correctly', () => {
      const testEdges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ];

      useCanvasStore.getState().setEdges(testEdges);

      const { edges } = useCanvasStore.getState();
      expect(edges).toEqual(testEdges);
      expect(edges).toHaveLength(1);
    });

    it('should replace existing edges', () => {
      const initialEdges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ];

      const newEdges: Edge[] = [
        {
          id: 'edge-2',
          source: 'node-2',
          target: 'node-3',
        },
      ];

      useCanvasStore.getState().setEdges(initialEdges);
      useCanvasStore.getState().setEdges(newEdges);

      const { edges } = useCanvasStore.getState();
      expect(edges).toEqual(newEdges);
      expect(edges).toHaveLength(1);
      expect(edges[0].id).toBe('edge-2');
    });

    it('should handle empty array', () => {
      useCanvasStore.getState().setEdges([]);

      const { edges } = useCanvasStore.getState();
      expect(edges).toEqual([]);
      expect(edges).toHaveLength(0);
    });
  });

  describe('addNode', () => {
    it('should add a node to empty nodes array', () => {
      const newNode: Node = {
        id: 'node-1',
        type: 'input',
        data: { label: 'New Node' },
        position: { x: 100, y: 100 },
      };

      useCanvasStore.getState().addNode(newNode);

      const { nodes } = useCanvasStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toEqual(newNode);
    });

    it('should add a node to existing nodes', () => {
      const existingNode: Node = {
        id: 'node-1',
        type: 'input',
        data: { label: 'Existing' },
        position: { x: 0, y: 0 },
      };

      const newNode: Node = {
        id: 'node-2',
        type: 'model',
        data: { label: 'New' },
        position: { x: 100, y: 100 },
      };

      useCanvasStore.getState().setNodes([existingNode]);
      useCanvasStore.getState().addNode(newNode);

      const { nodes } = useCanvasStore.getState();
      expect(nodes).toHaveLength(2);
      expect(nodes[0]).toEqual(existingNode);
      expect(nodes[1]).toEqual(newNode);
    });

    it('should preserve existing nodes when adding new one', () => {
      const node1: Node = {
        id: 'node-1',
        type: 'input',
        data: { label: 'Node 1' },
        position: { x: 0, y: 0 },
      };

      const node2: Node = {
        id: 'node-2',
        type: 'model',
        data: { label: 'Node 2' },
        position: { x: 100, y: 100 },
      };

      const node3: Node = {
        id: 'node-3',
        type: 'assertion',
        data: { label: 'Node 3' },
        position: { x: 200, y: 200 },
      };

      useCanvasStore.getState().setNodes([node1, node2]);
      useCanvasStore.getState().addNode(node3);

      const { nodes } = useCanvasStore.getState();
      expect(nodes).toHaveLength(3);
      expect(nodes[0]).toEqual(node1);
      expect(nodes[1]).toEqual(node2);
      expect(nodes[2]).toEqual(node3);
    });
  });

  describe('removeNode', () => {
    it('should remove node by ID', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Node 1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node-2',
          type: 'model',
          data: { label: 'Node 2' },
          position: { x: 100, y: 100 },
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().removeNode('node-1');

      const { nodes: remainingNodes } = useCanvasStore.getState();
      expect(remainingNodes).toHaveLength(1);
      expect(remainingNodes[0].id).toBe('node-2');
    });

    it('should remove associated edges when removing node', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Node 1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node-2',
          type: 'model',
          data: { label: 'Node 2' },
          position: { x: 100, y: 100 },
        },
        {
          id: 'node-3',
          type: 'assertion',
          data: { label: 'Node 3' },
          position: { x: 200, y: 200 },
        },
      ];

      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
        {
          id: 'edge-2',
          source: 'node-2',
          target: 'node-3',
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().setEdges(edges);
      useCanvasStore.getState().removeNode('node-2');

      const { nodes: remainingNodes, edges: remainingEdges } = useCanvasStore.getState();
      expect(remainingNodes).toHaveLength(2);
      expect(remainingEdges).toHaveLength(0);
    });

    it('should handle removing non-existent node', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Node 1' },
          position: { x: 0, y: 0 },
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().removeNode('non-existent');

      const { nodes: remainingNodes } = useCanvasStore.getState();
      expect(remainingNodes).toHaveLength(1);
      expect(remainingNodes[0].id).toBe('node-1');
    });

    it('should only remove edges connected to removed node', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Node 1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node-2',
          type: 'model',
          data: { label: 'Node 2' },
          position: { x: 100, y: 100 },
        },
        {
          id: 'node-3',
          type: 'assertion',
          data: { label: 'Node 3' },
          position: { x: 200, y: 200 },
        },
      ];

      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
        {
          id: 'edge-2',
          source: 'node-2',
          target: 'node-3',
        },
        {
          id: 'edge-3',
          source: 'node-1',
          target: 'node-3',
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().setEdges(edges);
      useCanvasStore.getState().removeNode('node-2');

      const { edges: remainingEdges } = useCanvasStore.getState();
      expect(remainingEdges).toHaveLength(1);
      expect(remainingEdges[0].id).toBe('edge-3');
    });
  });

  describe('updateNode', () => {
    it('should update node data', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Original Label', query: 'Original Query' },
          position: { x: 0, y: 0 },
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().updateNode('node-1', { label: 'Updated Label' });

      const { nodes: updatedNodes } = useCanvasStore.getState();
      expect(updatedNodes[0].data.label).toBe('Updated Label');
      expect(updatedNodes[0].data.query).toBe('Original Query');
    });

    it('should preserve other node properties when updating', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Test', query: 'Test Query' },
          position: { x: 100, y: 100 },
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().updateNode('node-1', { label: 'New Label' });

      const { nodes: updatedNodes } = useCanvasStore.getState();
      expect(updatedNodes[0].id).toBe('node-1');
      expect(updatedNodes[0].type).toBe('input');
      expect(updatedNodes[0].position).toEqual({ x: 100, y: 100 });
    });

    it('should not affect other nodes when updating one', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Node 1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'node-2',
          type: 'model',
          data: { label: 'Node 2' },
          position: { x: 100, y: 100 },
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().updateNode('node-1', { label: 'Updated Node 1' });

      const { nodes: updatedNodes } = useCanvasStore.getState();
      expect(updatedNodes[0].data.label).toBe('Updated Node 1');
      expect(updatedNodes[1].data.label).toBe('Node 2');
    });

    it('should handle updating non-existent node', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'input',
          data: { label: 'Test' },
          position: { x: 0, y: 0 },
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().updateNode('non-existent', { label: 'New Label' });

      const { nodes: unchangedNodes } = useCanvasStore.getState();
      expect(unchangedNodes).toHaveLength(1);
      expect(unchangedNodes[0].data.label).toBe('Test');
    });

    it('should merge multiple data updates', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          type: 'model',
          data: { label: 'Model', model: 'gpt-5.1', temperature: 0.7 },
          position: { x: 0, y: 0 },
        },
      ];

      useCanvasStore.getState().setNodes(nodes);
      useCanvasStore.getState().updateNode('node-1', {
        temperature: 0.9,
        maxTokens: 1000,
      });

      const { nodes: updatedNodes } = useCanvasStore.getState();
      expect(updatedNodes[0].data.label).toBe('Model');
      expect(updatedNodes[0].data.model).toBe('gpt-5.1');
      expect(updatedNodes[0].data.temperature).toBe(0.9);
      expect(updatedNodes[0].data.maxTokens).toBe(1000);
    });
  });

  describe('setLastClickPosition', () => {
    it('should update last click position', () => {
      const position = { x: 100, y: 200 };

      useCanvasStore.getState().setLastClickPosition(position);

      const { lastCanvasClickPosition } = useCanvasStore.getState();
      expect(lastCanvasClickPosition).toEqual(position);
    });

    it('should replace previous click position', () => {
      const position1 = { x: 100, y: 100 };
      const position2 = { x: 200, y: 200 };

      useCanvasStore.getState().setLastClickPosition(position1);
      useCanvasStore.getState().setLastClickPosition(position2);

      const { lastCanvasClickPosition } = useCanvasStore.getState();
      expect(lastCanvasClickPosition).toEqual(position2);
    });

    it('should handle negative coordinates', () => {
      const position = { x: -50, y: -100 };

      useCanvasStore.getState().setLastClickPosition(position);

      const { lastCanvasClickPosition } = useCanvasStore.getState();
      expect(lastCanvasClickPosition).toEqual(position);
    });
  });

  describe('onConnect', () => {
    it('should add animated edge on connection', () => {
      const connection = {
        source: 'node-1',
        target: 'node-2',
      };

      useCanvasStore.getState().onConnect(connection);

      const { edges } = useCanvasStore.getState();
      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe('node-1');
      expect(edges[0].target).toBe('node-2');
      expect(edges[0].animated).toBe(true);
    });

    it('should preserve existing edges when adding connection', () => {
      const existingEdges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ];

      useCanvasStore.getState().setEdges(existingEdges);
      useCanvasStore.getState().onConnect({
        source: 'node-2',
        target: 'node-3',
      });

      const { edges } = useCanvasStore.getState();
      expect(edges).toHaveLength(2);
    });
  });
});
