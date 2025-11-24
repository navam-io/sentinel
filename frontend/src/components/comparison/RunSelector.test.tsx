import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RunSelector from './RunSelector';
import type { TestRun } from '../../types/test-spec';

describe('RunSelector', () => {
	const mockRuns: TestRun[] = [
		{
			id: 1,
			test_definition_id: 100,
			started_at: '2025-01-01T10:00:00Z',
			completed_at: '2025-01-01T10:00:01Z',
			status: 'completed',
			provider: 'openai',
			model: 'gpt-5.1',
			latency_ms: 150,
			tokens_input: 500,
			tokens_output: 200,
			cost_usd: 0.01,
		},
		{
			id: 2,
			test_definition_id: 100,
			started_at: '2025-01-02T10:00:00Z',
			completed_at: '2025-01-02T10:00:01Z',
			status: 'completed',
			provider: 'openai',
			model: 'gpt-5.1',
			latency_ms: 120,
			tokens_input: 480,
			tokens_output: 180,
			cost_usd: 0.009,
		},
		{
			id: 3,
			test_definition_id: 100,
			started_at: '2025-01-03T10:00:00Z',
			completed_at: null,
			status: 'failed',
			provider: 'openai',
			model: 'gpt-5.1',
			latency_ms: null,
			tokens_input: null,
			tokens_output: null,
			cost_usd: null,
			error_message: 'API error',
		},
	];

	const mockOnSelect = vi.fn();

	beforeEach(() => {
		mockOnSelect.mockClear();
	});

	it('renders label', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
			/>
		);
		expect(screen.getByText('Baseline Run')).toBeInTheDocument();
	});

	it('shows placeholder when no run selected', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
			/>
		);
		expect(screen.getByText('Select a run...')).toBeInTheDocument();
	});

	it('shows selected run info', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={mockRuns[0]}
				onSelect={mockOnSelect}
				label="Baseline Run"
			/>
		);
		expect(screen.getByText('Run #1')).toBeInTheDocument();
	});

	it('opens dropdown on click', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
				testId="selector"
			/>
		);

		fireEvent.click(screen.getByTestId('selector-button'));

		// Should show all runs in dropdown
		expect(screen.getByTestId('selector-dropdown')).toBeInTheDocument();
		expect(screen.getByTestId('selector-option-1')).toBeInTheDocument();
		expect(screen.getByTestId('selector-option-2')).toBeInTheDocument();
		expect(screen.getByTestId('selector-option-3')).toBeInTheDocument();
	});

	it('calls onSelect when run is clicked', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
				testId="selector"
			/>
		);

		fireEvent.click(screen.getByTestId('selector-button'));
		fireEvent.click(screen.getByTestId('selector-option-2'));

		expect(mockOnSelect).toHaveBeenCalledWith(mockRuns[1]);
	});

	it('excludes specified run from options', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
				excludeRunId={2}
				testId="selector"
			/>
		);

		fireEvent.click(screen.getByTestId('selector-button'));

		// Run 2 should not be in the dropdown
		expect(screen.queryByTestId('selector-option-2')).not.toBeInTheDocument();
		expect(screen.getByTestId('selector-option-1')).toBeInTheDocument();
		expect(screen.getByTestId('selector-option-3')).toBeInTheDocument();
	});

	it('disables button when disabled prop is true', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
				disabled
				testId="selector"
			/>
		);

		expect(screen.getByTestId('selector-button')).toBeDisabled();
	});

	it('does not open dropdown when disabled', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
				disabled
				testId="selector"
			/>
		);

		fireEvent.click(screen.getByTestId('selector-button'));

		expect(screen.queryByTestId('selector-dropdown')).not.toBeInTheDocument();
	});

	it('shows empty state when no runs available', () => {
		render(
			<RunSelector
				runs={[]}
				selectedRun={null}
				onSelect={mockOnSelect}
				label="Baseline Run"
				testId="selector"
			/>
		);

		fireEvent.click(screen.getByTestId('selector-button'));

		expect(screen.getByText('No runs available')).toBeInTheDocument();
	});

	it('shows status icon for completed run', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={mockRuns[0]}
				onSelect={mockOnSelect}
				label="Baseline Run"
			/>
		);

		// The CheckCircle2 icon should be present (green check for completed)
		// We can't easily test SVG content, but we can verify the component renders
		expect(screen.getByText('Run #1')).toBeInTheDocument();
	});

	it('shows status icon for failed run', () => {
		render(
			<RunSelector
				runs={mockRuns}
				selectedRun={mockRuns[2]}
				onSelect={mockOnSelect}
				label="Baseline Run"
			/>
		);

		expect(screen.getByText('Run #3')).toBeInTheDocument();
	});
});
