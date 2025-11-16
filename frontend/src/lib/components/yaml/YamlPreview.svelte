<script lang="ts">
	import { yamlStore } from '$lib/stores/canvas';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager';

	let yaml = $derived($yamlStore);

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
			<h2 class="text-lg font-semibold text-sentinel-text">YAML Preview</h2>
			<div class="flex gap-2">
				<button
					onclick={copyToClipboard}
					class="text-xs px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
					title="Copy to clipboard"
				>
					📋 Copy
				</button>
				<button
					onclick={downloadYaml}
					class="text-xs px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
					title="Download YAML"
				>
					💾 Download
				</button>
			</div>
		</div>
		<p class="text-xs text-sentinel-text-muted mt-1">Auto-generated from canvas</p>
	</div>

	<!-- YAML Content -->
	<div class="flex-1 overflow-y-auto p-4">
		<pre class="text-xs font-mono text-sentinel-text bg-sentinel-bg p-4 rounded-sentinel border border-sentinel-border overflow-x-auto">
{yaml}
		</pre>
	</div>

	<!-- Preview Footer -->
	<div class="p-3 border-t border-sentinel-border">
		<div class="text-xs text-sentinel-text-muted">
			<div class="flex justify-between items-center">
				<span>Real-time sync enabled</span>
				<span class="text-sentinel-success">● Live</span>
			</div>
		</div>
	</div>
</div>
