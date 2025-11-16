<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';

	let { data }: NodeProps = $props();

	const models = [
		'gpt-4',
		'gpt-4-turbo',
		'gpt-3.5-turbo',
		'claude-3-5-sonnet-20241022',
		'claude-3-opus-20240229',
		'claude-3-sonnet-20240229'
	];

	let selectedModel = $state(data.model || 'gpt-4');
	let temperature = $state(data.temperature || 0.7);

	function updateModel(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedModel = target.value;
		data.model = selectedModel;
	}

	function updateTemperature(e: Event) {
		const target = e.target as HTMLInputElement;
		temperature = parseFloat(target.value);
		data.temperature = temperature;
	}
</script>

<div class="sentinel-node model-node">
	<div class="node-header">
		<span class="node-icon">🤖</span>
		<span class="node-title">Model</span>
	</div>
	<div class="node-body">
		<div class="space-y-3">
			<div>
				<label class="label">Model</label>
				<select value={selectedModel} onchange={updateModel} class="sentinel-input text-sm w-full">
					{#each models as model}
						<option value={model}>{model}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="label">Temperature: {temperature}</label>
				<input
					type="range"
					min="0"
					max="2"
					step="0.1"
					value={temperature}
					oninput={updateTemperature}
					class="w-full"
				/>
			</div>
		</div>
	</div>
	<Handle type="target" position={Position.Top} />
	<Handle type="source" position={Position.Bottom} />
</div>

<style>
	.model-node {
		border-top: 3px solid var(--sentinel-secondary);
	}

	.label {
		display: block;
		font-size: 0.75rem;
		color: var(--sentinel-text-muted);
		margin-bottom: 4px;
	}
</style>
