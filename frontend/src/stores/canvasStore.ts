import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Node, Edge, Connection } from '@xyflow/react';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { NodeChange, EdgeChange } from '@xyflow/react';
import { getLayoutedElements } from '../lib/layout';
import { useTestStore } from './testStore';

/**
 * Canvas Store
 *
 * Manages the visual canvas state (nodes, edges, positions).
 * Test identity and metadata are managed by testStore.
 *
 * Key changes in v0.29.0:
 * - Removed savedTestInfo (moved to testStore)
 * - Added markDirty() calls on node/edge changes
 * - Kept activeTestId/activeTemplateId for Library integration
 */

interface CanvasStore {
	nodes: Node[];
	edges: Edge[];
	lastCanvasClickPosition: { x: number; y: number };
	activeTestId: string | null;
	activeTemplateId: string | null;

	// Actions
	setNodes: (nodes: Node[]) => void;
	setEdges: (edges: Edge[]) => void;
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	onConnect: (connection: Connection) => void;
	addNode: (node: Node) => void;
	removeNode: (nodeId: string) => void;
	updateNode: (nodeId: string, data: Partial<Node['data']>) => void;
	setLastClickPosition: (position: { x: number; y: number }) => void;
	organizeNodes: () => void;
	setActiveTestId: (id: string | null) => void;
	setActiveTemplateId: (id: string | null) => void;
	clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
	persist(
		(set, get) => ({
			// Initial state with sample nodes
			nodes: [
				{
					id: '1',
					type: 'input',
					data: { label: 'Input Node', query: 'What is the capital of France?' },
					position: { x: 100, y: 100 }
				},
				{
					id: '2',
					type: 'model',
					data: { label: 'Model: GPT-5.1', model: 'gpt-5.1', temperature: 0.7 },
					position: { x: 100, y: 300 }
				},
				{
					id: '3',
					type: 'assertion',
					data: { label: 'Assertion', assertionType: 'must_contain', assertionValue: 'Paris' },
					position: { x: 100, y: 500 }
				}
			],
			edges: [
				{
					id: 'e1-2',
					source: '1',
					target: '2',
					animated: true
				},
				{
					id: 'e2-3',
					source: '2',
					target: '3',
					animated: true
				}
			],
			lastCanvasClickPosition: { x: 250, y: 150 },
			activeTestId: null,
			activeTemplateId: null,

			// Actions
			setNodes: (nodes) => set({ nodes }),
			setEdges: (edges) => set({ edges }),

			onNodesChange: (changes) => {
				// Filter out position changes (from dragging) to avoid marking dirty on every drag
				const significantChanges = changes.filter(
					(change) => change.type !== 'position' && change.type !== 'select'
				);

				set({
					nodes: applyNodeChanges(changes, get().nodes)
				});

				// Mark dirty only for significant changes (add, remove, reset)
				if (significantChanges.length > 0) {
					useTestStore.getState().markDirty();
				}
			},

			onEdgesChange: (changes) => {
				// Filter out select changes
				const significantChanges = changes.filter((change) => change.type !== 'select');

				set({
					edges: applyEdgeChanges(changes, get().edges)
				});

				// Mark dirty for edge changes
				if (significantChanges.length > 0) {
					useTestStore.getState().markDirty();
				}
			},

			onConnect: (connection) => {
				set({
					edges: addEdge({ ...connection, animated: true }, get().edges)
				});
				// Mark dirty when new connection is made
				useTestStore.getState().markDirty();
			},

			addNode: (node) => {
				set((state) => ({
					nodes: [...state.nodes, node]
				}));
				// Mark dirty when node is added
				useTestStore.getState().markDirty();
			},

			removeNode: (nodeId) => {
				set((state) => ({
					nodes: state.nodes.filter(n => n.id !== nodeId),
					edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
				}));
				// Mark dirty when node is removed
				useTestStore.getState().markDirty();
			},

			updateNode: (nodeId, data) => {
				set((state) => ({
					nodes: state.nodes.map(n =>
						n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
					)
				}));
				// Mark dirty when node data is updated
				useTestStore.getState().markDirty();
			},

			setLastClickPosition: (position) => {
				set({ lastCanvasClickPosition: position });
			},

			organizeNodes: () => {
				const { nodes, edges } = get();
				const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
				set({ nodes: layoutedNodes, edges: layoutedEdges });
			},

			setActiveTestId: (id) => {
				set({ activeTestId: id, activeTemplateId: null });
			},

			setActiveTemplateId: (id) => {
				set({ activeTemplateId: id, activeTestId: null });
			},

			clearCanvas: () => {
				set({
					nodes: [],
					edges: [],
					activeTestId: null,
					activeTemplateId: null
				});
				useTestStore.getState().clearCurrentTest();
			}
		}),
		{
			name: 'sentinel-canvas-storage',
			partialize: (state) => ({
				nodes: state.nodes,
				edges: state.edges,
				lastCanvasClickPosition: state.lastCanvasClickPosition,
				activeTestId: state.activeTestId,
				activeTemplateId: state.activeTemplateId
			})
		}
	)
);
