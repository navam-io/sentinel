import { create } from 'zustand';
import type { Node, Edge, Connection } from '@xyflow/react';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { NodeChange, EdgeChange } from '@xyflow/react';

interface SavedTestInfo {
	name: string;
	description: string;
}

interface CanvasStore {
	nodes: Node[];
	edges: Edge[];
	lastCanvasClickPosition: { x: number; y: number };
	savedTestInfo: SavedTestInfo | null;

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
	setSavedTestInfo: (info: SavedTestInfo | null) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
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
	savedTestInfo: null,

	// Actions
	setNodes: (nodes) => set({ nodes }),
	setEdges: (edges) => set({ edges }),

	onNodesChange: (changes) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes)
		});
	},

	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges)
		});
	},

	onConnect: (connection) => {
		set({
			edges: addEdge({ ...connection, animated: true }, get().edges)
		});
	},

	addNode: (node) => {
		set((state) => ({
			nodes: [...state.nodes, node]
		}));
	},

	removeNode: (nodeId) => {
		set((state) => ({
			nodes: state.nodes.filter(n => n.id !== nodeId),
			edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
		}));
	},

	updateNode: (nodeId, data) => {
		set((state) => ({
			nodes: state.nodes.map(n =>
				n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
			)
		}));
	},

	setLastClickPosition: (position) => {
		set({ lastCanvasClickPosition: position });
	},

	setSavedTestInfo: (info) => {
		set({ savedTestInfo: info });
	}
}));
