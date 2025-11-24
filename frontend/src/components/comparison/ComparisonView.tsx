import { useState, useEffect } from 'react';
import {
	GitCompare,
	AlertTriangle,
	AlertCircle,
	CheckCircle2,
	ArrowRight,
	RefreshCw,
	Info,
} from 'lucide-react';
import type {
	TestRun,
	ComparisonResult,
	RegressionSeverity,
} from '../../types/test-spec';
import { compareRuns, listRunsForTest } from '../../services/api';
import MetricDeltaCard from './MetricDeltaCard';
import RunSelector from './RunSelector';

interface ComparisonViewProps {
	testId: number;
}

const severityConfig: Record<
	RegressionSeverity,
	{
		bgClass: string;
		borderClass: string;
		textClass: string;
		icon: React.ComponentType<{ size: number; className?: string }>;
		label: string;
	}
> = {
	critical: {
		bgClass: 'bg-sentinel-error bg-opacity-10',
		borderClass: 'border-sentinel-error',
		textClass: 'text-sentinel-error',
		icon: AlertCircle,
		label: 'Critical Regression',
	},
	warning: {
		bgClass: 'bg-amber-500 bg-opacity-10',
		borderClass: 'border-amber-500',
		textClass: 'text-amber-500',
		icon: AlertTriangle,
		label: 'Performance Warning',
	},
	info: {
		bgClass: 'bg-sentinel-surface',
		borderClass: 'border-sentinel-border',
		textClass: 'text-sentinel-text-muted',
		icon: Info,
		label: 'No Significant Changes',
	},
	improvement: {
		bgClass: 'bg-sentinel-success bg-opacity-10',
		borderClass: 'border-sentinel-success',
		textClass: 'text-sentinel-success',
		icon: CheckCircle2,
		label: 'Performance Improved',
	},
};

