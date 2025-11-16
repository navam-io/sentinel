<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';

	let { data }: NodeProps = $props();

	let query = $state((data?.query as string) || 'What is the capital of France?');

	function updateQuery(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		query = target.value;
		data.query = query;
	}
</script>

<div class="sentinel-node input-node">
	<div class="node-header">
		<span class="node-icon">💬</span>
		<span class="node-title">Input</span>
	</div>
	<div class="node-body">
		<textarea
			value={query}
			oninput={updateQuery}
			class="sentinel-input text-sm w-full min-h-20 resize-y"
			placeholder="Enter your prompt..."
		></textarea>
	</div>
	<Handle type="source" position={Position.Bottom} />
</div>

<style>
	.sentinel-node {
		min-width: 280px;
		background: var(--sentinel-surface);
		border: 1px solid var(--sentinel-border);
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.input-node {
		border-top: 3px solid var(--sentinel-primary);
	}

	.node-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		border-bottom: 1px solid var(--sentinel-border);
	}

	.node-icon {
		font-size: 18px;
	}

	.node-title {
		font-weight: 600;
		color: var(--sentinel-text);
	}

	.node-body {
		padding: 12px;
	}
</style>
