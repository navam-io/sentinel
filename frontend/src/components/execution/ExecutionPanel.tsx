import { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, DollarSign, Zap } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvasStore';
import { generateYAML, convertYAMLToTestSpec } from '../../lib/dsl/generator';
import { executeTest, type ExecutionResult } from '../../services/api';

function ExecutionPanel() {
	const { nodes, edges } = useCanvasStore();
	const [isExecuting, setIsExecuting] = useState(false);
	const [result, setResult] = useState<ExecutionResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleRun = async () => {
		setIsExecuting(true);
		setError(null);
		setResult(null);

		try {
			// Generate YAML from canvas
			const yaml = generateYAML(nodes, edges);

			// Convert YAML to TestSpec
			const testSpec = convertYAMLToTestSpec(yaml);

			// Execute the test
			const executionResult = await executeTest(testSpec);

			setResult(executionResult);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Execution failed');
		} finally {
			setIsExecuting(false);
		}
	};

	return (
		<div className="w-80 bg-sentinel-bg-elevated border-l border-sentinel-border flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b border-sentinel-border">
				<h2 className="text-sm font-semibold text-sentinel-text mb-2">Test Execution</h2>
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
			<div className="flex-1 overflow-y-auto p-4">
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
		</div>
	);
}

export default ExecutionPanel;
