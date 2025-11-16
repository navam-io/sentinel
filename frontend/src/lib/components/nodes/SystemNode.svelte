<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { Settings, X } from 'lucide-svelte';
	import { nodesStore, edgesStore } from '$lib/stores/canvas';

	let { data, id }: NodeProps = $props();

	let systemPrompt = $state((data?.systemPrompt as string) || 'You are a helpful AI assistant.');

	function updateSystemPrompt(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		systemPrompt = target.value;
		data.systemPrompt = systemPrompt;

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, systemPrompt } } : n)
		);
	}

	function deleteNode(e: Event) {
		e.stopPropagation();
		nodesStore.update(nodes => nodes.filter(n => n.id !== id));
		edgesStore.update(edges => edges.filter(e => e.source !== id && e.target !== id));
	}
</script>

<div class="sentinel-node system-node">
	<button class="node-delete-btn nodrag nopan" onclick={deleteNode} title="Delete node">
		<X size={10} strokeWidth={2} />
	</button>
	<div class="node-header">
		<Settings size={18} class="node-icon" strokeWidth={2} />
		<span class="node-title">System</span>
	</div>
	<div class="node-body">
		<textarea
			value={systemPrompt}
			oninput={updateSystemPrompt}
			class="sentinel-input text-[0.65rem] w-full min-h-16 resize-y nodrag nopan"
			placeholder="Enter system prompt..."
		></textarea>
	</div>
	<Handle type="source" position={Position.Bottom} />
</div>
