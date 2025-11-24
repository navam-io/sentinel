import { useState, useMemo, useCallback, useEffect } from 'react';
import { Download, Upload, Edit3, Copy, Check, X, Save, Edit2, ChevronDown } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTestStore } from '../../stores/testStore';
import { generateYAML, parseYAMLToNodes } from '../../lib/dsl/generator';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { createTest, updateTest } from '../../services/api';
import type { TestSpec, CanvasState } from '../../services/api';
import type { TestCategory } from '../../types/test-spec';
import { getCategoryConfig, CATEGORY_CONFIG } from '../../lib/categoryConfig';
import MonacoYamlEditor from './MonacoYamlEditor';

function YamlPreview() {
	const { nodes, edges, setNodes, setEdges } = useCanvasStore();
	const {
		currentTest,
		updateMetadata,
		markDirty,
		markClean,
		newTest,
	} = useTestStore();

	const [isEditMode, setIsEditMode] = useState(false);
	const [editedYaml, setEditedYaml] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isSaveMode, setIsSaveMode] = useState(false);
	const [testName, setTestName] = useState('');
	const [testDescription, setTestDescription] = useState('');
	const [testCategory, setTestCategory] = useState<TestCategory | undefined>(undefined);
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Generate YAML from current canvas state
	const yaml = useMemo(() => generateYAML(nodes, edges), [nodes, edges]);

	// Auto-generate test name and description if no test is loaded
	const displayTestInfo = useMemo(() => {
		if (currentTest) {
			return {
				name: currentTest.name,
				description: currentTest.description,
				isDirty: currentTest.isDirty,
				isTemplate: currentTest.isTemplate,
				lastSaved: currentTest.lastSaved,
			};
		}

		// Parse YAML to extract name or generate one
		try {
			const yamlObj = parseYAMLToNodes(yaml);
			const nameFromYaml = yamlObj.nodes.find((n) => n.data.name)?.data.name as string | undefined;

			// Generate a unique name based on canvas content
			const inputNode = nodes.find((n) => n.type === 'input');
			const modelNode = nodes.find((n) => n.type === 'model');

			let autoName = 'Untitled Test';
			let autoDescription = 'Auto-generated test from canvas';

			if (nameFromYaml && nameFromYaml !== 'Test from Canvas') {
				autoName = nameFromYaml;
			} else if (inputNode && modelNode) {
				const model = (modelNode.data.model as string) || 'GPT-5.1';
				autoName = `Test with ${model}`;
				const query = (inputNode.data.query as string) || '';
				if (query) {
					const truncatedQuery = query.length > 50 ? query.slice(0, 50) + '...' : query;
					autoDescription = truncatedQuery;
				}
			} else if (nodes.length > 0) {
				autoName = `Test - ${nodes.length} node${nodes.length > 1 ? 's' : ''}`;
			}

			return {
				name: autoName,
				description: autoDescription,
				isDirty: false,
				isTemplate: false,
				lastSaved: null,
			};
		} catch {
			return {
				name: 'Untitled Test',
				description: 'Auto-generated test from canvas',
				isDirty: false,
				isTemplate: false,
				lastSaved: null,
			};
		}
	}, [currentTest, yaml, nodes]);

	// Initialize test store if no current test but canvas has nodes
	useEffect(() => {
		if (!currentTest && nodes.length > 0) {
			newTest(displayTestInfo.name, displayTestInfo.description);
		}
	}, [currentTest, nodes.length, displayTestInfo.name, displayTestInfo.description, newTest]);

	const toggleEditMode = () => {
		if (!isEditMode) {
			// Entering edit mode - copy current YAML to editor
			setEditedYaml(yaml);
			setErrorMessage('');
		}
		setIsEditMode(!isEditMode);
	};

	const applyYamlChanges = useCallback(() => {
		try {
			// Parse the edited YAML
			const { nodes: parsedNodes, edges: parsedEdges } = parseYAMLToNodes(editedYaml);

			if (parsedNodes.length === 0) {
				setErrorMessage('Failed to parse YAML. Please check syntax.');
				return;
			}

			// Confirm if there are existing nodes that will be replaced
			if (nodes.length > 0 && parsedNodes.length > 0) {
				const confirmed = window.confirm(
					`Applying YAML changes will replace the current canvas (${nodes.length} nodes). Continue?`
				);
				if (!confirmed) {
					return;
				}
			}

			// CRITICAL FIX: Explicitly clear canvas first, then load new content
			// Step 1: Clear everything
			setNodes([]);
			setEdges([]);

			// Step 2: Use requestAnimationFrame to ensure clear is processed
			requestAnimationFrame(() => {
				// Now set the new nodes and edges
				setNodes(parsedNodes);
				setEdges(parsedEdges);

				// Mark as dirty since canvas changed
				markDirty();

				// Exit edit mode
				setIsEditMode(false);
				setErrorMessage('');
			});
		} catch (err) {
			setErrorMessage(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
		}
	}, [editedYaml, nodes.length, setNodes, setEdges, markDirty]);

	const cancelEdit = () => {
		setIsEditMode(false);
		setErrorMessage('');
	};

	const copyToClipboard = async () => {
		try {
			await writeText(yaml);
			alert('YAML copied to clipboard!');
		} catch {
			// Fallback for browser mode
			await navigator.clipboard.writeText(yaml);
		}
	};

	const downloadYaml = () => {
		const blob = new Blob([yaml], { type: 'text/yaml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const filename = currentTest?.filename || `${displayTestInfo.name.toLowerCase().replace(/\s+/g, '-')}.yaml`;
		a.download = filename;
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

				// Confirm if there are existing nodes that will be replaced
				if (nodes.length > 0) {
					const confirmed = window.confirm(
						`Importing ${file.name} will replace the current canvas (${nodes.length} nodes). Continue?`
					);
					if (!confirmed) {
						return;
					}
				}

				// CRITICAL FIX: Explicitly clear canvas first, then load new content
				// Step 1: Clear everything
				setNodes([]);
				setEdges([]);

				// Step 2: Use requestAnimationFrame to ensure clear is processed
				requestAnimationFrame(() => {
					// Now set the new nodes and edges
					setNodes(parsedNodes);
					setEdges(parsedEdges);

					// Create new test from imported file
					const baseName = file.name.replace(/\.(yaml|yml|json)$/, '').replace(/-/g, ' ');
					const capitalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
					newTest(capitalizedName, `Imported from ${file.name}`);
					markDirty();

					// Show success message
					alert(`Successfully imported ${file.name}!`);
					setErrorMessage('');
				});
			} catch (err) {
				setErrorMessage(`Import error: ${err instanceof Error ? err.message : String(err)}`);
			}
		};

		input.click();
	};

	const openSaveForm = () => {
		if (nodes.length === 0) {
			alert('Please add nodes to the canvas before saving');
			return;
		}
		// Populate with current test info or auto-generated values
		setTestName(currentTest?.name || displayTestInfo.name);
		setTestDescription(currentTest?.description || displayTestInfo.description);
		setTestCategory(currentTest?.category ?? undefined);
		setIsSaveMode(true);
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

			let savedId: number;

			// Check if we should update an existing test or create a new one
			if (currentTest?.id) {
				// Update existing test
				await updateTest(currentTest.id, {
					name: testName.trim(),
					description: testDescription.trim() || undefined,
					category: testCategory,
					spec: testSpec,
					spec_yaml: yaml,
					canvas_state: canvasState,
				});
				savedId = currentTest.id;
			} else {
				// Create new test
				const response = await createTest({
					name: testName.trim(),
					description: testDescription.trim() || undefined,
					category: testCategory,
					spec: testSpec,
					spec_yaml: yaml,
					canvas_state: canvasState,
				});
				savedId = response.id;
			}

			// Update unified test store
			updateMetadata({
				name: testName.trim(),
				description: testDescription.trim(),
				category: testCategory ?? null,
			});
			markClean({
				id: savedId,
				lastSaved: new Date(),
			});

			setIsSaveMode(false);
			setErrorMessage('');
		} catch (err) {
			setErrorMessage(`Failed to save test: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setIsSaving(false);
		}
	};

	const cancelSave = () => {
		setIsSaveMode(false);
		setErrorMessage('');
	};

	// Format last saved time
	const formatLastSaved = (date: Date | null) => {
		if (!date) return null;
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		if (diff < 60000) return 'Just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
						{displayTestInfo.isDirty ? (
							<span className="text-sentinel-warning">● Unsaved changes</span>
						) : displayTestInfo.lastSaved ? (
							<span className="text-sentinel-success">✓ Saved {formatLastSaved(displayTestInfo.lastSaved)}</span>
						) : isEditMode ? (
							'Edit and apply to update canvas'
						) : (
							'Auto-generated from canvas'
						)}
					</p>
				</div>
				<div className="flex items-center">
					<div className="flex gap-2">
						{!isEditMode ? (
							<>
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
									onClick={importYamlFile}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Import YAML/JSON file"
									aria-label="Import YAML/JSON file"
								>
									<Upload size={12} strokeWidth={2} />
									Import
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
				{/* Test Info Display (always shown) */}
				{!isSaveMode && (
					<div className={`mx-4 mt-4 p-3 rounded-md ${
						currentTest?.id
							? 'bg-sentinel-surface border border-sentinel-border'
							: 'bg-sentinel-bg border border-dashed border-sentinel-border'
					}`}>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="mb-1">
									<h3 className="text-sm font-semibold text-sentinel-text inline-flex items-center gap-2">
										{displayTestInfo.isDirty && (
											<span className="text-sentinel-warning text-xs" title="Unsaved changes">●</span>
										)}
										{displayTestInfo.name}
										{displayTestInfo.isTemplate && (
											<span className="text-xs px-1.5 py-0.5 bg-sentinel-primary/20 text-sentinel-primary rounded">
												Template
											</span>
										)}
										{currentTest?.id && (
											<button
												onClick={openSaveForm}
												className="ml-1 p-1 hover:bg-sentinel-hover rounded transition-colors duration-120 inline-flex"
												title="Edit test info"
												aria-label="Edit test info"
											>
												<Edit2 size={12} className="text-sentinel-text-muted" />
											</button>
										)}
									</h3>
								</div>
								{displayTestInfo.description && (
									<p className={`text-xs ${currentTest?.id ? 'text-sentinel-text-muted' : 'text-sentinel-text-muted italic'}`}>
										{displayTestInfo.description}
									</p>
								)}
							</div>
							{!currentTest?.id && !displayTestInfo.isTemplate && (
								<button
									onClick={openSaveForm}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
									title="Save test"
									aria-label="Save test"
								>
									<Save size={12} strokeWidth={2} />
									Save
								</button>
							)}
							{currentTest?.id && displayTestInfo.isDirty && (
								<button
									onClick={openSaveForm}
									className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120"
									title="Save changes"
									aria-label="Save changes"
								>
									<Save size={12} strokeWidth={2} />
									Save
								</button>
							)}
						</div>
					</div>
				)}

				{/* Inline Save Form */}
				{isSaveMode && (
					<div className="mx-4 mt-4 p-3 bg-sentinel-surface border border-sentinel-border rounded-md">
						<h3 className="text-sm font-semibold text-sentinel-text mb-3">
							{currentTest?.id ? 'Update Test' : 'Save Test'}
						</h3>
						<div className="mb-3">
							<label className="text-xs text-sentinel-text-muted mb-1 block">
								Test Name *
							</label>
							<input
								type="text"
								value={testName}
								onChange={(e) => setTestName(e.target.value)}
								className="w-full px-3 py-2 bg-sentinel-bg border border-sentinel-border rounded text-sentinel-text text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
								placeholder="e.g., Login Test"
								autoFocus
								onKeyDown={(e) => {
									if (e.key === 'Enter' && testName.trim()) {
										saveTestToBackend();
									} else if (e.key === 'Escape') {
										cancelSave();
									}
								}}
							/>
						</div>
						<div className="mb-3">
							<label className="text-xs text-sentinel-text-muted mb-1 block">
								Description (optional)
							</label>
							<textarea
								value={testDescription}
								onChange={(e) => setTestDescription(e.target.value)}
								rows={2}
								className="w-full px-3 py-2 bg-sentinel-bg border border-sentinel-border rounded text-sentinel-text text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-primary resize-none"
								placeholder="Describe what this test does..."
							/>
						</div>
						<div className="mb-3">
							<label className="text-xs text-sentinel-text-muted mb-1 block">
								Category
							</label>
							<div className="relative">
								<button
									onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
									className="w-full flex items-center justify-between px-3 py-2 bg-sentinel-bg border border-sentinel-border rounded text-sentinel-text text-sm hover:bg-sentinel-hover transition-colors focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
									type="button"
								>
									<span>{getCategoryConfig(testCategory).label}</span>
									<ChevronDown className="w-4 h-4" />
								</button>

								{categoryDropdownOpen && (
									<>
										<div
											className="fixed inset-0 z-10"
											onClick={() => setCategoryDropdownOpen(false)}
										/>
										<div className="absolute left-0 top-full mt-1 w-full bg-sentinel-surface border border-sentinel-border rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
											<div className="py-1">
												{/* Uncategorized option */}
												<button
													onClick={() => {
														setTestCategory(undefined);
														setCategoryDropdownOpen(false);
													}}
													className="w-full text-left px-3 py-2 text-sm text-sentinel-text hover:bg-sentinel-hover transition-colors"
													type="button"
												>
													Uncategorized
												</button>
												{/* All categories */}
												{(Object.keys(CATEGORY_CONFIG) as TestCategory[]).map((cat) => (
													<button
														key={cat}
														onClick={() => {
															setTestCategory(cat);
															setCategoryDropdownOpen(false);
														}}
														className="w-full text-left px-3 py-2 text-sm text-sentinel-text hover:bg-sentinel-hover transition-colors"
														type="button"
													>
														{CATEGORY_CONFIG[cat].label}
													</button>
												))}
											</div>
										</div>
									</>
								)}
							</div>
						</div>
						{errorMessage && (
							<div className="mb-3 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-xs text-sentinel-error">
								{errorMessage}
							</div>
						)}
						<div className="flex gap-2 justify-end">
							<button
								onClick={cancelSave}
								className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
								disabled={isSaving}
							>
								<X size={12} strokeWidth={2} />
								Cancel
							</button>
							<button
								onClick={saveTestToBackend}
								disabled={isSaving || !testName.trim()}
								className="flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Save size={12} strokeWidth={2} />
								{isSaving ? 'Saving...' : currentTest?.id ? 'Update' : 'Save'}
							</button>
						</div>
					</div>
				)}

				{/* YAML Editor */}
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
						{errorMessage && !isSaveMode && (
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
						{errorMessage && !isSaveMode && (
							<div className="mx-4 mb-4 p-2 bg-sentinel-error bg-opacity-20 border border-sentinel-error rounded text-[0.6rem] text-sentinel-error">
								{errorMessage}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default YamlPreview;
