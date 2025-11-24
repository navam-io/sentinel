import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricDeltaCard from './MetricDeltaCard';
import type { MetricDelta } from '../../types/test-spec';

describe('MetricDeltaCard', () => {
	const baseDelta: MetricDelta = {
		metric_name: 'Latency',
		baseline_value: 100,
		current_value: 150,
		delta: 50,
		delta_percent: 50.0,
		unit: 'ms',
		severity: 'critical',
		description: 'Latency: increased by +50.0% (100ms → 150ms)',
	};

	it('renders metric name', () => {
		render(<MetricDeltaCard delta={baseDelta} />);
		expect(screen.getByText('Latency')).toBeInTheDocument();
	});

	it('displays severity label for critical', () => {
		render(<MetricDeltaCard delta={baseDelta} />);
		expect(screen.getByText('Critical')).toBeInTheDocument();
	});

	it('displays severity label for warning', () => {
		const delta: MetricDelta = {
			...baseDelta,
			severity: 'warning',
			delta_percent: 25.0,
		};
		render(<MetricDeltaCard delta={delta} />);
		expect(screen.getByText('Warning')).toBeInTheDocument();
	});

	it('displays severity label for improvement', () => {
		const delta: MetricDelta = {
			...baseDelta,
			severity: 'improvement',
			delta: -30,
			delta_percent: -30.0,
			current_value: 70,
		};
		render(<MetricDeltaCard delta={delta} />);
		expect(screen.getByText('Improved')).toBeInTheDocument();
	});

	it('displays severity label for info', () => {
		const delta: MetricDelta = {
			...baseDelta,
			severity: 'info',
			delta: 5,
			delta_percent: 5.0,
			current_value: 105,
		};
		render(<MetricDeltaCard delta={delta} />);
		expect(screen.getByText('No Change')).toBeInTheDocument();
	});

	it('displays baseline value', () => {
		render(<MetricDeltaCard delta={baseDelta} />);
		expect(screen.getByText('100ms')).toBeInTheDocument();
	});

	it('displays current value', () => {
		render(<MetricDeltaCard delta={baseDelta} />);
		expect(screen.getByText('150ms')).toBeInTheDocument();
	});

	it('displays percentage change', () => {
		render(<MetricDeltaCard delta={baseDelta} />);
		expect(screen.getByText('+50.0%')).toBeInTheDocument();
	});

	it('handles null baseline value', () => {
		const delta: MetricDelta = {
			...baseDelta,
			baseline_value: null,
			delta: null,
			delta_percent: null,
		};
		render(<MetricDeltaCard delta={delta} />);
		expect(screen.getByText('N/A')).toBeInTheDocument();
	});

	it('handles null current value', () => {
		const delta: MetricDelta = {
			...baseDelta,
			current_value: null,
			delta: null,
			delta_percent: null,
		};
		render(<MetricDeltaCard delta={delta} />);
		expect(screen.getByText('N/A')).toBeInTheDocument();
	});

	it('formats USD values correctly', () => {
		const delta: MetricDelta = {
			...baseDelta,
			metric_name: 'Cost',
			baseline_value: 0.01,
			current_value: 0.015,
			unit: ' USD',
		};
		render(<MetricDeltaCard delta={delta} />);
		expect(screen.getByText('$0.0100')).toBeInTheDocument();
		expect(screen.getByText('$0.0150')).toBeInTheDocument();
	});

	it('formats token values with locale string', () => {
		const delta: MetricDelta = {
			...baseDelta,
			metric_name: 'Input Tokens',
			baseline_value: 1000,
			current_value: 1500,
			unit: ' tokens',
		};
		render(<MetricDeltaCard delta={delta} />);
		// Note: locale string formatting may vary
		expect(screen.getByText('1,000')).toBeInTheDocument();
		expect(screen.getByText('1,500')).toBeInTheDocument();
	});

	it('accepts test id prop', () => {
		render(<MetricDeltaCard delta={baseDelta} testId="test-metric" />);
		expect(screen.getByTestId('test-metric')).toBeInTheDocument();
	});

	it('shows 0% for zero change', () => {
		const delta: MetricDelta = {
			...baseDelta,
			delta: 0,
			delta_percent: 0,
			current_value: 100,
			severity: 'info',
		};
		render(<MetricDeltaCard delta={delta} />);
		expect(screen.getByText('0%')).toBeInTheDocument();
	});
});
