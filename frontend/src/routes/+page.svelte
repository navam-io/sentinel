<script lang="ts">
	import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import ComponentPalette from '$lib/components/palette/ComponentPalette.svelte';
	import YamlPreview from '$lib/components/yaml/YamlPreview.svelte';
	import InputNode from '$lib/components/nodes/InputNode.svelte';
	import ModelNode from '$lib/components/nodes/ModelNode.svelte';
	import AssertionNode from '$lib/components/nodes/AssertionNode.svelte';
	import { nodesStore, edgesStore } from '$lib/stores/canvas';

	// Register custom node types
	const nodeTypes = {
		input: InputNode,
		model: ModelNode,
		assertion: AssertionNode
	};

	let showYamlPreview = $state(true);

	function toggleYamlPreview() {
		showYamlPreview = !showYamlPreview;
	}
</script>

<div class="h-screen w-screen flex flex-col bg-sentinel-bg">
	<!-- Top Bar -->
	<div class="h-14 bg-sentinel-bg-elevated border-b border-sentinel-border flex items-center justify-between px-4">
		<div class="flex items-center gap-4">
			<h1 class="text-xl font-semibold text-sentinel-primary">Sentinel</h1>
			<span class="text-sm text-sentinel-text-muted">Visual Test Builder</span>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={toggleYamlPreview}
				class="sentinel-button-secondary text-sm"
			>
				{showYamlPreview ? 'Hide' : 'Show'} YAML
			</button>
			<button class="sentinel-button-primary text-sm">
				▶ Run Test
			</button>
			<button class="sentinel-button-secondary text-sm">
				Export
			</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 flex overflow-hidden">
		<!-- Component Palette (Left Sidebar) -->
		<ComponentPalette />

		<!-- Canvas Area -->
		<div class="flex-1 relative">
			<SvelteFlow
				nodes={$nodesStore}
				edges={$edgesStore}
				{nodeTypes}
				fitView
				class="bg-sentinel-bg"
			>
				<Background />
				<Controls />
				<MiniMap />
			</SvelteFlow>
		</div>

		<!-- YAML Preview (Right Sidebar) -->
		{#if showYamlPreview}
			<YamlPreview />
		{/if}
	</div>
</div>

<style>
	:global(.svelte-flow) {
		background-color: var(--sentinel-bg);
	}

	:global(.svelte-flow__node) {
		background-color: var(--sentinel-surface);
		border-color: var(--sentinel-border);
		color: var(--sentinel-text);
	}

	:global(.svelte-flow__edge-path) {
		stroke: var(--sentinel-primary);
	}

	:global(.svelte-flow__controls) {
		background-color: var(--sentinel-surface);
		border-color: var(--sentinel-border);
	}

	:global(.svelte-flow__minimap) {
		background-color: var(--sentinel-bg-elevated);
		border-color: var(--sentinel-border);
	}
</style>
