<script lang="ts">
	import { yamlStore, nodesStore, edgesStore } from '$lib/stores/canvas';
	import { parseYAMLToNodes } from '$lib/dsl/generator';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager';

	let yaml = $derived($yamlStore);
	let isEditMode = $state(false);
	let editedYaml = $state('');
	let errorMessage = $state('');

	function toggleEditMode() {
		if (!isEditMode) {
			// Entering edit mode - copy current YAML to editor
			editedYaml = yaml;
			errorMessage = '';
		}
		isEditMode = !isEditMode;
	}

	function applyYamlChanges() {
		try {
			// Parse the edited YAML
			const { nodes, edges } = parseYAMLToNodes(editedYaml);

			if (nodes.length === 0) {
				errorMessage = 'Failed to parse YAML. Please check syntax.';
				return;
			}

			// Update stores with parsed nodes and edges
			nodesStore.set(nodes);
			edgesStore.set(edges);

			// Exit edit mode
			isEditMode = false;
			errorMessage = '';
		} catch (err) {
			errorMessage = `Parse error: ${err instanceof Error ? err.message : String(err)}`;
		}
	}

	function cancelEdit() {
		isEditMode = false;
		errorMessage = '';
	}

	async function copyToClipboard() {
		try {
			await writeText(yaml);
			alert('YAML copied to clipboard!');
		} catch (err) {
			// Fallback for browser mode
			navigator.clipboard.writeText(yaml);
		}
	}

	function downloadYaml() {
		const blob = new Blob([yaml], { type: 'text/yaml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'test-spec.yaml';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div class="w-96 bg-sentinel-bg-elevated border-l border-sentinel-border flex flex-col">
	<!-- Preview Header -->
	<div class="p-4 border-b border-sentinel-border">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-semibold text-sentinel-text">
				{isEditMode ? 'Edit YAML' : 'YAML Preview'}
			</h2>
			<div class="flex gap-2">
				{#if !isEditMode}
					<button
						onclick={toggleEditMode}
						class="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
						title="Edit YAML"
					>
						✏️ Edit
					</button>
					<button
						onclick={copyToClipboard}
						class="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
						title="Copy to clipboard"
					>
						📋 Copy
					</button>
					<button
						onclick={downloadYaml}
						class="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
						title="Download YAML"
					>
						💾 Save
					</button>
				{:else}
					<button
						onclick={applyYamlChanges}
						class="text-[0.6rem] px-2 py-1 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120"
						title="Apply changes"
					>
						✓ Apply
					</button>
					<button
						onclick={cancelEdit}
						class="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
						title="Cancel editing"
					>
						✕ Cancel
					</button>
				{/if}
			</div>
		</div>
		<p class="text-[0.6rem] text-sentinel-text-muted mt-1">
			{isEditMode ? 'Edit and apply to update canvas' : 'Auto-generated from canvas'}
		</p>
	</div>

	<!-- YAML Content -->
	<div class="flex-1 overflow-y-auto p-4">
		{#if isEditMode}
			<textarea
				bind:value={editedYaml}
				class="w-full h-full text-[0.65rem] font-mono text-sentinel-text bg-sentinel-bg p-4 rounded-md border border-sentinel-border resize-none focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
				placeholder="Enter YAML here..."
			></textarea>
			{#if errorMessage}
				<div class="mt-2 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-[0.6rem] text-sentinel-error">
					{errorMessage}
				</div>
			{/if}
		{:else}
			<pre class="text-[0.65rem] font-mono text-sentinel-text bg-sentinel-bg p-4 rounded-md border border-sentinel-border overflow-x-auto">
{yaml}
			</pre>
		{/if}
	</div>

	<!-- Preview Footer -->
	<div class="p-3 border-t border-sentinel-border">
		<div class="text-[0.6rem] text-sentinel-text-muted">
			<div class="flex justify-between items-center">
				<span>{isEditMode ? 'Edit mode active' : 'Real-time sync enabled'}</span>
				<span class="text-sentinel-success">● {isEditMode ? 'Editing' : 'Live'}</span>
			</div>
		</div>
	</div>
</div>
