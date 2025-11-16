<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { Wrench, X } from 'lucide-svelte';
	import { nodesStore, edgesStore } from '$lib/stores/canvas';

	let { data, id }: NodeProps = $props();

	let toolName = $state<string>((data.toolName as string) || 'web_search');
	let toolDescription = $state<string>((data.toolDescription as string) || '');

	function updateToolName(e: Event) {
		const target = e.target as HTMLInputElement;
		toolName = target.value;
		data.toolName = toolName;

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, toolName } } : n)
		);
	}

	function updateToolDescription(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		toolDescription = target.value;
		data.toolDescription = toolDescription;

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, toolDescription } } : n)
		);
	}

	function deleteNode(e: Event) {
		e.stopPropagation();
		nodesStore.update(nodes => nodes.filter(n => n.id !== id));
		edgesStore.update(edges => edges.filter(e => e.source !== id && e.target !== id));
	}
</script>

<div class="sentinel-node tool-node">
	<button class="node-delete-btn nodrag nopan" onclick={deleteNode} title="Delete node">
		<X size={10} strokeWidth={2} />
	</button>
	<div class="node-header">
		<Wrench size={18} class="node-icon" strokeWidth={2} />
		<span class="node-title">Tool</span>
	</div>
	<div class="node-body">
		<div class="space-y-3">
			<div class="nodrag nopan">
				<label for="tool-name" class="label">Tool Name</label>
				<input
					id="tool-name"
					type="text"
					value={toolName}
					oninput={updateToolName}
					class="sentinel-input text-[0.65rem] w-full nodrag nopan"
					placeholder="e.g. web_search"
				/>
			</div>
			<div class="nodrag nopan">
				<label for="tool-description" class="label">Description</label>
				<textarea
					id="tool-description"
					value={toolDescription}
					oninput={updateToolDescription}
					class="sentinel-input text-[0.65rem] w-full min-h-16 resize-y nodrag nopan"
					placeholder="Tool description..."
				></textarea>
			</div>
		</div>
	</div>
	<Handle type="target" position={Position.Top} />
	<Handle type="source" position={Position.Bottom} />
</div>