function ComparisonView({ testId }: ComparisonViewProps) {
	const [runs, setRuns] = useState<TestRun[]>([]);
	const [baselineRun, setBaselineRun] = useState<TestRun | null>(null);
	const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
	const [comparison, setComparison] = useState<ComparisonResult | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingRuns, setIsLoadingRuns] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load runs for the test
	useEffect(() => {
		async function loadRuns() {
			setIsLoadingRuns(true);
			try {
				const response = await listRunsForTest(testId);
				setRuns(response.runs);

				// Auto-select first two runs if available
				if (response.runs.length >= 2) {
					setBaselineRun(response.runs[1]); // Older run as baseline
					setCurrentRun(response.runs[0]); // Most recent as current
				} else if (response.runs.length === 1) {
					setCurrentRun(response.runs[0]);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load runs');
			} finally {
				setIsLoadingRuns(false);
			}
		}

		loadRuns();
	}, [testId]);

	// Load comparison when both runs are selected
	useEffect(() => {
		if (!baselineRun || !currentRun || baselineRun.id === currentRun.id) {
			setComparison(null);
			return;
		}

		async function loadComparison() {
			setIsLoading(true);
			setError(null);
			try {
				const result = await compareRuns(baselineRun!.id, currentRun!.id);
				setComparison(result);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to compare runs');
				setComparison(null);
			} finally {
				setIsLoading(false);
			}
		}

		loadComparison();
	}, [baselineRun, currentRun]);

	const handleSwapRuns = () => {
		const temp = baselineRun;
		setBaselineRun(currentRun);
		setCurrentRun(temp);
	};

	// Loading state
	if (isLoadingRuns) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<RefreshCw size={24} className="animate-spin text-sentinel-primary mx-auto mb-2" />
					<p className="text-xs text-sentinel-text-muted">Loading run history...</p>
				</div>
			</div>
		);
	}

	// No runs available
	if (runs.length === 0) {
		return (
			<div className="h-full flex items-center justify-center p-4">
				<div className="text-center">
					<GitCompare size={32} className="text-sentinel-text-muted mx-auto mb-3 opacity-30" />
					<p className="text-xs text-sentinel-text-muted">No runs available to compare</p>
					<p className="text-[0.65rem] text-sentinel-text-muted mt-1">
						Execute the test to create run history
					</p>
				</div>
			</div>
		);
	}

	// Not enough runs for comparison
	if (runs.length < 2) {
		return (
			<div className="h-full flex items-center justify-center p-4">
				<div className="text-center">
					<GitCompare size={32} className="text-sentinel-text-muted mx-auto mb-3 opacity-30" />
					<p className="text-xs text-sentinel-text-muted">Need at least 2 runs to compare</p>
					<p className="text-[0.65rem] text-sentinel-text-muted mt-1">
						Run the test again to enable comparison
					</p>
				</div>
			</div>
		);
	}

	const severity = comparison?.regression_analysis.severity;
	const config = severity ? severityConfig[severity] : null;
	const Icon = config?.icon;

	return (
		<div className="h-full flex flex-col" data-testid="comparison-view">
			{/* Run Selectors */}
			<div className="p-4 border-b border-sentinel-border">
				<div className="flex items-end gap-2">
					<div className="flex-1">
						<RunSelector
							runs={runs}
							selectedRun={baselineRun}
							onSelect={setBaselineRun}
							label="Baseline Run"
							excludeRunId={currentRun?.id}
							testId="baseline-selector"
						/>
					</div>
					<button
						onClick={handleSwapRuns}
						disabled={!baselineRun || !currentRun}
						className="p-2 rounded border border-sentinel-border hover:bg-sentinel-bg-elevated transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
						title="Swap runs"
						data-testid="swap-runs-button"
					>
						<ArrowRight size={14} className="text-sentinel-text-muted" />
					</button>
					<div className="flex-1">
						<RunSelector
							runs={runs}
							selectedRun={currentRun}
							onSelect={setCurrentRun}
							label="Current Run"
							excludeRunId={baselineRun?.id}
							testId="current-selector"
						/>
					</div>
				</div>
			</div>

			{/* Comparison Results */}
			<div className="flex-1 overflow-y-auto p-4">
				{error && (
					<div className="mb-4 p-3 bg-sentinel-error bg-opacity-10 border border-sentinel-error rounded">
						<div className="flex items-center gap-2">
							<AlertCircle size={14} className="text-sentinel-error" />
							<span className="text-xs text-sentinel-error">{error}</span>
						</div>
					</div>
				)}

				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<RefreshCw size={24} className="animate-spin text-sentinel-primary" />
					</div>
				)}

				{!isLoading && !comparison && baselineRun && currentRun && baselineRun.id !== currentRun.id && (
					<div className="text-center py-8">
						<p className="text-xs text-sentinel-text-muted">Comparing runs...</p>
					</div>
				)}

				{comparison && config && Icon && (
					<div className="space-y-4">
						{/* Summary */}
						<div
							className={`p-4 rounded border ${config.bgClass} ${config.borderClass}`}
							data-testid="comparison-summary"
						>
							<div className="flex items-start gap-3">
								<Icon size={20} className={config.textClass} />
								<div className="flex-1">
									<h3 className={`text-sm font-semibold ${config.textClass}`}>{config.label}</h3>
									<p className="text-xs text-sentinel-text mt-1">
										{comparison.regression_analysis.summary}
									</p>
								</div>
							</div>
						</div>

						{/* Configuration Changes */}
						{(comparison.model_changed || comparison.provider_changed) && (
							<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
								<h3 className="text-xs font-semibold text-sentinel-text mb-2">
									Configuration Changes
								</h3>
								<div className="space-y-1 text-xs">
									{comparison.model_changed && (
										<div className="flex items-center gap-2">
											<span className="text-sentinel-text-muted">Model:</span>
											<span className="text-sentinel-text">
												{comparison.baseline_run.model} → {comparison.current_run.model}
											</span>
										</div>
									)}
									{comparison.provider_changed && (
										<div className="flex items-center gap-2">
											<span className="text-sentinel-text-muted">Provider:</span>
											<span className="text-sentinel-text">
												{comparison.baseline_run.provider} → {comparison.current_run.provider}
											</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Metric Deltas */}
						<div>
							<h3 className="text-xs font-semibold text-sentinel-text mb-3">Performance Metrics</h3>
							<div className="grid grid-cols-2 gap-2">
								{comparison.regression_analysis.metric_deltas.map((delta, idx) => (
									<MetricDeltaCard key={idx} delta={delta} testId={`metric-delta-${idx}`} />
								))}
							</div>
						</div>

						{/* Assertion Changes */}
						{comparison.regression_analysis.assertion_changes && (
							<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
								<h3 className="text-xs font-semibold text-sentinel-text mb-2">Assertion Results</h3>
								<div className="space-y-2">
									{/* Pass rate */}
									<div className="flex items-center justify-between text-xs">
										<span className="text-sentinel-text-muted">Pass Rate</span>
										<div className="flex items-center gap-2">
											<span className="text-sentinel-text-muted">
												{comparison.regression_analysis.assertion_changes.baseline_pass_rate.toFixed(
													0
												)}
												%
											</span>
											<ArrowRight size={12} className="text-sentinel-text-muted" />
											<span
												className={`font-semibold ${
													comparison.regression_analysis.assertion_changes.pass_rate_delta >= 0
														? 'text-sentinel-success'
														: 'text-sentinel-error'
												}`}
											>
												{comparison.regression_analysis.assertion_changes.current_pass_rate.toFixed(
													0
												)}
												%
											</span>
										</div>
									</div>

									{/* New failures */}
									{comparison.regression_analysis.assertion_changes.new_failures.length > 0 && (
										<div>
											<p className="text-[0.65rem] text-sentinel-error font-semibold mb-1">
												New Failures ({comparison.regression_analysis.assertion_changes.new_failures.length})
											</p>
											{comparison.regression_analysis.assertion_changes.new_failures.map(
												(failure, idx) => (
													<div
														key={idx}
														className="text-[0.65rem] text-sentinel-error pl-2 border-l-2 border-sentinel-error"
													>
														{failure.assertion_type}: {failure.message}
													</div>
												)
											)}
										</div>
									)}

									{/* Fixed failures */}
									{comparison.regression_analysis.assertion_changes.fixed_failures.length > 0 && (
										<div>
											<p className="text-[0.65rem] text-sentinel-success font-semibold mb-1">
												Fixed ({comparison.regression_analysis.assertion_changes.fixed_failures.length})
											</p>
											{comparison.regression_analysis.assertion_changes.fixed_failures.map(
												(fixed, idx) => (
													<div
														key={idx}
														className="text-[0.65rem] text-sentinel-success pl-2 border-l-2 border-sentinel-success"
													>
														{fixed.assertion_type}
													</div>
												)
											)}
										</div>
									)}
								</div>
							</div>
						)}

						{/* Output Comparison */}
						{comparison.output_comparison?.outputs_differ && (
							<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
								<h3 className="text-xs font-semibold text-sentinel-text mb-2">Output Changes</h3>
								<div className="space-y-2 text-xs">
									<div className="flex items-center justify-between">
										<span className="text-sentinel-text-muted">Length Change</span>
										<span
											className={`font-mono ${
												comparison.output_comparison.length_delta > 0
													? 'text-sentinel-success'
													: comparison.output_comparison.length_delta < 0
													? 'text-sentinel-error'
													: 'text-sentinel-text-muted'
											}`}
										>
											{comparison.output_comparison.length_delta > 0 ? '+' : ''}
											{comparison.output_comparison.length_delta} chars
										</span>
									</div>
									<p className="text-[0.65rem] text-sentinel-text-muted">
										Output content has changed between runs
									</p>
								</div>
							</div>
						)}

						{/* Assertion Comparison Table */}
						{comparison.assertion_comparisons.length > 0 && (
							<div className="p-3 bg-sentinel-surface rounded border border-sentinel-border">
								<h3 className="text-xs font-semibold text-sentinel-text mb-2">
									Assertion Details ({comparison.assertion_comparisons.length})
								</h3>
								<div className="space-y-1">
									{comparison.assertion_comparisons.map((ac, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between text-xs py-1 border-b border-sentinel-border last:border-b-0"
										>
											<div className="flex items-center gap-2">
												<span
													className={`w-2 h-2 rounded-full ${
														ac.status === 'improved'
															? 'bg-sentinel-success'
															: ac.status === 'regressed'
															? 'bg-sentinel-error'
															: ac.status === 'new'
															? 'bg-sentinel-primary'
															: ac.status === 'removed'
															? 'bg-sentinel-text-muted'
															: 'bg-sentinel-text-muted opacity-50'
													}`}
												/>
												<span className="text-sentinel-text font-mono">
													{ac.assertion_type.replace(/_/g, ' ')}
												</span>
											</div>
											<div className="flex items-center gap-2">
												{/* Baseline status */}
												{ac.baseline_passed !== null && (
													<span
														className={`text-[0.65rem] ${
															ac.baseline_passed ? 'text-sentinel-success' : 'text-sentinel-error'
														}`}
													>
														{ac.baseline_passed ? 'Pass' : 'Fail'}
													</span>
												)}
												{ac.baseline_passed !== null && ac.current_passed !== null && (
													<ArrowRight size={10} className="text-sentinel-text-muted" />
												)}
												{/* Current status */}
												{ac.current_passed !== null && (
													<span
														className={`text-[0.65rem] font-semibold ${
															ac.current_passed ? 'text-sentinel-success' : 'text-sentinel-error'
														}`}
													>
														{ac.current_passed ? 'Pass' : 'Fail'}
													</span>
												)}
												{/* Status badge */}
												<span
													className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium ${
														ac.status === 'improved'
															? 'bg-sentinel-success bg-opacity-20 text-sentinel-success'
															: ac.status === 'regressed'
															? 'bg-sentinel-error bg-opacity-20 text-sentinel-error'
															: ac.status === 'new'
															? 'bg-sentinel-primary bg-opacity-20 text-sentinel-primary'
															: ac.status === 'removed'
															? 'bg-sentinel-text-muted bg-opacity-20 text-sentinel-text-muted'
															: 'bg-sentinel-border text-sentinel-text-muted'
													}`}
												>
													{ac.status}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Empty state when no run selected */}
				{!comparison && !isLoading && (!baselineRun || !currentRun) && (
					<div className="text-center py-8">
						<GitCompare size={32} className="text-sentinel-text-muted mx-auto mb-3 opacity-30" />
						<p className="text-xs text-sentinel-text-muted">
							Select two runs to compare
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default ComparisonView;
