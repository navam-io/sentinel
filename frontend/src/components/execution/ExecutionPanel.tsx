import { useState, useMemo } from 'react';
import { Play, CheckCircle2, XCircle, Clock, DollarSign, Zap, GitCompare } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTestStore } from '../../stores/testStore';
import { generateYAML, convertYAMLToTestSpec } from '../../lib/dsl/generator';
import { executeTest, type ExecuteResponse } from '../../services/api';
import ComparisonView from '../comparison/ComparisonView';

type ViewMode = 'run' | 'compare';

function ExecutionPanel() {
	const { nodes, edges } = useCanvasStore();
	const { currentTest } = useTestStore();
	const [isExecuting, setIsExecuting] = useState(false);
	const [response, setResponse] = useState<ExecuteResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('run');

	// Get test ID from unified test store (for comparison view)
	const testId = currentTest?.id ?? null;

	// Auto-generate test name if not saved
	const testName = useMemo(() => {
		if (currentTest) {
			return currentTest.name;
		}

		// Generate name based on canvas content
		const inputNode = nodes.find((n) => n.type === 'input');
		const modelNode = nodes.find((n) => n.type === 'model');

		if (inputNode && modelNode) {
			const model = (modelNode.data.model as string) || 'GPT-5.1';
			return `Test with ${model}`;
		} else if (nodes.length > 0) {
			return `Test - ${nodes.length} node${nodes.length > 1 ? 's' : ''}`;
		}

		return 'Untitled Test';
	}, [currentTest, nodes]);

	const handleRun = async () => {
		setIsExecuting(true);
		setError(null);
		setResponse(null);

		try {
			// Generate YAML from canvas
			const yaml = generateYAML(nodes, edges);

			// Convert YAML to TestSpec
			const testSpec = convertYAMLToTestSpec(yaml);

			// Execute the test
			const executeResponse = await executeTest(testSpec);

			setResponse(executeResponse);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Execution failed');
		} finally {
			setIsExecuting(false);
		}
	};

	const result = response?.result;

	return (
		<div className="h-full bg-sentinel-bg-elevated flex flex-col">
			{/* Header with Mode Toggle */}
			<div className="p-4 border-b border-sentinel-border space-y-3">
				{/* Mode Toggle */}
				<div className="flex gap-1 bg-sentinel-surface rounded p-1">
					<button
						onClick={() => setViewMode('run')}
						className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors duration-120 ${
							viewMode === 'run'
								? 'bg-sentinel-primary text-sentinel-bg'
								: 'text-sentinel-text-muted hover:text-sentinel-text'
						}`}
						data-testid="mode-run"
					>
						<Play size={12} />
						<span>Run</span>
					</button>
					<button
						onClick={() => setViewMode('compare')}
						className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors duration-120 ${
							viewMode === 'compare'
								? 'bg-sentinel-primary text-sentinel-bg'
								: 'text-sentinel-text-muted hover:text-sentinel-text'
						}`}
						data-testid="mode-compare"
					>
						<GitCompare size={12} />
						<span>Compare</span>
					</button>
				</div>

				{/* Run Button (only in run mode) */}
				{viewMode === 'run' && (
					<button
						onClick={handleRun}
						disabled={isExecuting || nodes.length === 0}
						className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sentinel-primary text-sentinel-bg rounded hover:bg-sentinel-primary-dark transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Play size={16} strokeWidth={2} />
						<span className="text-sm font-medium">{isExecuting ? 'Running...' : 'Run Test'}</span>
					</button>
				)}
			</div>

			{/* Results / Comparison View */}
			<div className="flex-1 overflow-y-auto">
				{viewMode === 'compare' ? (
					testId ? (
						<ComparisonView testId={testId} />
					) : (
						<div className="h-full flex items-center justify-center p-4">
							<div className="text-center">
								<GitCompare size={32} className="text-sentinel-text-muted mx-auto mb-3 opacity-30" />
								<p className="text-xs text-sentinel-text-muted">Save the test to enable comparison</p>
								<p className="text-[0.65rem] text-sentinel-text-muted mt-1">
									Run history comparison requires a saved test
								</p>
							</div>
						</div>
					)
				) : (
					<div className="p-4">
				{error && (
					<div className="mb-4 p-3 bg-sentinel-error bg-opacity-10 border border-sentinel-error rounded">
						<div className="flex items-start gap-2">
							<XCircle size={16} className="text-sentinel-error flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-xs font-semibold text-sentinel-error">Error</p>
								<p className="text-xs text-sentinel-error mt-1">{error}</p>
							</div>
						</div>
					</div>
				)}

				{result && (
					<div className="space-y-4">
						{/* Overall Test Status (Assertions First, then Execution) */}
						{response.assertions && response.assertions.length > 0 ? (
							<>
								{/* Assertion Status - PRIMARY */}
								<div
									className={`p-3 rounded border ${
										response.all_assertions_passed
											? 'bg-sentinel-success bg-opacity-10 border-sentinel-success'
											: 'bg-sentinel-error bg-opacity-10 border-sentinel-error'
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											{response.all_assertions_passed ? (
												<CheckCircle2 size={16} className="text-sentinel-success" />
											) : (
												<XCircle size={16} className="text-white" />
											)}
											<span className="text-sm font-semibold text-white">
												{response.all_assertions_passed ? 'Test Passed' : 'Test Failed'}
											</span>
										</div>
										<span
											className={`text-xs font-semibold ${
												response.all_assertions_passed
													? 'text-sentinel-success opacity-80'
													: 'text-white opacity-90'
											}`}
										>
											{response.assertions.filter((a) => a.passed).length}/
											{response.assertions.length} assertions passed
										</span>
									</div>
								</div>

								{/* Execution Status - SECONDARY */}
								<div className="p-2 bg-sentinel-surface rounded border border-sentinel-border">
									<div className="flex items-center gap-2">
										{result.success ? (
											<CheckCircle2 size={12} className="text-sentinel-success" />
										) : (
											<XCircle size={12} className="text-sentinel-error" />
										)}
										<span className="text-[0.65rem] text-sentinel-text-muted">
											Model execution: {result.success ? 'Success' : 'Failed'}
										</span>
									</div>
								</div>
							</>
						) : (
							/* No assertions - show execution status only */
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
						)}

						{/* Assertion Results - MOVED TO TOP FOR VISIBILITY */}
						{response.assertions && response.assertions.length > 0 && (
							<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-sm text-sentinel-text font-semibold">
										Assertion Details ({response.assertions.length})
									</h3>
								</div>
								<div className="space-y-3">
									{response.assertions.map((assertion, idx) => (
										<div
											key={idx}
											className={`p-3 rounded border ${
												assertion.passed
													? 'bg-sentinel-success bg-opacity-5 border-sentinel-success border-opacity-30'
													: 'bg-sentinel-error bg-opacity-5 border-sentinel-error border-opacity-30'
											}`}
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-2">
														{assertion.passed ? (
															<CheckCircle2
																size={14}
																className="text-white flex-shrink-0"
															/>
														) : (
															<XCircle size={14} className="text-white flex-shrink-0" />
														)}
														<span
															className={`text-xs font-bold px-2 py-0.5 rounded ${
																assertion.passed
																	? 'text-white bg-sentinel-success bg-opacity-30'
																	: 'text-white bg-sentinel-error bg-opacity-30'
															}`}
														>
															{assertion.assertion_type.replace(/_/g, ' ')}
														</span>
													</div>
													<p
														className={`text-sm mb-1 ${
															assertion.passed
																? 'text-sentinel-text font-medium'
																: 'text-white font-medium'
														}`}
													>
														{assertion.message}
													</p>
													{!assertion.passed && (assertion.expected || assertion.actual) && (
														<div className="mt-2 text-xs space-y-1.5 bg-black bg-opacity-30 p-2.5 rounded">
															{assertion.expected !== undefined && (
																<div className="text-white">
																	<span className="font-semibold opacity-90">
																		Expected:{' '}
																	</span>
																	<span className="font-mono font-medium">
																		{typeof assertion.expected === 'string'
																			? assertion.expected
																			: JSON.stringify(assertion.expected)}
																	</span>
																</div>
															)}
															{assertion.actual !== undefined && (
																<div className="text-white">
																	<span className="font-semibold opacity-90">
																		Actual:{' '}
																	</span>
																	<span className="font-mono font-medium">
																		{typeof assertion.actual === 'string'
																			? assertion.actual.length > 60
																				? assertion.actual.substring(0, 60) + '...'
																				: assertion.actual
																			: JSON.stringify(assertion.actual)}
																	</span>
																</div>
															)}
														</div>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

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

				{!result && !error && !isExecuting && (
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
				)}
			</div>
		</div>
	);
}

export default ExecutionPanel;
