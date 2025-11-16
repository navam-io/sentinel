<script lang="ts">
	import { addNode } from '$lib/stores/canvas';

	const nodeTypes = [
		{
			category: 'Inputs',
			nodes: [
				{ type: 'input', label: '💬 Prompt', icon: '💬', description: 'User input prompt' },
				{ type: 'system', label: '⚙️ System', icon: '⚙️', description: 'System prompt' },
			]
		},
		{
			category: 'Models',
			nodes: [
				{ type: 'model', label: '🤖 Model', icon: '🤖', description: 'AI model configuration' },
			]
		},
		{
			category: 'Tools',
			nodes: [
				{ type: 'tool', label: '🔧 Tool', icon: '🔧', description: 'Agent tool' },
			]
		},
		{
			category: 'Assertions',
			nodes: [
				{ type: 'assertion', label: '✓ Assertion', icon: '✓', description: 'Test assertion' },
			]
		}
	];

	function handleDragStart(event: DragEvent, nodeType: string) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('application/svelteflow', nodeType);
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleAddNode(nodeType: string, label: string) {
		const newNode = {
			id: `${nodeType}-${Date.now()}`,
			type: nodeType,
			data: { label },
			position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 }
		};
		addNode(newNode);
	}
</script>

<div class="w-64 bg-sentinel-bg-elevated border-r border-sentinel-border flex flex-col">
	<!-- Palette Header -->
	<div class="p-4 border-b border-sentinel-border">
		<h2 class="text-lg font-semibold text-sentinel-text">Components</h2>
		<p class="text-xs text-sentinel-text-muted mt-1">Drag & drop to canvas</p>
	</div>

	<!-- Component Categories -->
	<div class="flex-1 overflow-y-auto p-3 space-y-4">
		{#each nodeTypes as category}
			<div class="space-y-2">
				<h3 class="text-sm font-medium text-sentinel-text-muted uppercase tracking-wide px-2">
					{category.category}
				</h3>
				<div class="space-y-1">
					{#each category.nodes as node}
						<button
							class="w-full text-left p-3 bg-sentinel-surface border border-sentinel-border rounded-sentinel hover:bg-sentinel-hover hover:border-sentinel-primary transition-all duration-120 cursor-move"
							draggable="true"
							ondragstart={(e) => handleDragStart(e, node.type)}
							onclick={() => handleAddNode(node.type, node.label)}
						>
							<div class="flex items-center gap-2">
								<span class="text-lg">{node.icon}</span>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-medium text-sentinel-text truncate">
										{node.label}
									</div>
									<div class="text-xs text-sentinel-text-muted truncate">
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
		<button class="w-full sentinel-button-secondary text-sm">
			+ Add Custom Node
		</button>
	</div>
</div>
