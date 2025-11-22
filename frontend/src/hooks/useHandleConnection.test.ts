import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHandleConnection } from './useHandleConnection';
import { useCanvasStore } from '../stores/canvasStore';
import type { Edge } from '@xyflow/react';

describe('useHandleConnection', () => {
  beforeEach(() => {
    // Reset canvas store before each test
    useCanvasStore.setState({ edges: [] });
  });

  describe('source handle connections', () => {
    it('should return false when no edges exist', () => {
      const { result } = renderHook(() => useHandleConnection('node-1', 'source'));
      expect(result.current).toBe(false);
    });

    it('should return true when node is connected as source', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'source'));
      expect(result.current).toBe(true);
    });

    it('should return false when node is only connected as target', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-2',
          target: 'node-1',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'source'));
      expect(result.current).toBe(false);
    });

    it('should return true when node has multiple source connections', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
        {
          id: 'edge-2',
          source: 'node-1',
          target: 'node-3',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'source'));
      expect(result.current).toBe(true);
    });

    it('should return false when node ID does not match', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-2',
          target: 'node-3',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'source'));
      expect(result.current).toBe(false);
    });
  });

  describe('target handle connections', () => {
    it('should return false when no edges exist', () => {
      const { result } = renderHook(() => useHandleConnection('node-1', 'target'));
      expect(result.current).toBe(false);
    });

    it('should return true when node is connected as target', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-2',
          target: 'node-1',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'target'));
      expect(result.current).toBe(true);
    });

    it('should return false when node is only connected as source', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'target'));
      expect(result.current).toBe(false);
    });

    it('should return true when node has multiple target connections', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-2',
          target: 'node-1',
        },
        {
          id: 'edge-2',
          source: 'node-3',
          target: 'node-1',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'target'));
      expect(result.current).toBe(true);
    });

    it('should return false when node ID does not match', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-2',
          target: 'node-3',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-1', 'target'));
      expect(result.current).toBe(false);
    });
  });

  describe('mixed connections', () => {
    it('should correctly identify source connection when node has both', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
        {
          id: 'edge-2',
          source: 'node-3',
          target: 'node-1',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result: sourceResult } = renderHook(() =>
        useHandleConnection('node-1', 'source')
      );
      expect(sourceResult.current).toBe(true);
    });

    it('should correctly identify target connection when node has both', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
        {
          id: 'edge-2',
          source: 'node-3',
          target: 'node-1',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result: targetResult } = renderHook(() =>
        useHandleConnection('node-1', 'target')
      );
      expect(targetResult.current).toBe(true);
    });
  });

  describe('reactivity to edge changes', () => {
    it('should update when edges are added', () => {
      const { result, rerender } = renderHook(() => useHandleConnection('node-1', 'source'));

      // Initially no connections
      expect(result.current).toBe(false);

      // Add edge
      useCanvasStore.setState({
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
          },
        ],
      });

      // Rerender to get updated value
      rerender();

      // Now should have connection
      expect(result.current).toBe(true);
    });

    it('should update when edges are removed', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result, rerender } = renderHook(() => useHandleConnection('node-1', 'source'));

      // Initially has connection
      expect(result.current).toBe(true);

      // Remove edge
      useCanvasStore.setState({ edges: [] });

      // Rerender to get updated value
      rerender();

      // Now should have no connection
      expect(result.current).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string node IDs', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: '',
          target: 'node-2',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('', 'source'));
      expect(result.current).toBe(true);
    });

    it('should handle special characters in node IDs', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-!@#$%',
          target: 'node-2',
        },
      ];
      useCanvasStore.setState({ edges });

      const { result } = renderHook(() => useHandleConnection('node-!@#$%', 'source'));
      expect(result.current).toBe(true);
    });
  });
});
