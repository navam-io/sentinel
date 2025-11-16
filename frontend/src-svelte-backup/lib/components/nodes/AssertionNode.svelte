<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { CheckCircle2, X } from 'lucide-svelte';
	import { nodesStore, edgesStore } from '$lib/stores/canvas';

	let { data, id }: NodeProps = $props();

	const assertionTypes = [
		{ value: 'must_contain', label: 'Must Contain' },
		{ value: 'must_not_contain', label: 'Must Not Contain' },
		{ value: 'regex_match', label: 'Regex Match' },
		{ value: 'output_type', label: 'Output Type' },
		{ value: 'max_latency_ms', label: 'Max Latency' }
	];

	let assertionType = $state(data.assertionType || 'must_contain');
	let assertionValue = $state(data.assertionValue || 'Paris');

	function updateType(e: Event) {
		const target = e.target as HTMLSelectElement;
		assertionType = target.value;
		data.assertionType = assertionType;

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, assertionType } } : n)
		);
	}

	function updateValue(e: Event) {
		const target = e.target as HTMLInputElement;
		assertionValue = target.value;
		data.assertionValue = assertionValue;

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, assertionValue } } : n)
		);
	}

	function deleteNode(e: Event) {
		e.stopPropagation();
		nodesStore.update(nodes => nodes.filter(n => n.id !== id));
		edgesStore.update(edges => edges.filter(e => e.source !== id && e.target !== id));
	}

</script>

<div class="sentinel-node assertion-node">
	<button class="node-delete-btn nodrag nopan" onclick={deleteNode} title="Delete node">
		<X size={10} strokeWidth={2} />
	</button>
	<div class="node-header">
		<CheckCircle2 size={18} class="node-icon" strokeWidth={2} />
		<span class="node-title">Assertion</span>
	</div>
	<div class="node-body">
		<div class="space-y-3">
			<div class="nodrag nopan">
				<label for="assertion-type" class="label">Type</label>
				<select
					id="assertion-type"
					value={assertionType}
					onchange={updateType}
					class="sentinel-input text-[0.65rem] w-full nodrag nopan"
				>
					{#each assertionTypes as type}
						<option value={type.value}>{type.label}</option>
					{/each}
				</select>
			</div>
			<div class="nodrag nopan">
				<label for="assertion-value" class="label">Value</label>
				<input
					id="assertion-value"
					type="text"
					value={assertionValue}
					oninput={updateValue}
					class="sentinel-input text-[0.65rem] w-full nodrag nopan"
					placeholder="Expected value..."
				/>
			</div>
		</div>
	</div>
	<Handle type="target" position={Position.Top} />
</div>
