import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecordingControls from './RecordingControls';

// Create mock store state
const mockStoreState = {
	activeSession: null as {
		id: number;
		name: string;
		description: string | null;
		status: 'recording' | 'paused' | 'stopped';
		started_at: string | null;
		stopped_at: string | null;
		generated_test_id: number | null;
		created_at: string | null;
		event_count: number;
	} | null,
	events: [] as Array<{
		id: number;
		recording_session_id: number;
		event_type: string;
		sequence_number: number;
		timestamp: string | null;
		data: Record<string, unknown> | null;
	}>,
	detectionResult: null as {
		has_tool_calls: boolean;
		tool_names: string[];
		output_format: string | null;
		suggested_assertions: Array<{
			assertion_type: string;
			assertion_value: string | Record<string, unknown> | string[] | null;
			confidence: number;
			reason: string;
		}>;
		detected_patterns: string[];
	} | null,
	isLoading: false,
	error: null as string | null,
	startRecording: vi.fn(),
	stopRecording: vi.fn(),
	pauseRecording: vi.fn(),
	resumeRecording: vi.fn(),
	analyzeRecording: vi.fn(),
	loadActiveSession: vi.fn(),
	clearError: vi.fn(),
};

// Mock zustand store
vi.mock('../../stores/recordingStore', () => ({
	useRecordingStore: (selector: (state: typeof mockStoreState) => unknown) => {
		if (typeof selector === 'function') {
			return selector(mockStoreState);
		}
		return mockStoreState;
	},
	useIsRecording: () => mockStoreState.activeSession?.status === 'recording',
}));

// Mock other dependencies
vi.mock('../../stores/canvasStore', () => ({
	useCanvasStore: {
		getState: vi.fn(() => ({
			setNodes: vi.fn(),
			setEdges: vi.fn(),
			setActiveTestId: vi.fn(),
		})),
	},
}));

vi.mock('../../stores/testStore', () => ({
	useTestStore: {
		getState: vi.fn(() => ({
			setCurrentTest: vi.fn(),
		})),
	},
}));

vi.mock('../../services/api', () => ({
	generateTestFromRecording: vi.fn(),
}));

describe('RecordingControls', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mock state to defaults
		mockStoreState.activeSession = null;
		mockStoreState.events = [];
		mockStoreState.detectionResult = null;
		mockStoreState.isLoading = false;
		mockStoreState.error = null;
	});

	describe('Initial state (no active recording)', () => {
		it('renders Record button when no active session', () => {
			render(<RecordingControls />);

			expect(screen.getByTestId('start-recording')).toBeInTheDocument();
			expect(screen.getByText('Record')).toBeInTheDocument();
		});
	});

	describe('Recording state', () => {
		it('shows pause and stop buttons when recording', () => {
			mockStoreState.activeSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'recording',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: null,
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 0,
			};

			render(<RecordingControls />);

			expect(screen.getByTestId('pause-recording')).toBeInTheDocument();
			expect(screen.getByTestId('stop-recording')).toBeInTheDocument();
			expect(screen.getByText('Recording...')).toBeInTheDocument();
		});

		it('displays event count', () => {
			mockStoreState.activeSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'recording',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: null,
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 5,
			};
			mockStoreState.events = [
				{ id: 1, recording_session_id: 1, event_type: 'model_call', sequence_number: 1, timestamp: null, data: null },
				{ id: 2, recording_session_id: 1, event_type: 'output', sequence_number: 2, timestamp: null, data: null },
				{ id: 3, recording_session_id: 1, event_type: 'tool_call', sequence_number: 3, timestamp: null, data: null },
				{ id: 4, recording_session_id: 1, event_type: 'model_call', sequence_number: 4, timestamp: null, data: null },
				{ id: 5, recording_session_id: 1, event_type: 'output', sequence_number: 5, timestamp: null, data: null },
			];

			render(<RecordingControls />);

			expect(screen.getByText('5 events')).toBeInTheDocument();
		});
	});

	describe('Paused state', () => {
		it('shows resume and stop buttons when paused', () => {
			mockStoreState.activeSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'paused',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: null,
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 3,
			};

			render(<RecordingControls />);

			expect(screen.getByTestId('resume-recording')).toBeInTheDocument();
			expect(screen.getByTestId('stop-recording')).toBeInTheDocument();
			expect(screen.getByText('Paused')).toBeInTheDocument();
		});
	});

	describe('Stopped state', () => {
		it('shows generate test button when stopped with events', () => {
			mockStoreState.activeSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'stopped',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: '2025-01-01T00:01:00Z',
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 3,
			};
			mockStoreState.events = [
				{ id: 1, recording_session_id: 1, event_type: 'model_call', sequence_number: 1, timestamp: null, data: null },
				{ id: 2, recording_session_id: 1, event_type: 'output', sequence_number: 2, timestamp: null, data: null },
				{ id: 3, recording_session_id: 1, event_type: 'tool_call', sequence_number: 3, timestamp: null, data: null },
			];

			render(<RecordingControls />);

			expect(screen.getByTestId('generate-test')).toBeInTheDocument();
			expect(screen.getByText('Generate Test')).toBeInTheDocument();
		});

		it('disables generate test button when no events', () => {
			mockStoreState.activeSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'stopped',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: '2025-01-01T00:01:00Z',
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 0,
			};
			mockStoreState.events = [];

			render(<RecordingControls />);

			const generateButton = screen.getByTestId('generate-test');
			expect(generateButton).toBeDisabled();
		});
	});

	describe('Smart detection results', () => {
		it('displays detection results when stopped', () => {
			mockStoreState.activeSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'stopped',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: '2025-01-01T00:01:00Z',
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 3,
			};
			mockStoreState.events = [
				{ id: 1, recording_session_id: 1, event_type: 'model_call', sequence_number: 1, timestamp: null, data: null },
			];
			mockStoreState.detectionResult = {
				has_tool_calls: true,
				tool_names: ['search'],
				output_format: 'json',
				suggested_assertions: [
					{
						assertion_type: 'must_call_tool',
						assertion_value: ['search'],
						confidence: 0.95,
						reason: 'Tool call detected',
					},
				],
				detected_patterns: ['Tool calls detected: search'],
			};

			render(<RecordingControls />);

			expect(screen.getByText('Smart Detection')).toBeInTheDocument();
			expect(screen.getByText('Tool calls detected: search')).toBeInTheDocument();
			expect(screen.getByText('must_call_tool')).toBeInTheDocument();
		});
	});

	describe('Error handling', () => {
		it('displays error message', () => {
			mockStoreState.error = 'Failed to start recording';

			render(<RecordingControls />);

			expect(screen.getByText('Failed to start recording')).toBeInTheDocument();
		});
	});
});
