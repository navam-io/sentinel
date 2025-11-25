import { useState, useCallback, useEffect } from 'react';
import { FilePlus, Save, FolderDown, ChevronDown, FileText } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTestStore } from '../../stores/testStore';
import { generateYAML, parseYAMLToNodes } from '../../lib/dsl/generator';
import { createTest, updateTest } from '../../services/api';
import { saveTestFile, updateTestFile } from '../../services/testFiles';
import type { TestSpec, CanvasState } from '../../services/api';
import type { TestCategory } from '../../types/test-spec';
import { getCategoryConfig, CATEGORY_CONFIG } from '../../lib/categoryConfig';

interface SaveDialogState {
	isOpen: boolean;
	mode: 'save' | 'saveAs';
	name: string;
	description: string;
	category: TestCategory | undefined;
}

/**
 * TestToolbar Component
 *
 * Unified toolbar for test management actions:
 * - New: Clear canvas and create a new test
 * - Save: Save current test (create if new, update if existing)
 * - Save As: Save current test as a new test
 *
 * Keyboard shortcuts:
 * - ⌘N / Ctrl+N: New test
 * - ⌘S / Ctrl+S: Save
 * - ⌘⇧S / Ctrl+Shift+S: Save As
 */
function TestToolbar() {
	const { nodes, edges, clearCanvas } = useCanvasStore();
	const { currentTest, updateMetadata, markClean, newTest, clearCurrentTest } = useTestStore();

	const [isSaving, setIsSaving] = useState(false);
	const [saveDialog, setSaveDialog] = useState<SaveDialogState>({
		isOpen: false,
		mode: 'save',
		name: '',
		description: '',
		category: undefined,
	});
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	// Generate YAML from current canvas
	const yaml = generateYAML(nodes, edges);

	// Format last saved time
	const formatLastSaved = (date: Date | null) => {
		if (!date) return null;
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		if (diff < 60000) return 'Just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	// Handle New Test
	const handleNew = useCallback(() => {
		if (nodes.length > 0 && currentTest?.isDirty) {
			const confirmed = window.confirm(
				'You have unsaved changes. Are you sure you want to create a new test?'
			);
			if (!confirmed) return;
		}

		clearCanvas();
		clearCurrentTest();
		newTest('Untitled Test', '');
	}, [nodes.length, currentTest?.isDirty, clearCanvas, clearCurrentTest, newTest]);

	// Open save dialog
	const openSaveDialog = useCallback(
		(mode: 'save' | 'saveAs') => {
			if (nodes.length === 0) {
				alert('Please add nodes to the canvas before saving');
				return;
			}

			// For save mode with existing test, save directly
			if (mode === 'save' && currentTest?.id && !currentTest.isDirty) {
				// Nothing to save
				return;
			}

			// For save mode with existing test that has changes, save directly
			if (mode === 'save' && currentTest?.id) {
				handleSave(currentTest.name, currentTest.description, currentTest.category ?? undefined);
				return;
			}

			// Otherwise, open dialog
			setSaveDialog({
				isOpen: true,
				mode,
				name: mode === 'saveAs' ? `${currentTest?.name || 'Untitled Test'} (copy)` : currentTest?.name || 'Untitled Test',
				description: currentTest?.description || '',
				category: currentTest?.category ?? undefined,
			});
			setErrorMessage('');
		},
		[nodes.length, currentTest]
	);

	// Handle Save/SaveAs
	const handleSave = useCallback(
		async (name: string, description: string, category: TestCategory | undefined) => {
			if (!name.trim()) {
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
				const canvasState: CanvasState = { nodes, edges };

				// Parse YAML to TestSpec
				const testSpec: TestSpec = JSON.parse(
					JSON.stringify(
						parsedNodes.reduce((acc: Record<string, unknown>, node) => {
							return { ...acc, ...(node.data as Record<string, unknown>) };
						}, {})
					)
				) as TestSpec;

				let savedId: number;
				let savedFilename: string | undefined;
				const isUpdate = saveDialog.mode === 'save' && currentTest?.id;

				// First, save to YAML file (artifacts/tests/)
				try {
					if (isUpdate && currentTest?.filename) {
						// Update existing file
						const fileResult = await updateTestFile(currentTest.filename, yaml);
						savedFilename = fileResult.filename;
					} else {
						// Create new file
						const fileResult = await saveTestFile(yaml, undefined, name.trim());
						savedFilename = fileResult.filename;
					}
				} catch (fileErr) {
					console.warn('Failed to save to file (backend may not be running):', fileErr);
					// Continue without file save - database save will still work
				}

				// Then save to database (for runs linkage and metadata)
				if (isUpdate && currentTest?.id) {
					// Update existing test
					await updateTest(currentTest.id, {
						name: name.trim(),
						description: description.trim() || undefined,
						category,
						spec: testSpec,
						spec_yaml: yaml,
						canvas_state: canvasState,
						filename: savedFilename,
					});
					savedId = currentTest.id;
				} else {
					// Create new test
					const response = await createTest({
						name: name.trim(),
						description: description.trim() || undefined,
						category,
						spec: testSpec,
						spec_yaml: yaml,
						canvas_state: canvasState,
						filename: savedFilename,
					});
					savedId = response.id;
				}

				// Update unified test store
				updateMetadata({
					name: name.trim(),
					description: description.trim(),
					category: category ?? null,
				});
				markClean({
					id: savedId,
					filename: savedFilename,
					lastSaved: new Date(),
				});

				setSaveDialog((prev) => ({ ...prev, isOpen: false }));
				setErrorMessage('');
			} catch (err) {
				setErrorMessage(`Failed to save test: ${err instanceof Error ? err.message : String(err)}`);
			} finally {
				setIsSaving(false);
			}
		},
		[yaml, nodes, edges, saveDialog.mode, currentTest, updateMetadata, markClean]
	);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Check for modifier key (Cmd on Mac, Ctrl on Windows/Linux)
			const modKey = e.metaKey || e.ctrlKey;

			if (modKey && e.key === 'n') {
				e.preventDefault();
				handleNew();
			} else if (modKey && e.shiftKey && e.key === 's') {
				e.preventDefault();
				openSaveDialog('saveAs');
			} else if (modKey && e.key === 's') {
				e.preventDefault();
				openSaveDialog('save');
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleNew, openSaveDialog]);

	// Handle Enter key in dialog
	const handleDialogKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && saveDialog.name.trim()) {
			handleSave(saveDialog.name, saveDialog.description, saveDialog.category);
		} else if (e.key === 'Escape') {
			setSaveDialog((prev) => ({ ...prev, isOpen: false }));
		}
	};

	// Get OS-specific modifier key symbol
	const modKey = navigator.platform.includes('Mac') ? '⌘' : 'Ctrl+';

	return (
		<div className="flex flex-col">
			{/* Toolbar */}
			<div className="flex items-center gap-2 px-4 py-2 border-b border-sentinel-border bg-sentinel-surface">
				{/* New Button */}
				<button
					onClick={handleNew}
					className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-sentinel-bg border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120"
					title={`New Test (${modKey}N)`}
					data-testid="toolbar-new"
				>
					<FilePlus size={14} strokeWidth={2} />
					<span>New</span>
				</button>

				{/* Save Button */}
				<button
					onClick={() => openSaveDialog('save')}
					disabled={isSaving || (currentTest?.id && !currentTest?.isDirty)}
					className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors duration-120 ${
						currentTest?.isDirty
							? 'bg-sentinel-primary text-white hover:bg-sentinel-primary-dark'
							: 'bg-sentinel-bg border border-sentinel-border hover:bg-sentinel-hover'
					} disabled:opacity-50 disabled:cursor-not-allowed`}
					title={`Save (${modKey}S)`}
					data-testid="toolbar-save"
				>
					<Save size={14} strokeWidth={2} />
					<span>{isSaving ? 'Saving...' : 'Save'}</span>
				</button>

				{/* Save As Button */}
				<button
					onClick={() => openSaveDialog('saveAs')}
					disabled={isSaving || nodes.length === 0}
					className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-sentinel-bg border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
					title={`Save As (${modKey}⇧S)`}
					data-testid="toolbar-save-as"
				>
					<FolderDown size={14} strokeWidth={2} />
					<span>Save As</span>
				</button>

				{/* Spacer */}
				<div className="flex-1" />

				{/* Status Indicator */}
				<div className="text-xs text-sentinel-text-muted">
					{currentTest?.isDirty ? (
						<span className="text-sentinel-warning">● Unsaved</span>
					) : currentTest?.lastSaved ? (
						<span className="text-sentinel-success">✓ Saved {formatLastSaved(currentTest.lastSaved)}</span>
					) : currentTest?.isTemplate ? (
						<span className="text-sentinel-primary">Template</span>
					) : null}
				</div>
			</div>

			{/* Save Dialog Overlay */}
			{saveDialog.isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div
						className="w-96 bg-sentinel-surface border border-sentinel-border rounded-lg shadow-xl"
						onKeyDown={handleDialogKeyDown}
					>
						{/* Dialog Header */}
						<div className="px-4 py-3 border-b border-sentinel-border">
							<h3 className="text-sm font-semibold text-sentinel-text">
								{saveDialog.mode === 'saveAs' ? 'Save Test As' : 'Save Test'}
							</h3>
						</div>

						{/* Dialog Content */}
						<div className="p-4 space-y-4">
							{/* Name Input */}
							<div>
								<label className="text-xs text-sentinel-text-muted mb-1.5 block">
									Test Name *
								</label>
								<input
									type="text"
									value={saveDialog.name}
									onChange={(e) => setSaveDialog((prev) => ({ ...prev, name: e.target.value }))}
									className="w-full px-3 py-2 bg-sentinel-bg border border-sentinel-border rounded text-sentinel-text text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
									placeholder="e.g., Multi-city Test"
									autoFocus
								/>
							</div>

							{/* Description Input */}
							<div>
								<label className="text-xs text-sentinel-text-muted mb-1.5 block">
									Description (optional)
								</label>
								<textarea
									value={saveDialog.description}
									onChange={(e) => setSaveDialog((prev) => ({ ...prev, description: e.target.value }))}
									rows={2}
									className="w-full px-3 py-2 bg-sentinel-bg border border-sentinel-border rounded text-sentinel-text text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-primary resize-none"
									placeholder="Describe what this test does..."
								/>
							</div>

							{/* Category Dropdown */}
							<div>
								<label className="text-xs text-sentinel-text-muted mb-1.5 block">
									Category
								</label>
								<div className="relative">
									<button
										onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
										className="w-full flex items-center justify-between px-3 py-2 bg-sentinel-bg border border-sentinel-border rounded text-sentinel-text text-sm hover:bg-sentinel-hover transition-colors focus:outline-none focus:ring-2 focus:ring-sentinel-primary"
										type="button"
									>
										<span>{getCategoryConfig(saveDialog.category).label}</span>
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
															setSaveDialog((prev) => ({ ...prev, category: undefined }));
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
																setSaveDialog((prev) => ({ ...prev, category: cat }));
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

							{/* Error Message */}
							{errorMessage && (
								<div className="p-2 bg-sentinel-error/20 border border-sentinel-error rounded text-xs text-sentinel-error">
									{errorMessage}
								</div>
							)}
						</div>

						{/* Dialog Footer */}
						<div className="px-4 py-3 border-t border-sentinel-border flex justify-end gap-2">
							<button
								onClick={() => setSaveDialog((prev) => ({ ...prev, isOpen: false }))}
								className="px-3 py-1.5 text-xs bg-sentinel-bg border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors"
								disabled={isSaving}
							>
								Cancel
							</button>
							<button
								onClick={() => handleSave(saveDialog.name, saveDialog.description, saveDialog.category)}
								disabled={isSaving || !saveDialog.name.trim()}
								className="px-3 py-1.5 text-xs bg-sentinel-primary text-white rounded hover:bg-sentinel-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSaving ? 'Saving...' : saveDialog.mode === 'saveAs' ? 'Save As' : 'Save'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default TestToolbar;
