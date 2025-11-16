<script lang="ts">
	import { SvelteFlow, Background, Controls, MiniMap, BackgroundVariant, type XYPosition } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import ComponentPalette from '$lib/components/palette/ComponentPalette.svelte';
	import YamlPreview from '$lib/components/yaml/YamlPreview.svelte';
	import InputNode from '$lib/components/nodes/InputNode.svelte';
	import ModelNode from '$lib/components/nodes/ModelNode.svelte';
	import AssertionNode from '$lib/components/nodes/AssertionNode.svelte';
	import ToolNode from '$lib/components/nodes/ToolNode.svelte';
	import SystemNode from '$lib/components/nodes/SystemNode.svelte';
	import { nodesStore, edgesStore, addNodeAtPosition, lastCanvasClickPosition } from '$lib/stores/canvas';
	import { Play, FileDown } from 'lucide-svelte';

	// Register custom node types
	const nodeTypes = {
		input: InputNode,
		model: ModelNode,
		assertion: AssertionNode,
		tool: ToolNode,
		system: SystemNode
	};

	let showYamlPreview = $state(true);

	function toggleYamlPreview() {
		showYamlPreview = !showYamlPreview;
	}

	// Track canvas clicks for smart positioning
	function handlePaneClick(event: any) {
		if (event?.detail) {
			const { x, y } = event.detail;
			lastCanvasClickPosition.set({ x, y });
		}
	}

	// Handle drop event with proper flow coordinate conversion
	function onDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
		// Debug: Uncomment to see if dragover is firing
		// console.log('Drag over canvas');
	}

	function onDrop(event: DragEvent) {
		console.log('Drop event fired!', event);
		event.preventDefault();
		event.stopPropagation();

		const nodeType = event.dataTransfer?.getData('application/svelteflow');
		const label = event.dataTransfer?.getData('application/label');

		console.log('Drop data retrieved:', { nodeType, label });

		if (!nodeType || !label) {
			console.log('Drop failed: missing nodeType or label', { nodeType, label });
			return;
		}

		// Get the canvas element to calculate proper flow coordinates
		const canvasElement = event.currentTarget as HTMLElement;
		const flowBounds = canvasElement.getBoundingClientRect();

		// Calculate position in flow coordinates
		const position = {
			x: event.clientX - flowBounds.left,
			y: event.clientY - flowBounds.top
		};

		console.log('Dropping node:', { nodeType, label, position, bounds: flowBounds });
		addNodeAtPosition(nodeType, label, position);
	}

	// Alternative: Use SvelteFlow's native drop handler
	function onFlowDrop(event: CustomEvent) {
		console.log('SvelteFlow drop event:', event.detail);
	}
</script>

<div class="h-screen w-screen flex flex-col bg-sentinel-bg">
	<!-- Top Bar -->
	<div class="h-12 bg-sentinel-bg-elevated border-b border-sentinel-border flex items-center justify-between px-4">
		<div class="flex items-center gap-3">
			<h1 class="text-base font-semibold text-sentinel-primary">Sentinel</h1>
			<span class="text-[0.65rem] text-sentinel-text-muted">Visual Test Builder</span>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={toggleYamlPreview}
				class="sentinel-button-secondary text-[0.65rem]"
			>
				{showYamlPreview ? 'Hide' : 'Show'} YAML
			</button>
			<button class="sentinel-button-primary text-[0.65rem] flex items-center gap-1.5">
				<Play size={12} strokeWidth={2} />
				Run Test
			</button>
			<button class="sentinel-button-secondary text-[0.65rem] flex items-center gap-1.5">
				<FileDown size={12} strokeWidth={2} />
				Export
			</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 flex overflow-hidden">
		<!-- Component Palette (Left Sidebar) -->
		<ComponentPalette />

		<!-- Canvas Area -->
		<div class="flex-1 relative canvas-drop-area" role="application">
			<div
				class="absolute inset-0 pointer-events-none"
				style="z-index: 5;"
				ondragover={onDragOver}
				ondrop={onDrop}
				role="region"
				aria-label="Drop zone"
			></div>
			<SvelteFlow
				nodes={$nodesStore}
				edges={$edgesStore}
				{nodeTypes}
				fitView
				class="bg-sentinel-bg"
				onpaneclick={handlePaneClick}
				nodesDraggable={true}
				nodesConnectable={true}
				elementsSelectable={true}
			>
				<Background variant={BackgroundVariant.Dots} gap={16} size={1} />
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

	/* Force dark canvas background */
	:global(.svelte-flow) {
		background-color: #1a1d23 !important;
	}

	:global(.svelte-flow__background) {
		background-color: #1a1d23 !important;
	}

	:global(.svelte-flow__pane) {
		background-color: #1a1d23 !important;
	}

	/* Make edges visible but not too thick */
	:global(.svelte-flow__edge-path) {
		stroke: #6EE3F6 !important;
		stroke-width: 3px !important;
	}

	:global(.svelte-flow__edge.selected .svelte-flow__edge-path) {
		stroke: #3CBACD !important;
		stroke-width: 4px !important;
	}

	/* Hide Svelte Flow watermark completely */
	:global(.svelte-flow__attribution) {
		display: none !important;
		visibility: hidden !important;
		opacity: 0 !important;
	}

	:global(.svelte-flow__node) {
		background-color: var(--sentinel-surface);
		border-color: var(--sentinel-border);
		color: var(--sentinel-text);
	}

	/* Style zoom controls - dark theme */
	:global(.svelte-flow__controls) {
		background-color: var(--sentinel-surface) !important;
		border: 1px solid var(--sentinel-border) !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
	}

	:global(.svelte-flow__controls-button) {
		background-color: var(--sentinel-bg-elevated) !important;
		border: 1px solid var(--sentinel-border) !important;
		color: var(--sentinel-text) !important;
		width: 32px !important;
		height: 32px !important;
	}

	:global(.svelte-flow__controls-button:hover) {
		background-color: var(--sentinel-hover) !important;
		border-color: var(--sentinel-primary) !important;
	}

	:global(.svelte-flow__controls-button svg) {
		fill: var(--sentinel-text) !important;
		max-width: 16px !important;
		max-height: 16px !important;
	}

	:global(.svelte-flow__minimap) {
		background-color: var(--sentinel-bg-elevated) !important;
		border: 1px solid var(--sentinel-border) !important;
	}
</style>
