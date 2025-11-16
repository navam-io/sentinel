<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { Cpu } from 'lucide-svelte';

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

	// Prevent node dragging when interacting with controls
	function handleMouseDown(e: MouseEvent) {
		e.stopPropagation();
	}

	function handlePointerDown(e: PointerEvent) {
		e.stopPropagation();
	}
</script>

<div class="sentinel-node model-node">
	<div class="node-header">
		<Cpu size={18} class="node-icon" strokeWidth={2} />
		<span class="node-title">Model</span>
	</div>
	<div class="node-body">
		<div class="space-y-3">
			<div class="nodrag nopan">
				<label for="model-select" class="label">Model</label>
				<select
					id="model-select"
					value={selectedModel}
					onchange={updateModel}
					class="sentinel-input text-sm w-full nodrag nopan"
				>
					{#each models as model}
						<option value={model}>{model}</option>
					{/each}
				</select>
			</div>
			<div class="nodrag nopan">
				<label for="temperature-range" class="label">Temperature: {temperature}</label>
				<input
					id="temperature-range"
					type="range"
					min="0"
					max="2"
					step="0.1"
					value={temperature}
					oninput={updateTemperature}
					class="w-full cursor-pointer nodrag nopan"
				/>
			</div>
		</div>
	</div>
	<Handle type="target" position={Position.Top} />
	<Handle type="source" position={Position.Bottom} />
</div>
