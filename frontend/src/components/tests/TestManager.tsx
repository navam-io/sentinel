import { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, RefreshCw } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useAutoSave } from '../../hooks/useAutoSave';
import { listTests, deleteTest, getTest, type TestDefinition } from '../../services/api';
import { parseYAMLToNodes } from '../../lib/dsl/generator';

function TestManager() {
	const { setNodes, setEdges } = useCanvasStore();

	const [testName, setTestName] = useState('Untitled Test');
	const [description, setDescription] = useState('');
	const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

	const [tests, setTests] = useState<TestDefinition[]>([]);
	const [isLoadingTests, setIsLoadingTests] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

	const { isSaving, lastSaved, error, testId, saveNow, setTestId } = useAutoSave({
		testName,
		description,
		enabled: autoSaveEnabled,
		delay: 3000, // 3 seconds
	});

	// Load tests on mount
	useEffect(() => {
		loadTests();
	}, []);

	const loadTests = async () => {
		setIsLoadingTests(true);
		try {
			const response = await listTests(100, 0);
			setTests(response.tests);
		} catch (err) {
			console.error('Failed to load tests:', err);
		} finally {
			setIsLoadingTests(false);
		}
	};

	const handleLoadTest = async (id: number) => {
		try {
			const test = await getTest(id);

			// Load canvas state if available
			if (test.canvas_state && test.canvas_state.nodes && test.canvas_state.edges) {
				setNodes(test.canvas_state.nodes);
				setEdges(test.canvas_state.edges);
			} else if (test.spec_yaml) {
				// Fallback to YAML import if no canvas state
				const { nodes, edges } = parseYAMLToNodes(test.spec_yaml);
				setNodes(nodes);
				setEdges(edges);
			}

			// Update current test info
			setTestName(test.name);
			setDescription(test.description || '');
			setTestId(id);
		} catch (err) {
			console.error('Failed to load test:', err);
		}
	};

	const handleDeleteTest = async (id: number) => {
		try {
			await deleteTest(id);
			setTests(tests.filter((t) => t.id !== id));
			setDeleteConfirm(null);

			// If we deleted the current test, reset
			if (testId === id) {
				setTestId(null);
				setTestName('Untitled Test');
				setDescription('');
			}
		} catch (err) {
			console.error('Failed to delete test:', err);
		}
	};

	const handleSaveAsNew = async () => {
		// Reset test ID to force creation of new test
		setTestId(null);
		await saveNow();
		await loadTests();
	};

	return (
		<div className="w-80 bg-sentinel-bg-elevated border-l border-sentinel-border flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b border-sentinel-border">
				<h2 className="text-sm font-semibold text-sentinel-text mb-3">Test Manager</h2>

				{/* Test Name */}
				<div className="mb-3">
					<label className="text-[0.65rem] text-sentinel-text-muted mb-1 block">
						Test Name
					</label>
					<input
						type="text"
						value={testName}
						onChange={(e) => setTestName(e.target.value)}
						className="w-full px-2 py-1.5 text-xs bg-sentinel-surface border border-sentinel-border rounded text-sentinel-text focus:outline-none focus:ring-1 focus:ring-sentinel-primary"
						placeholder="Enter test name"
					/>
				</div>

				{/* Description */}
				<div className="mb-3">
					<label className="text-[0.65rem] text-sentinel-text-muted mb-1 block">
						Description (optional)
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
						className="w-full px-2 py-1.5 text-xs bg-sentinel-surface border border-sentinel-border rounded text-sentinel-text focus:outline-none focus:ring-1 focus:ring-sentinel-primary resize-none"
						placeholder="Add description"
					/>
				</div>

				{/* Auto-save Toggle */}
				<div className="mb-3 flex items-center justify-between">
					<span className="text-xs text-sentinel-text">Auto-save</span>
					<button
						onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
						className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
							autoSaveEnabled ? 'bg-sentinel-primary' : 'bg-sentinel-border'
						}`}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								autoSaveEnabled ? 'translate-x-5' : 'translate-x-1'
							}`}
						/>
					</button>
				</div>

				{/* Save Status */}
				{autoSaveEnabled && (
					<div className="mb-3 text-xs">
						{isSaving && (
							<span className="text-sentinel-text-muted">Saving...</span>
						)}
						{!isSaving && lastSaved && (
							<span className="text-sentinel-success">
								Saved {lastSaved.toLocaleTimeString()}
							</span>
						)}
						{error && <span className="text-sentinel-error">{error}</span>}
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-2">
					<button
						onClick={saveNow}
						disabled={isSaving}
						className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Save size={14} strokeWidth={2} />
						<span className="text-xs font-medium">
							{testId ? 'Save' : 'Save New'}
						</span>
					</button>

					{testId && (
						<button
							onClick={handleSaveAsNew}
							disabled={isSaving}
							className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sentinel-surface text-sentinel-text border border-sentinel-border rounded hover:bg-sentinel-bg transition-colors duration-120"
						>
							<span className="text-xs font-medium">Save As</span>
						</button>
					)}
				</div>

				{testId && (
					<div className="mt-2 text-[0.65rem] text-sentinel-text-muted">
						Test ID: {testId}
					</div>
				)}
			</div>

			{/* Saved Tests List */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-xs font-semibold text-sentinel-text">Saved Tests</h3>
					<button
						onClick={loadTests}
						disabled={isLoadingTests}
						className="p-1 text-sentinel-text-muted hover:text-sentinel-text transition-colors"
					>
						<RefreshCw
							size={14}
							className={isLoadingTests ? 'animate-spin' : ''}
						/>
					</button>
				</div>

				{isLoadingTests && (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sentinel-primary mb-2"></div>
						<p className="text-xs text-sentinel-text-muted">Loading tests...</p>
					</div>
				)}

				{!isLoadingTests && tests.length === 0 && (
					<div className="text-center py-8">
						<FolderOpen size={32} className="text-sentinel-text-muted mx-auto mb-2 opacity-30" />
						<p className="text-xs text-sentinel-text-muted">No saved tests</p>
					</div>
				)}

				{!isLoadingTests && tests.length > 0 && (
					<div className="space-y-2">
						{tests.map((test) => (
							<div
								key={test.id}
								className={`p-3 rounded border transition-all ${
									testId === test.id
										? 'border-sentinel-primary bg-sentinel-primary bg-opacity-10'
										: 'border-sentinel-border bg-sentinel-surface hover:border-sentinel-primary'
								}`}
							>
								<div className="flex items-start justify-between gap-2">
									<button
										onClick={() => handleLoadTest(test.id)}
										className="flex-1 text-left"
									>
										<p className="text-xs font-semibold text-sentinel-text mb-1">
											{test.name}
										</p>
										{test.description && (
											<p className="text-[0.65rem] text-sentinel-text-muted line-clamp-2">
												{test.description}
											</p>
										)}
										<div className="flex items-center gap-2 mt-2">
											<span className="text-[0.6rem] text-sentinel-text-muted">
												{test.model || 'No model'}
											</span>
											<span className="text-[0.6rem] text-sentinel-text-muted">
												•
											</span>
											<span className="text-[0.6rem] text-sentinel-text-muted">
												v{test.version}
											</span>
										</div>
									</button>

									<button
										onClick={() => setDeleteConfirm(test.id)}
										className="p-1 text-sentinel-text-muted hover:text-sentinel-error transition-colors"
									>
										<Trash2 size={14} />
									</button>
								</div>

								{/* Delete Confirmation */}
								{deleteConfirm === test.id && (
									<div className="mt-2 pt-2 border-t border-sentinel-border">
										<p className="text-[0.65rem] text-sentinel-text mb-2">
											Delete this test?
										</p>
										<div className="flex gap-2">
											<button
												onClick={() => handleDeleteTest(test.id)}
												className="flex-1 px-2 py-1 text-xs bg-sentinel-error text-white rounded hover:opacity-90"
											>
												Delete
											</button>
											<button
												onClick={() => setDeleteConfirm(null)}
												className="flex-1 px-2 py-1 text-xs bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-bg"
											>
												Cancel
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default TestManager;
