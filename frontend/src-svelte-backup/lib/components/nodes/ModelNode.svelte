<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { NodeProps } from '@xyflow/svelte';
	import { Cpu, X } from 'lucide-svelte';
	import { nodesStore, edgesStore } from '$lib/stores/canvas';

	let { data, id }: NodeProps = $props();

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

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, model: selectedModel } } : n)
		);
	}

	function updateTemperature(e: Event) {
		const target = e.target as HTMLInputElement;
		temperature = parseFloat(target.value);
		data.temperature = temperature;

		// Trigger store update for reactivity
		nodesStore.update(nodes =>
			nodes.map(n => n.id === id ? { ...n, data: { ...n.data, temperature } } : n)
		);
	}

	function deleteNode(e: Event) {
		e.stopPropagation();
		nodesStore.update(nodes => nodes.filter(n => n.id !== id));
		edgesStore.update(edges => edges.filter(e => e.source !== id && e.target !== id));
	}
</script>

<div class="sentinel-node model-node">
	<button class="node-delete-btn nodrag nopan" onclick={deleteNode} title="Delete node">
		<X size={10} strokeWidth={2} />
	</button>
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
					class="sentinel-input text-[0.65rem] w-full nodrag nopan"
				>
					{#each models as model}
						<option value={model}>{model}</option>
					{/each}
				</select>
			</div>
			<div class="nodrag nopan">
				<label for="temperature-range" class="label text-[0.55rem]">Temperature: {temperature}</label>
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
