<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';

	let { data }: NodeProps = $props();

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
	}

	function updateValue(e: Event) {
		const target = e.target as HTMLInputElement;
		assertionValue = target.value;
		data.assertionValue = assertionValue;
	}
</script>

<div class="sentinel-node assertion-node">
	<div class="node-header">
		<span class="node-icon">✓</span>
		<span class="node-title">Assertion</span>
	</div>
	<div class="node-body">
		<div class="space-y-3">
			<div>
				<label class="label">Type</label>
				<select value={assertionType} onchange={updateType} class="sentinel-input text-sm w-full">
					{#each assertionTypes as type}
						<option value={type.value}>{type.label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="label">Value</label>
				<input
					type="text"
					value={assertionValue}
					oninput={updateValue}
					class="sentinel-input text-sm w-full"
					placeholder="Expected value..."
				/>
			</div>
		</div>
	</div>
	<Handle type="target" position={Position.Top} />
</div>

<style>
	.assertion-node {
		border-top: 3px solid var(--sentinel-success);
	}

	.label {
		display: block;
		font-size: 0.75rem;
		color: var(--sentinel-text-muted);
		margin-bottom: 4px;
	}
</style>
