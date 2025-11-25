import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RunHistory from './RunHistory';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
	listRunsForTest: vi.fn(),
}));

const mockRuns = [
	{
		id: 1,
		test_definition_id: 123,
		started_at: new Date(Date.now() - 60000).toISOString(), // 1 min ago
		completed_at: new Date().toISOString(),
		status: 'completed',
		provider: 'anthropic',
		model: 'claude-sonnet-4-5-20250929',
		latency_ms: 1500,
		tokens_input: 100,
		tokens_output: 50,
		cost_usd: 0.001,
	},
	{
		id: 2,
		test_definition_id: 123,
		started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
		completed_at: new Date().toISOString(),
		status: 'failed',
		provider: 'openai',
		model: 'gpt-5.1',
		latency_ms: 2000,
		tokens_input: 150,
		tokens_output: 75,
		cost_usd: 0.002,
	},
];

describe('RunHistory', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		localStorage.clear();
	});

	describe('without test ID', () => {
		it('shows prompt to save test', () => {
			render(<RunHistory testId={null} />);

			expect(screen.getByText('Save test to track run history')).toBeInTheDocument();
		});
	});

	describe('with test ID', () => {
		it('shows loading state initially', async () => {
			vi.mocked(api.listRunsForTest).mockImplementation(
				() => new Promise(() => {}) // Never resolves
			);

			render(<RunHistory testId={123} />);

			// Expand the section
			const expandButton = screen.getByRole('button', { name: /Run History/i });
			await userEvent.click(expandButton);

			// Should show loading spinner (RefreshCw with animate-spin)
			await waitFor(() => {
				expect(screen.getByText('Run History')).toBeInTheDocument();
			});
		});

		it('shows empty state when no runs', async () => {
			vi.mocked(api.listRunsForTest).mockResolvedValue({
				runs: [],
				total: 0,
			});

			render(<RunHistory testId={123} />);

			// Expand the section
			const expandButton = screen.getByRole('button', { name: /Run History/i });
			await userEvent.click(expandButton);

			await waitFor(() => {
				expect(screen.getByText('No runs yet')).toBeInTheDocument();
			});
		});

		it('displays run history when runs exist', async () => {
			vi.mocked(api.listRunsForTest).mockResolvedValue({
				runs: mockRuns,
				total: 2,
			});

			render(<RunHistory testId={123} />);

			// Expand the section
			const expandButton = screen.getByRole('button', { name: /Run History/i });
			await userEvent.click(expandButton);

			await waitFor(() => {
				expect(screen.getByText('claude-sonnet-4-5-20250929')).toBeInTheDocument();
				expect(screen.getByText('gpt-5.1')).toBeInTheDocument();
			});
		});

		it('shows run count badge', async () => {
			vi.mocked(api.listRunsForTest).mockResolvedValue({
				runs: mockRuns,
				total: 2,
			});

			render(<RunHistory testId={123} />);

			await waitFor(() => {
				expect(screen.getByText('2')).toBeInTheDocument();
			});
		});

		it('shows compare button when 2+ runs exist', async () => {
			const mockCompareClick = vi.fn();
			vi.mocked(api.listRunsForTest).mockResolvedValue({
				runs: mockRuns,
				total: 2,
			});

			render(<RunHistory testId={123} onCompareClick={mockCompareClick} />);

			// Expand the section
			const expandButton = screen.getByRole('button', { name: /Run History/i });
			await userEvent.click(expandButton);

			await waitFor(() => {
				expect(screen.getByText('Compare Runs')).toBeInTheDocument();
			});
		});

		it('calls onCompareClick when compare button clicked', async () => {
			const mockCompareClick = vi.fn();
			vi.mocked(api.listRunsForTest).mockResolvedValue({
				runs: mockRuns,
				total: 2,
			});

			render(<RunHistory testId={123} onCompareClick={mockCompareClick} />);

			// Expand the section
			const expandButton = screen.getByRole('button', { name: /Run History/i });
			await userEvent.click(expandButton);

			await waitFor(() => {
				expect(screen.getByText('Compare Runs')).toBeInTheDocument();
			});

			// Click compare button
			await userEvent.click(screen.getByText('Compare Runs'));
			expect(mockCompareClick).toHaveBeenCalled();
		});

		it('shows error state on API failure', async () => {
			vi.mocked(api.listRunsForTest).mockRejectedValue(new Error('API Error'));

			render(<RunHistory testId={123} />);

			// Expand the section
			const expandButton = screen.getByRole('button', { name: /Run History/i });
			await userEvent.click(expandButton);

			await waitFor(() => {
				expect(screen.getByText('API Error')).toBeInTheDocument();
			});
		});

		it('toggles expanded state', async () => {
			vi.mocked(api.listRunsForTest).mockResolvedValue({
				runs: [],
				total: 0,
			});

			render(<RunHistory testId={123} />);

			// Initially collapsed, expand
			const expandButton = screen.getByRole('button', { name: /Run History/i });
			await userEvent.click(expandButton);

			await waitFor(() => {
				expect(screen.getByText('No runs yet')).toBeInTheDocument();
			});

			// Collapse
			await userEvent.click(expandButton);

			await waitFor(() => {
				expect(screen.queryByText('No runs yet')).not.toBeInTheDocument();
			});
		});
	});
});
