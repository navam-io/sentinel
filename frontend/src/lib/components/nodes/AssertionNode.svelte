<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { CheckCircle2 } from 'lucide-svelte';

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

	// Prevent node dragging when interacting with controls
	function handleMouseDown(e: MouseEvent) {
		e.stopPropagation();
	}

	function handlePointerDown(e: PointerEvent) {
		e.stopPropagation();
	}
</script>

<div class="sentinel-node assertion-node">
	<div class="node-header">
		<CheckCircle2 size={18} class="node-icon" strokeWidth={2} />
		<span class="node-title">Assertion</span>
	</div>
	<div class="node-body">
		<div class="space-y-3">
			<div>
				<label for="assertion-type" class="label">Type</label>
				<select
					id="assertion-type"
					value={assertionType}
					onchange={updateType}
					onmousedown={handleMouseDown}
					onpointerdown={handlePointerDown}
					class="sentinel-input text-sm w-full"
				>
					{#each assertionTypes as type}
						<option value={type.value}>{type.label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="assertion-value" class="label">Value</label>
				<input
					id="assertion-value"
					type="text"
					value={assertionValue}
					oninput={updateValue}
					onmousedown={handleMouseDown}
					onpointerdown={handlePointerDown}
					class="sentinel-input text-sm w-full"
					placeholder="Expected value..."
				/>
			</div>
		</div>
	</div>
	<Handle type="target" position={Position.Top} />
</div>
