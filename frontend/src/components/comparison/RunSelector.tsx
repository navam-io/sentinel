import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import type { TestRun } from '../../types/test-spec';

interface RunSelectorProps {
	runs: TestRun[];
	selectedRun: TestRun | null;
	onSelect: (run: TestRun) => void;
	label: string;
	disabled?: boolean;
	excludeRunId?: number;
	testId?: string;
}

function RunSelector({
	runs,
	selectedRun,
	onSelect,
	label,
	disabled = false,
	excludeRunId,
	testId,
}: RunSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Filter out excluded run
	const availableRuns = excludeRunId ? runs.filter((r) => r.id !== excludeRunId) : runs;

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest('[data-run-selector]')) {
				setIsOpen(false);
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return 'Unknown';
		return new Date(dateStr).toLocaleString();
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed':
				return <CheckCircle2 size={12} className="text-sentinel-success" />;
			case 'failed':
				return <XCircle size={12} className="text-sentinel-error" />;
			default:
				return <Clock size={12} className="text-sentinel-text-muted" />;
		}
	};

	return (
		<div className="relative" data-run-selector data-testid={testId}>
			<label className="block text-[0.65rem] text-sentinel-text-muted mb-1 font-semibold">
				{label}
			</label>
			<button
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded border
					${
						disabled
							? 'bg-sentinel-bg-elevated opacity-50 cursor-not-allowed'
							: 'bg-sentinel-surface hover:bg-sentinel-bg-elevated cursor-pointer'
					}
					border-sentinel-border text-left transition-colors duration-120`}
				data-testid={testId ? `${testId}-button` : undefined}
			>
				{selectedRun ? (
					<div className="flex items-center gap-2 flex-1 min-w-0">
						{getStatusIcon(selectedRun.status)}
						<div className="flex-1 min-w-0">
							<div className="text-xs font-semibold text-sentinel-text truncate">
								Run #{selectedRun.id}
							</div>
							<div className="text-[0.65rem] text-sentinel-text-muted truncate">
								{formatDate(selectedRun.started_at)}
							</div>
						</div>
					</div>
				) : (
					<span className="text-xs text-sentinel-text-muted">Select a run...</span>
				)}
				<ChevronDown
					size={14}
					className={`text-sentinel-text-muted transition-transform duration-120 ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{/* Dropdown */}
			{isOpen && availableRuns.length > 0 && (
				<div
					className="absolute z-50 w-full mt-1 bg-sentinel-surface border border-sentinel-border rounded shadow-lg max-h-48 overflow-y-auto"
					data-testid={testId ? `${testId}-dropdown` : undefined}
				>
					{availableRuns.map((run) => (
						<button
							key={run.id}
							onClick={() => {
								onSelect(run);
								setIsOpen(false);
							}}
							className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-sentinel-bg-elevated transition-colors duration-120 text-left
								${selectedRun?.id === run.id ? 'bg-sentinel-bg-elevated' : ''}`}
							data-testid={testId ? `${testId}-option-${run.id}` : undefined}
						>
							{getStatusIcon(run.status)}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-semibold text-sentinel-text">Run #{run.id}</span>
									<span className="text-[0.65rem] text-sentinel-text-muted">{run.model}</span>
								</div>
								<div className="flex items-center justify-between gap-2 text-[0.65rem] text-sentinel-text-muted">
									<span>{formatDate(run.started_at)}</span>
									{run.latency_ms && <span>{run.latency_ms}ms</span>}
								</div>
							</div>
						</button>
					))}
				</div>
			)}

			{/* Empty state */}
			{isOpen && availableRuns.length === 0 && (
				<div className="absolute z-50 w-full mt-1 bg-sentinel-surface border border-sentinel-border rounded shadow-lg p-3">
					<p className="text-xs text-sentinel-text-muted text-center">No runs available</p>
				</div>
			)}
		</div>
	);
}

export default RunSelector;
