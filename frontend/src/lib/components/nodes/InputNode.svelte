<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { MessageSquare, X } from 'lucide-svelte';
	import { nodesStore, edgesStore } from '$lib/stores/canvas';

	let { data, id }: NodeProps = $props();

	let query = $state((data?.query as string) || 'What is the capital of France?');

	function updateQuery(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		query = target.value;
		data.query = query;

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, query } } : n)
		);
	}

	function deleteNode(e: Event) {
		e.stopPropagation();
		nodesStore.update(nodes => nodes.filter(n => n.id !== id));
		edgesStore.update(edges => edges.filter(e => e.source !== id && e.target !== id));
	}

</script>

<div class="sentinel-node input-node">
	<button class="node-delete-btn nodrag nopan" onclick={deleteNode} title="Delete node">
		<X size={10} strokeWidth={2} />
	</button>
	<div class="node-header">
		<MessageSquare size={18} class="node-icon" strokeWidth={2} />
		<span class="node-title">Input</span>
	</div>
	<div class="node-body">
		<textarea
			value={query}
			oninput={updateQuery}
			class="sentinel-input text-[0.65rem] w-full min-h-16 resize-y nodrag nopan"
			placeholder="Enter your prompt..."
		></textarea>
	</div>
	<Handle type="source" position={Position.Bottom} />
</div>
