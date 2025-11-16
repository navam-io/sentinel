import { useState, useMemo } from 'react';
import { Download, Upload, Edit3, Copy, Check, X, Play, CheckCircle2, XCircle, Clock, DollarSign, Zap } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { generateYAML, parseYAMLToNodes, convertYAMLToTestSpec } from '../../lib/dsl/generator';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { executeTest, type ExecutionResult } from '../../services/api';
import MonacoYamlEditor from './MonacoYamlEditor';

function YamlPreview() {
	const { nodes, edges, setNodes, setEdges } = useCanvasStore();
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedYaml, setEditedYaml] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// Execution state
	const [isExecuting, setIsExecuting] = useState(false);
	const [result, setResult] = useState<ExecutionResult | null>(null);
	const [executionError, setExecutionError] = useState<string | null>(null);

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

	const handleRun = async () => {
		setIsExecuting(true);
		setExecutionError(null);
		setResult(null);

		try {
			// Generate YAML from canvas
			const currentYaml = generateYAML(nodes, edges);

			// Convert YAML to TestSpec
			const testSpec = convertYAMLToTestSpec(currentYaml);

			// Execute the test
			const executionResult = await executeTest(testSpec);

			setResult(executionResult);
		} catch (err) {
			setExecutionError(err instanceof Error ? err.message : 'Execution failed');
		} finally {
			setIsExecuting(false);
		}
	};

	return (
		<div className="w-96 bg-sentinel-bg-elevated border-l border-sentinel-border flex flex-col">
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
									title="Download YAML"
									aria-label="Download YAML file"
								>
									<Download size={12} strokeWidth={2} />
									Save
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

			{/* Execution Section */}
			<div className="border-t border-sentinel-border">
				{/* Run Button */}
				<div className="p-4 border-b border-sentinel-border">
					<button
						onClick={handleRun}
						disabled={isExecuting || nodes.length === 0}
						className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Play size={16} strokeWidth={2} />
						<span className="text-sm font-medium">{isExecuting ? 'Running...' : 'Run Test'}</span>
					</button>
				</div>

				{/* Results */}
				<div className="max-h-96 overflow-y-auto p-4">
					{executionError && (
						<div className="mb-4 p-3 bg-sentinel-error bg-opacity-10 border border-sentinel-error rounded">
							<div className="flex items-start gap-2">
								<XCircle size={16} className="text-sentinel-error flex-shrink-0 mt-0.5" />
								<div className="flex-1">
									<p className="text-xs font-semibold text-sentinel-error">Error</p>
									<p className="text-xs text-sentinel-error mt-1">{executionError}</p>
								</div>
							</div>
						</div>
					)}

					{result && (
						<div className="space-y-4">
							{/* Status */}
							<div
								className={`p-3 rounded border ${
									result.success
										? 'bg-sentinel-success bg-opacity-10 border-sentinel-success'
										: 'bg-sentinel-error bg-opacity-10 border-sentinel-error'
								}`}
							>
								<div className="flex items-center gap-2">
									{result.success ? (
										<CheckCircle2 size={16} className="text-sentinel-success" />
									) : (
										<XCircle size={16} className="text-sentinel-error" />
									)}
									<span className="text-xs font-semibold">
										{result.success ? 'Success' : 'Failed'}
									</span>
								</div>
							</div>

							{/* Metrics */}
							<div className="grid grid-cols-2 gap-2">
								<div className="p-2 bg-sentinel-surface rounded border border-sentinel-border">
									<div className="flex items-center gap-1 mb-1">
										<Clock size={12} className="text-sentinel-text-muted" />
										<span className="text-[0.65rem] text-sentinel-text-muted">Latency</span>
									</div>
									<p className="text-xs font-semibold text-sentinel-text">
										{result.latency_ms}ms
									</p>
								</div>

								{result.cost_usd !== undefined && (
									<div className="p-2 bg-sentinel-surface rounded border border-sentinel-border">
										<div className="flex items-center gap-1 mb-1">
											<DollarSign size={12} className="text-sentinel-text-muted" />
											<span className="text-[0.65rem] text-sentinel-text-muted">Cost</span>
										</div>
										<p className="text-xs font-semibold text-sentinel-text">
											${result.cost_usd?.toFixed(6)}
										</p>
									</div>
								)}

								{result.tokens_input !== undefined && (
									<div className="p-2 bg-sentinel-surface rounded border border-sentinel-border">
										<div className="flex items-center gap-1 mb-1">
											<Zap size={12} className="text-sentinel-text-muted" />
											<span className="text-[0.65rem] text-sentinel-text-muted">Input</span>
										</div>
										<p className="text-xs font-semibold text-sentinel-text">
											{result.tokens_input} tokens
										</p>
									</div>
								)}

								{result.tokens_output !== undefined && (
									<div className="p-2 bg-sentinel-surface rounded border border-sentinel-border">
										<div className="flex items-center gap-1 mb-1">
											<Zap size={12} className="text-sentinel-text-muted" />
											<span className="text-[0.65rem] text-sentinel-text-muted">Output</span>
										</div>
										<p className="text-xs font-semibold text-sentinel-text">
											{result.tokens_output} tokens
										</p>
									</div>
								)}
							</div>

							{/* Output */}
							<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
								<p className="text-[0.65rem] text-sentinel-text-muted mb-2 font-semibold">
									Output
								</p>
								<div className="text-xs text-sentinel-text whitespace-pre-wrap font-mono">
									{result.output || result.error || 'No output'}
								</div>
							</div>

							{/* Tool Calls */}
							{result.tool_calls && result.tool_calls.length > 0 && (
								<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
									<p className="text-[0.65rem] text-sentinel-text-muted mb-2 font-semibold">
										Tool Calls ({result.tool_calls.length})
									</p>
									<div className="space-y-2">
										{result.tool_calls.map((call, idx) => (
											<div
												key={idx}
												className="p-2 bg-sentinel-bg rounded border border-sentinel-border"
											>
												<p className="text-xs font-semibold text-sentinel-text mb-1">
													{call.name}
												</p>
												<pre className="text-[0.6rem] text-sentinel-text-muted overflow-x-auto">
													{JSON.stringify(call.input, null, 2)}
												</pre>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Metadata */}
							<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
								<p className="text-[0.65rem] text-sentinel-text-muted mb-2 font-semibold">
									Metadata
								</p>
								<div className="space-y-1 text-xs">
									<div className="flex justify-between">
										<span className="text-sentinel-text-muted">Model:</span>
										<span className="text-sentinel-text font-mono">{result.model}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sentinel-text-muted">Provider:</span>
										<span className="text-sentinel-text">{result.provider}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sentinel-text-muted">Timestamp:</span>
										<span className="text-sentinel-text font-mono text-[0.6rem]">
											{new Date(result.timestamp).toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{!result && !executionError && !isExecuting && (
						<div className="text-center py-8">
							<Play size={48} className="text-sentinel-text-muted mx-auto mb-3 opacity-30" />
							<p className="text-xs text-sentinel-text-muted">
								Click "Run Test" to execute your test specification
							</p>
						</div>
					)}

					{isExecuting && (
						<div className="text-center py-8">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sentinel-primary mb-3"></div>
							<p className="text-xs text-sentinel-text-muted">Executing test...</p>
						</div>
					)}
				</div>
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
