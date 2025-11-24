import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ComparisonView from './ComparisonView';
import * as api from '../../services/api';
import type { RunListResponse, ComparisonResult } from '../../types/test-spec';

// Mock the API module
vi.mock('../../services/api', () => ({
	listRunsForTest: vi.fn(),
	compareRuns: vi.fn(),
}));

describe('ComparisonView', () => {
	const mockRuns: RunListResponse = {
		runs: [
			{
				id: 2,
				test_definition_id: 100,
				started_at: '2025-01-02T10:00:00Z',
				completed_at: '2025-01-02T10:00:01Z',
				status: 'completed',
				provider: 'openai',
				model: 'gpt-5.1',
				latency_ms: 150,
				tokens_input: 500,
				tokens_output: 200,
				cost_usd: 0.01,
			},
			{
				id: 1,
				test_definition_id: 100,
				started_at: '2025-01-01T10:00:00Z',
				completed_at: '2025-01-01T10:00:01Z',
				status: 'completed',
				provider: 'openai',
				model: 'gpt-5.1',
				latency_ms: 100,
				tokens_input: 450,
				tokens_output: 180,
				cost_usd: 0.008,
			},
		],
		total: 2,
	};

	const mockComparison: ComparisonResult = {
		baseline_run: {
			run_id: 1,
			test_id: 100,
			status: 'completed',
			provider: 'openai',
			model: 'gpt-5.1',
			latency_ms: 100,
			tokens_input: 450,
			tokens_output: 180,
			cost_usd: 0.008,
			started_at: '2025-01-01T10:00:00Z',
			completed_at: '2025-01-01T10:00:01Z',
		},
		current_run: {
			run_id: 2,
			test_id: 100,
			status: 'completed',
			provider: 'openai',
			model: 'gpt-5.1',
			latency_ms: 150,
			tokens_input: 500,
			tokens_output: 200,
			cost_usd: 0.01,
			started_at: '2025-01-02T10:00:00Z',
			completed_at: '2025-01-02T10:00:01Z',
		},
		regression_analysis: {
			has_regressions: true,
			severity: 'warning',
			metric_deltas: [
				{
					metric_name: 'Latency',
					baseline_value: 100,
					current_value: 150,
					delta: 50,
					delta_percent: 50.0,
					unit: 'ms',
					severity: 'critical',
					description: 'Latency: increased by +50.0%',
				},
				{
					metric_name: 'Cost',
					baseline_value: 0.008,
					current_value: 0.01,
					delta: 0.002,
					delta_percent: 25.0,
					unit: ' USD',
					severity: 'warning',
					description: 'Cost: increased by +25.0%',
				},
			],
			assertion_changes: {
				baseline_total: 2,
				current_total: 2,
				baseline_passed: 2,
				current_passed: 1,
				baseline_pass_rate: 100,
				current_pass_rate: 50,
				pass_rate_delta: -50,
				new_failures: [{ assertion_type: 'must_contain', message: 'Missing expected text' }],
				fixed_failures: [],
				has_new_failures: true,
				has_fixes: false,
			},
			summary: 'Performance regression detected. 1 new assertion failure(s).',
		},
		assertion_comparisons: [
			{
				assertion_type: 'must_contain',
				baseline_passed: true,
				current_passed: false,
				baseline_message: 'OK',
				current_message: 'Missing expected text',
				status: 'regressed',
			},
			{
				assertion_type: 'max_latency',
				baseline_passed: true,
				current_passed: true,
				baseline_message: 'OK',
				current_message: 'OK',
				status: 'unchanged',
			},
		],
		output_comparison: {
			baseline_output: 'Hello',
			current_output: 'Hello World',
			outputs_differ: true,
			baseline_length: 5,
			current_length: 11,
			length_delta: 6,
		},
		model_changed: false,
		provider_changed: false,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows loading state initially', async () => {
		vi.mocked(api.listRunsForTest).mockImplementation(
			() => new Promise(() => {}) // Never resolves
		);

		render(<ComparisonView testId={100} />);

		expect(screen.getByText('Loading run history...')).toBeInTheDocument();
	});

	it('shows empty state when no runs', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue({ runs: [], total: 0 });

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('No runs available to compare')).toBeInTheDocument();
		});
	});

	it('shows message when only one run', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue({
			runs: [mockRuns.runs[0]],
			total: 1,
		});

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('Need at least 2 runs to compare')).toBeInTheDocument();
		});
	});

	it('loads runs and shows selectors', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByTestId('baseline-selector')).toBeInTheDocument();
			expect(screen.getByTestId('current-selector')).toBeInTheDocument();
		});
	});

	it('auto-selects first two runs', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			// Should auto-select runs - older as baseline, newer as current
			expect(screen.getByText('Run #1')).toBeInTheDocument();
			expect(screen.getByText('Run #2')).toBeInTheDocument();
		});
	});

	it('displays comparison summary', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByTestId('comparison-summary')).toBeInTheDocument();
			expect(screen.getByText(/Performance regression detected/)).toBeInTheDocument();
		});
	});

	it('displays metric deltas', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
			expect(screen.getByTestId('metric-delta-0')).toBeInTheDocument();
			expect(screen.getByTestId('metric-delta-1')).toBeInTheDocument();
		});
	});

	it('displays assertion changes', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('Assertion Results')).toBeInTheDocument();
			expect(screen.getByText('Pass Rate')).toBeInTheDocument();
			expect(screen.getByText('New Failures (1)')).toBeInTheDocument();
		});
	});

	it('displays output comparison', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('Output Changes')).toBeInTheDocument();
			expect(screen.getByText('Length Change')).toBeInTheDocument();
			expect(screen.getByText('+6 chars')).toBeInTheDocument();
		});
	});

	it('shows error when comparison fails', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockRejectedValue(new Error('Comparison failed'));

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('Comparison failed')).toBeInTheDocument();
		});
	});

	it('shows model change notification', async () => {
		const comparisonWithModelChange: ComparisonResult = {
			...mockComparison,
			model_changed: true,
			current_run: {
				...mockComparison.current_run,
				model: 'gpt-5-mini',
			},
		};

		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(comparisonWithModelChange);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('Configuration Changes')).toBeInTheDocument();
			expect(screen.getByText(/gpt-5\.1 → gpt-5-mini/)).toBeInTheDocument();
		});
	});

	it('displays assertion comparison table', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByText('Assertion Details (2)')).toBeInTheDocument();
			expect(screen.getByText('must contain')).toBeInTheDocument();
			expect(screen.getByText('max latency')).toBeInTheDocument();
		});
	});

	it('has swap runs button', async () => {
		vi.mocked(api.listRunsForTest).mockResolvedValue(mockRuns);
		vi.mocked(api.compareRuns).mockResolvedValue(mockComparison);

		render(<ComparisonView testId={100} />);

		await waitFor(() => {
			expect(screen.getByTestId('swap-runs-button')).toBeInTheDocument();
		});
	});
});
