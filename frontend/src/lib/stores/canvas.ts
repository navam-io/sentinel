import { writable, derived } from 'svelte/store';
import type { Node, Edge } from '@xyflow/svelte';
import { generateYAML } from '$lib/dsl/generator';

// Node and Edge stores
export const nodesStore = writable<Node[]>([
	{
		id: '1',
		type: 'input',
		data: { label: 'Input Node', query: 'What is the capital of France?' },
		position: { x: 100, y: 100 }
	},
	{
		id: '2',
		type: 'model',
		data: { label: 'Model: GPT-4', model: 'gpt-4', temperature: 0.7 },
		position: { x: 100, y: 300 }
	},
	{
		id: '3',
		type: 'assertion',
		data: { label: 'Assertion', assertionType: 'must_contain', assertionValue: 'Paris' },
		position: { x: 100, y: 500 }
	}
]);

export const edgesStore = writable<Edge[]>([
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
]);

// Derived store for YAML generation
export const yamlStore = derived(
	[nodesStore, edgesStore],
	([$nodes, $edges]) => {
		return generateYAML($nodes, $edges);
	}
);

// Helper functions for node manipulation
export function addNode(node: Node) {
	nodesStore.update(nodes => [...nodes, node]);
}

export function removeNode(nodeId: string) {
	nodesStore.update(nodes => nodes.filter(n => n.id !== nodeId));
	edgesStore.update(edges => edges.filter(e => e.source !== nodeId && e.target !== nodeId));
}

export function updateNode(nodeId: string, data: Partial<Node['data']>) {
	nodesStore.update(nodes =>
		nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
	);
}
