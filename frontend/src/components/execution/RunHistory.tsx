import { useState, useEffect } from 'react';
import {
	History,
	CheckCircle2,
	XCircle,
	Clock,
	ChevronDown,
	ChevronUp,
	GitCompare,
	RefreshCw,
} from 'lucide-react';
import { listRunsForTest } from '../../services/api';
import type { TestRun } from '../../types/test-spec';

interface RunHistoryProps {
	testId: number | null;
	onCompareClick?: () => void;
}

const RUN_HISTORY_EXPANDED_KEY = 'sentinel-run-history-expanded';

/**
 * RunHistory Component
 *
 * Displays the last 5 runs for a test with quick access to comparison view.
 * Part of Feature 11 Phase 4: File-Based Storage & Comparison Integration.
 */
function RunHistory({ testId, onCompareClick }: RunHistoryProps) {
	const [runs, setRuns] = useState<TestRun[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isExpanded, setIsExpanded] = useState(() => {
		const stored = localStorage.getItem(RUN_HISTORY_EXPANDED_KEY);
		return stored === 'true';
	});

	// Persist expanded state
	useEffect(() => {
		localStorage.setItem(RUN_HISTORY_EXPANDED_KEY, String(isExpanded));
	}, [isExpanded]);

	// Load runs when testId changes
	useEffect(() => {
		if (!testId) {
			setRuns([]);
			return;
		}

		async function loadRuns() {
			setIsLoading(true);
			setError(null);
			try {
				const response = await listRunsForTest(testId!, 5, 0);
				setRuns(response.runs);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load runs');
				setRuns([]);
			} finally {
				setIsLoading(false);
			}
		}

		loadRuns();
	}, [testId]);

	// Format timestamp
	const formatTime = (timestamp: string | null) => {
		if (!timestamp) return 'N/A';
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		if (diff < 60000) return 'Just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
		return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	};

	// If no test is saved, show prompt to save
	if (!testId) {
		return (
			<div className="p-3 border-t border-sentinel-border">
				<div className="flex items-center gap-2 text-sentinel-text-muted">
					<History size={14} className="opacity-50" />
					<span className="text-xs">Save test to track run history</span>
				</div>
			</div>
		);
	}

	return (
		<div className="border-t border-sentinel-border">
			{/* Header - Collapsible */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full flex items-center justify-between px-4 py-2 bg-sentinel-surface hover:bg-sentinel-hover transition-colors"
			>
				<div className="flex items-center gap-2">
					<History size={14} className="text-sentinel-text-muted" />
					<span className="text-xs font-semibold text-sentinel-text">
						Run History
					</span>
					{runs.length > 0 && (
						<span className="text-[0.65rem] text-sentinel-text-muted px-1.5 py-0.5 bg-sentinel-bg rounded">
							{runs.length}
						</span>
					)}
				</div>
				{isExpanded ? (
					<ChevronUp size={14} className="text-sentinel-text-muted" />
				) : (
					<ChevronDown size={14} className="text-sentinel-text-muted" />
				)}
			</button>

			{/* Content */}
			{isExpanded && (
				<div className="px-4 pb-3">
					{isLoading && (
						<div className="flex items-center justify-center py-4">
							<RefreshCw size={16} className="animate-spin text-sentinel-primary" />
						</div>
					)}

					{error && (
						<div className="text-xs text-sentinel-error py-2">{error}</div>
					)}

					{!isLoading && !error && runs.length === 0 && (
						<div className="text-center py-4">
							<p className="text-xs text-sentinel-text-muted">No runs yet</p>
							<p className="text-[0.65rem] text-sentinel-text-muted mt-1">
								Execute the test to create run history
							</p>
						</div>
					)}

					{!isLoading && runs.length > 0 && (
						<div className="space-y-2 mt-2">
							{runs.map((run) => (
								<div
									key={run.id}
									className="flex items-center justify-between p-2 bg-sentinel-bg rounded border border-sentinel-border"
								>
									<div className="flex items-center gap-2">
										{run.status === 'completed' ? (
											<CheckCircle2
												size={12}
												className="text-sentinel-success"
											/>
										) : run.status === 'failed' ? (
											<XCircle size={12} className="text-sentinel-error" />
										) : (
											<RefreshCw
												size={12}
												className="text-sentinel-primary animate-spin"
											/>
										)}
										<div>
											<p className="text-xs text-sentinel-text">
												{run.model}
											</p>
											<p className="text-[0.65rem] text-sentinel-text-muted">
												{formatTime(run.started_at)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										{run.latency_ms && (
											<div className="flex items-center gap-1 text-[0.65rem] text-sentinel-text-muted">
												<Clock size={10} />
												<span>{run.latency_ms}ms</span>
											</div>
										)}
									</div>
								</div>
							))}

							{/* Compare Button */}
							{runs.length >= 2 && onCompareClick && (
								<button
									onClick={onCompareClick}
									className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mt-2 bg-sentinel-surface border border-sentinel-border rounded hover:bg-sentinel-hover transition-colors text-xs text-sentinel-text-muted"
								>
									<GitCompare size={12} />
									<span>Compare Runs</span>
								</button>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default RunHistory;
