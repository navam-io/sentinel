<script lang="ts">
	import { addNodeAtPosition, lastCanvasClickPosition } from '$lib/stores/canvas';
	import { MessageSquare, Settings, Cpu, Wrench, CheckCircle2 } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';
	import { get } from 'svelte/store';

	const nodeTypes: {
		category: string;
		nodes: {
			type: string;
			label: string;
			icon: ComponentType;
			description: string;
		}[];
	}[] = [
		{
			category: 'Inputs',
			nodes: [
				{ type: 'input', label: 'Prompt', icon: MessageSquare, description: 'User input prompt' },
				{ type: 'system', label: 'System', icon: Settings, description: 'System prompt' },
			]
		},
		{
			category: 'Models',
			nodes: [
				{ type: 'model', label: 'Model', icon: Cpu, description: 'AI model configuration' },
			]
		},
		{
			category: 'Tools',
			nodes: [
				{ type: 'tool', label: 'Tool', icon: Wrench, description: 'Agent tool' },
			]
		},
		{
			category: 'Assertions',
			nodes: [
				{ type: 'assertion', label: 'Assertion', icon: CheckCircle2, description: 'Test assertion' },
			]
		}
	];

	function handleDragStart(event: DragEvent, nodeType: string, label: string) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('application/svelteflow', nodeType);
			event.dataTransfer.setData('application/label', label);
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleAddNode(nodeType: string, label: string) {
		// Use last canvas click position, or increment Y position
		const lastPos = get(lastCanvasClickPosition);
		const position = { x: lastPos.x, y: lastPos.y };

		// Increment position for next node to avoid overlap
		lastCanvasClickPosition.set({ x: lastPos.x, y: lastPos.y + 200 });

		addNodeAtPosition(nodeType, label, position);
	}
</script>

<div class="w-64 bg-sentinel-bg-elevated border-r border-sentinel-border flex flex-col">
	<!-- Palette Header -->
	<div class="p-4 border-b border-sentinel-border">
		<h2 class="text-sm font-semibold text-sentinel-text">Components</h2>
		<p class="text-[0.6rem] text-sentinel-text-muted mt-1">Drag & drop to canvas</p>
	</div>

	<!-- Component Categories -->
	<div class="flex-1 overflow-y-auto p-3 space-y-4">
		{#each nodeTypes as category}
			<div class="space-y-2">
				<h3 class="text-[0.6rem] font-medium text-sentinel-text-muted uppercase tracking-wide px-2">
					{category.category}
				</h3>
				<div class="space-y-1">
					{#each category.nodes as node}
						<button
							class="w-full text-left p-2 bg-sentinel-surface border border-sentinel-border rounded-md hover:bg-sentinel-hover hover:border-sentinel-primary transition-all duration-150 cursor-move"
							draggable="true"
							ondragstart={(e) => handleDragStart(e, node.type, node.label)}
							onclick={() => handleAddNode(node.type, node.label)}
						>
							<div class="flex items-center gap-2">
								<svelte:component this={node.icon} size={14} strokeWidth={2} class="text-sentinel-primary flex-shrink-0" />
								<div class="flex-1 min-w-0">
									<div class="text-[0.65rem] font-medium text-sentinel-text truncate">
										{node.label}
									</div>
									<div class="text-[0.55rem] text-sentinel-text-muted truncate">
										{node.description}
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Palette Footer -->
	<div class="p-3 border-t border-sentinel-border">
		<button class="w-full sentinel-button-secondary text-[0.65rem]">
			+ Add Custom Node
		</button>
	</div>
</div>
