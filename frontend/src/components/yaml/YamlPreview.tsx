import { useState, useMemo } from 'react';
import { Download, Upload, Edit3, Copy, Check, X, Save } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { generateYAML, parseYAMLToNodes } from '../../lib/dsl/generator';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { createTest } from '../../services/api';
import type { TestSpec, CanvasState } from '../../services/api';
import MonacoYamlEditor from './MonacoYamlEditor';

function YamlPreview() {
	const { nodes, edges, setNodes, setEdges } = useCanvasStore();
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedYaml, setEditedYaml] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const [testName, setTestName] = useState('');
	const [testDescription, setTestDescription] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

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

	const openSaveDialog = () => {
		if (nodes.length === 0) {
			alert('Please add nodes to the canvas before saving');
			return;
		}
		setTestName('');
		setTestDescription('');
		setIsSaveDialogOpen(true);
		setSaveSuccess(false);
		setErrorMessage('');
	};

	const saveTestToBackend = async () => {
		if (!testName.trim()) {
			setErrorMessage('Please enter a test name');
			return;
		}

		setIsSaving(true);
		setErrorMessage('');

		try {
			// Parse YAML to get TestSpec
			const { nodes: parsedNodes } = parseYAMLToNodes(yaml);
			if (parsedNodes.length === 0) {
				setErrorMessage('Failed to parse YAML. Please check your test configuration.');
				setIsSaving(false);
				return;
			}

			// Create canvas state
			const canvasState: CanvasState = {
				nodes,
				edges,
			};

			// Parse YAML to TestSpec (this validates the YAML)
			const testSpec: TestSpec = JSON.parse(
				JSON.stringify(
					parsedNodes.reduce((acc: Record<string, unknown>, node) => {
						return { ...acc, ...(node.data as Record<string, unknown>) };
					}, {})
				)
			) as TestSpec;

			// Call API to create test
			await createTest({
				name: testName.trim(),
				description: testDescription.trim() || undefined,
				spec: testSpec,
				spec_yaml: yaml,
				canvas_state: canvasState,
			});

			// Show success
			setSaveSuccess(true);
			setTestName('');
			setTestDescription('');

			// Close dialog after brief delay
			setTimeout(() => {
				setIsSaveDialogOpen(false);
				setSaveSuccess(false);
			}, 1500);
		} catch (err) {
			setErrorMessage(`Failed to save test: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="h-full bg-sentinel-bg-elevated flex flex-col">
			{/* Preview Header */}
			<div className="p-4 border-b border-sentinel-border">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-sm font-semibold text-sentinel-text whitespace-nowrap">
						Test Script
					</h2>
					<p className="text-[0.6rem] text-sentinel-text-muted whitespace-nowrap">
						{isEditMode ? 'Edit and apply to update canvas' : 'Auto-generated from canvas'}
					</p>
				</div>
				<div className="flex items-center justify-end">
					<div className="flex gap-2">
						{!isEditMode ? (
							<>
								<button
									onClick={openSaveDialog}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-success text-white rounded hover:opacity-90 transition-opacity duration-120"
									title="Save test to backend"
									aria-label="Save test to backend"
								>
									<Save size={12} strokeWidth={2} />
									Save Test
								</button>
								<button
									onClick={importYamlFile}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120"
									title="Import YAML/JSON file"
									aria-label="Import YAML/JSON file"
								>
									<Upload size={12} strokeWidth={2} />
									Import
								</button>
								<button
									onClick={toggleEditMode}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Edit YAML"
									aria-label="Edit YAML"
								>
									<Edit3 size={12} strokeWidth={2} />
									Edit
								</button>
								<button
									onClick={copyToClipboard}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Copy to clipboard"
									aria-label="Copy YAML to clipboard"
								>
									<Copy size={12} strokeWidth={2} />
									Copy
								</button>
								<button
									onClick={downloadYaml}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Download YAML file"
									aria-label="Download YAML file"
								>
									<Download size={12} strokeWidth={2} />
									Download
								</button>
							</>
						) : (
							<>
								<button
									onClick={applyYamlChanges}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120"
									title="Apply changes"
									aria-label="Apply YAML changes"
								>
									<Check size={12} strokeWidth={2} />
									Apply
								</button>
								<button
									onClick={cancelEdit}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Cancel editing"
									aria-label="Cancel editing"
								>
									<X size={12} strokeWidth={2} />
									Cancel
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* YAML Content */}
			<div className="flex-1 overflow-hidden flex flex-col">
				{isEditMode ? (
					<>
						<div className="flex-1 overflow-hidden border border-sentinel-border rounded-md m-4">
							<MonacoYamlEditor
								value={editedYaml}
								onChange={setEditedYaml}
								readOnly={false}
								onError={setErrorMessage}
							/>
						</div>
						{errorMessage && (
							<div className="mx-4 mb-4 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-[0.6rem] text-sentinel-error">
								{errorMessage}
							</div>
						)}
					</>
				) : (
					<>
						<div className="flex-1 overflow-hidden border border-sentinel-border rounded-md m-4">
							<MonacoYamlEditor
								value={yaml}
								readOnly={true}
							/>
						</div>
						{errorMessage && (
							<div className="mx-4 mb-4 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-[0.6rem] text-sentinel-error">
								{errorMessage}
							</div>
						)}
					</>
				)}
			</div>

			{/* Save Test Dialog */}
			{isSaveDialogOpen && (
				<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-sentinel-bg-elevated border border-sentinel-border rounded-lg p-4 max-w-md w-full">
						<h3 className="text-sm font-semibold text-sentinel-text mb-3">Save Test</h3>

						{saveSuccess ? (
							<div className="p-4 text-center">
								<div className="text-sentinel-success mb-2">
									<Check size={32} className="mx-auto" />
								</div>
								<p className="text-sm text-sentinel-text">Test saved successfully!</p>
								<p className="text-xs text-sentinel-text-muted mt-1">
									Check the Tests tab to add it to a suite
								</p>
							</div>
						) : (
							<>
								<div className="mb-3">
									<label className="text-xs text-sentinel-text-muted mb-1 block">
										Test Name *
									</label>
									<input
										type="text"
										value={testName}
										onChange={(e) => setTestName(e.target.value)}
										className="w-full px-3 py-2 bg-sentinel-surface border border-sentinel-border rounded text-sentinel-text text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
										placeholder="e.g., Login Test"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === 'Enter' && testName.trim()) {
												saveTestToBackend();
											}
										}}
									/>
								</div>

								<div className="mb-4">
									<label className="text-xs text-sentinel-text-muted mb-1 block">
										Description (optional)
									</label>
									<textarea
										value={testDescription}
										onChange={(e) => setTestDescription(e.target.value)}
										rows={3}
										className="w-full px-3 py-2 bg-sentinel-surface border border-sentinel-border rounded text-sentinel-text text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-primary resize-none"
										placeholder="Describe what this test does..."
									/>
								</div>

								{errorMessage && (
									<div className="mb-3 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-xs text-sentinel-error">
										{errorMessage}
									</div>
								)}

								<div className="flex gap-2 justify-end">
									<button
										onClick={() => setIsSaveDialogOpen(false)}
										className="px-3 py-1.5 text-sm bg-sentinel-surface border border-sentinel-border rounded text-sentinel-text hover:bg-sentinel-hover transition-colors duration-120"
										disabled={isSaving}
									>
										Cancel
									</button>
									<button
										onClick={saveTestToBackend}
										disabled={isSaving || !testName.trim()}
										className="px-3 py-1.5 text-sm bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSaving ? 'Saving...' : 'Save Test'}
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}

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
