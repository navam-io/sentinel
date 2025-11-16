import { useCanvasStore } from '../stores/canvasStore';

/**
 * Hook to determine if a handle is connected
 * @param nodeId - The ID of the node
 * @param handleType - 'source' or 'target'
 * @returns true if the handle has at least one connection
 */
export function useHandleConnection(nodeId: string, handleType: 'source' | 'target'): boolean {
	const edges = useCanvasStore((state) => state.edges);

	return edges.some((edge) => {
		if (handleType === 'source') {
			return edge.source === nodeId;
		} else {
			return edge.target === nodeId;
		}
	});
}
