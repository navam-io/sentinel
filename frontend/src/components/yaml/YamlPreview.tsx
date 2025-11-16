import { useState, useMemo } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { generateYAML, parseYAMLToNodes } from '../../lib/dsl/generator';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

function YamlPreview() {
	const { nodes, edges, setNodes, setEdges } = useCanvasStore();
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedYaml, setEditedYaml] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// Generate YAML from current canvas state
	const yaml = useMemo(() => generateYAML(nodes, edges), [nodes, edges]);

	const toggleEditMode = () => {
		if (!isEditMode) {
			// Entering edit mode - copy current YAML to editor
			setEditedYaml(yaml);
			setErrorMessage('');
		}
		setIsEditMode(!isEditMode);
	};

	const applyYamlChanges = () => {
		try {
			// Parse the edited YAML
			const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(editedYaml);

			if (parsedNodes.length === 0) {
				setErrorMessage('Failed to parse YAML. Please check syntax.');
				return;
			}

			// Update canvas with parsed nodes and edges
			setNodes(parsedNodes);
			setEdges(parsedEdges);

			// Exit edit mode
			setIsEditMode(false);
			setErrorMessage('');
		} catch (err) {
			setErrorMessage(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const cancelEdit = () => {
		setIsEditMode(false);
		setErrorMessage('');
	};

	const copyToClipboard = async () => {
		try {
			await writeText(yaml);
			alert('YAML copied to clipboard!');
		} catch (err) {
			// Fallback for browser mode
			await navigator.clipboard.writeText(yaml);
		}
	};

	const downloadYaml = () => {
		const blob = new Blob([yaml], { type: 'text/yaml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'test-spec.yaml';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const importYamlFile = () => {
		// Create a file input element
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.yaml,.yml,.json';

		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const content = await file.text();

				// Parse and validate
				const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(content);

				if (parsedNodes.length === 0) {
					setErrorMessage('Failed to import file. Please check the file format.');
					return;
				}

				// Update canvas with imported data
				setNodes(parsedNodes);
				setEdges(parsedEdges);

				// Show success message
				alert(`Successfully imported ${file.name}!`);
				setErrorMessage('');
			} catch (err) {
				setErrorMessage(`Import error: ${err instanceof Error ? err.message : String(err)}`);
			}
		};

		input.click();
	};

	return (
		<div className="w-96 bg-sentinel-bg-elevated border-l border-sentinel-border flex flex-col">
			{/* Preview Header */}
			<div className="p-4 border-b border-sentinel-border">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-sentinel-text">
						{isEditMode ? 'Edit YAML' : 'YAML Preview'}
					</h2>
					<div className="flex gap-2">
						{!isEditMode ? (
							<>
								<button
									onClick={importYamlFile}
									className="text-[0.6rem] px-2 py-1 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120"
									title="Import YAML/JSON file"
								>
									📥 Import
								</button>
								<button
									onClick={toggleEditMode}
									className="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Edit YAML"
								>
									✏️ Edit
								</button>
								<button
									onClick={copyToClipboard}
									className="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Copy to clipboard"
								>
									📋 Copy
								</button>
								<button
									onClick={downloadYaml}
									className="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Download YAML"
								>
									💾 Save
								</button>
							</>
						) : (
							<>
								<button
									onClick={applyYamlChanges}
									className="text-[0.6rem] px-2 py-1 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120"
									title="Apply changes"
								>
									✓ Apply
								</button>
								<button
									onClick={cancelEdit}
									className="text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Cancel editing"
								>
									✕ Cancel
								</button>
							</>
						)}
					</div>
				</div>
				<p className="text-[0.6rem] text-sentinel-text-muted mt-1">
					{isEditMode ? 'Edit and apply to update canvas' : 'Auto-generated from canvas'}
				</p>
			</div>

			{/* YAML Content */}
			<div className="flex-1 overflow-y-auto p-4">
				{isEditMode ? (
					<>
						<textarea
							value={editedYaml}
							onChange={(e) => setEditedYaml(e.target.value)}
							className="w-full h-full text-[0.65rem] font-mono text-sentinel-text bg-sentinel-bg p-4 rounded-md border border-sentinel-border resize-none focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
							placeholder="Enter YAML here..."
						/>
						{errorMessage && (
							<div className="mt-2 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-[0.6rem] text-sentinel-error">
								{errorMessage}
							</div>
						)}
					</>
				) : (
					<>
						<pre className="text-[0.65rem] font-mono text-sentinel-text bg-sentinel-bg p-4 rounded-md border border-sentinel-border overflow-x-auto">
							{yaml}
						</pre>
						{errorMessage && (
							<div className="mt-2 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-[0.6rem] text-sentinel-error">
								{errorMessage}
							</div>
						)}
					</>
				)}
			</div>

			{/* Preview Footer */}
			<div className="p-3 border-t border-sentinel-border">
				<div className="text-[0.6rem] text-sentinel-text-muted">
					<div className="flex justify-between items-center">
						<span>{isEditMode ? 'Edit mode active' : 'Real-time sync enabled'}</span>
						<span className="text-sentinel-success">● {isEditMode ? 'Editing' : 'Live'}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default YamlPreview;
