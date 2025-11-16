<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { MessageSquare } from 'lucide-svelte';

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
		<MessageSquare size={18} class="node-icon" strokeWidth={2} />
		<span class="node-title">Input</span>
	</div>
	<div class="node-body">
		<textarea
			value={query}
			oninput={updateQuery}
			class="sentinel-input text-sm w-full min-h-16 resize-y nodrag nopan"
			placeholder="Enter your prompt..."
		></textarea>
	</div>
	<Handle type="source" position={Position.Bottom} />
</div>
