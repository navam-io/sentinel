import {
	TrendingUp,
	TrendingDown,
	Minus,
	AlertTriangle,
	AlertCircle,
	CheckCircle2,
	Info,
} from 'lucide-react';
import type { MetricDelta, RegressionSeverity } from '../../types/test-spec';

interface MetricDeltaCardProps {
	delta: MetricDelta;
	testId?: string;
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
		label: 'Critical',
	},
	warning: {
		bgClass: 'bg-amber-500 bg-opacity-10',
		borderClass: 'border-amber-500',
		textClass: 'text-amber-500',
		icon: AlertTriangle,
		label: 'Warning',
	},
	info: {
		bgClass: 'bg-sentinel-surface',
		borderClass: 'border-sentinel-border',
		textClass: 'text-sentinel-text-muted',
		icon: Info,
		label: 'No Change',
	},
	improvement: {
		bgClass: 'bg-sentinel-success bg-opacity-10',
		borderClass: 'border-sentinel-success',
		textClass: 'text-sentinel-success',
		icon: CheckCircle2,
		label: 'Improved',
	},
};

function MetricDeltaCard({ delta, testId }: MetricDeltaCardProps) {
	const config = severityConfig[delta.severity];
	const Icon = config.icon;

	// Determine trend direction
	const showTrend = delta.delta !== null && delta.delta !== 0;
	const isIncrease = (delta.delta ?? 0) > 0;

	// Format values
	const formatValue = (value: number | null, unit: string) => {
		if (value === null) return 'N/A';
		if (unit === ' USD') return `$${value.toFixed(4)}`;
		if (unit === ' tokens') return value.toLocaleString();
		if (unit === 'ms') return `${value.toLocaleString()}ms`;
		return `${value}${unit}`;
	};

	const formatPercent = (percent: number | null) => {
		if (percent === null) return '';
		const sign = percent > 0 ? '+' : '';
		return `${sign}${percent.toFixed(1)}%`;
	};

	return (
		<div
			className={`p-3 rounded border ${config.bgClass} ${config.borderClass}`}
			data-testid={testId}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<Icon size={14} className={config.textClass} />
					<span className="text-xs font-semibold text-sentinel-text">{delta.metric_name}</span>
				</div>
				<span className={`text-[0.65rem] font-medium px-1.5 py-0.5 rounded ${config.textClass}`}>
					{config.label}
				</span>
			</div>

			{/* Values */}
			<div className="flex items-end justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-3 text-xs">
						<div className="text-sentinel-text-muted">
							<span className="block text-[0.65rem] opacity-70">Baseline</span>
							<span className="font-mono">{formatValue(delta.baseline_value, delta.unit)}</span>
						</div>
						<div className="text-sentinel-text-muted">→</div>
						<div className="text-sentinel-text">
							<span className="block text-[0.65rem] opacity-70">Current</span>
							<span className="font-mono font-semibold">
								{formatValue(delta.current_value, delta.unit)}
							</span>
						</div>
					</div>
				</div>

				{/* Delta indicator */}
				{showTrend && (
					<div className={`flex items-center gap-1 ${config.textClass}`}>
						{isIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
						<span className="text-xs font-semibold">{formatPercent(delta.delta_percent)}</span>
					</div>
				)}
				{!showTrend && delta.delta === 0 && (
					<div className="flex items-center gap-1 text-sentinel-text-muted">
						<Minus size={14} />
						<span className="text-xs">0%</span>
					</div>
				)}
			</div>
		</div>
	);
}

export default MetricDeltaCard;
