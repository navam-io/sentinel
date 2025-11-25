import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRecordingStore } from './recordingStore';

// Mock the API module
vi.mock('../services/api', () => ({
	startRecording: vi.fn(),
	stopRecording: vi.fn(),
	pauseRecording: vi.fn(),
	resumeRecording: vi.fn(),
	getActiveRecording: vi.fn(),
	getRecordingEvents: vi.fn(),
	addRecordingEvent: vi.fn(),
	analyzeRecording: vi.fn(),
	listRecordings: vi.fn(),
	deleteRecording: vi.fn(),
}));

import * as api from '../services/api';

const mockApi = api as {
	startRecording: ReturnType<typeof vi.fn>;
	stopRecording: ReturnType<typeof vi.fn>;
	pauseRecording: ReturnType<typeof vi.fn>;
	resumeRecording: ReturnType<typeof vi.fn>;
	getActiveRecording: ReturnType<typeof vi.fn>;
	getRecordingEvents: ReturnType<typeof vi.fn>;
	addRecordingEvent: ReturnType<typeof vi.fn>;
	analyzeRecording: ReturnType<typeof vi.fn>;
	listRecordings: ReturnType<typeof vi.fn>;
	deleteRecording: ReturnType<typeof vi.fn>;
};

describe('recordingStore', () => {
	beforeEach(() => {
		// Reset store to initial state
		useRecordingStore.setState({
			activeSession: null,
			events: [],
			detectionResult: null,
			isLoading: false,
			error: null,
			sessions: [],
			totalSessions: 0,
		});

		// Clear all mocks
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('Initial State', () => {
		it('should have correct initial state', () => {
			const state = useRecordingStore.getState();

			expect(state.activeSession).toBeNull();
			expect(state.events).toEqual([]);
			expect(state.detectionResult).toBeNull();
			expect(state.isLoading).toBe(false);
			expect(state.error).toBeNull();
			expect(state.sessions).toEqual([]);
			expect(state.totalSessions).toBe(0);
		});
	});

	describe('startRecording', () => {
		it('should start a new recording session', async () => {
			const mockSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'recording' as const,
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: null,
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 0,
			};

			mockApi.startRecording.mockResolvedValue(mockSession);

			await useRecordingStore.getState().startRecording('Test Recording');

			expect(mockApi.startRecording).toHaveBeenCalledWith('Test Recording', undefined);
			expect(useRecordingStore.getState().activeSession).toEqual(mockSession);
			expect(useRecordingStore.getState().events).toEqual([]);
			expect(useRecordingStore.getState().isLoading).toBe(false);
		});

		it('should handle errors when starting recording', async () => {
			mockApi.startRecording.mockRejectedValue(new Error('Session already active'));

			await useRecordingStore.getState().startRecording('Test Recording');

			expect(useRecordingStore.getState().error).toBe('Session already active');
			expect(useRecordingStore.getState().isLoading).toBe(false);
		});
	});

	describe('stopRecording', () => {
		it('should stop the current recording session', async () => {
			// Set up active session
			useRecordingStore.setState({
				activeSession: {
					id: 1,
					name: 'Test Recording',
					description: null,
					status: 'recording',
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: null,
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 0,
				},
			});

			const stoppedSession = {
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'stopped' as const,
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: '2025-01-01T00:01:00Z',
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 3,
			};

			mockApi.stopRecording.mockResolvedValue(stoppedSession);
			mockApi.listRecordings.mockResolvedValue({ sessions: [stoppedSession], total: 1 });

			await useRecordingStore.getState().stopRecording();

			expect(mockApi.stopRecording).toHaveBeenCalledWith(1);
			expect(useRecordingStore.getState().activeSession?.status).toBe('stopped');
		});

		it('should not call API if no active session', async () => {
			await useRecordingStore.getState().stopRecording();

			expect(mockApi.stopRecording).not.toHaveBeenCalled();
		});
	});

	describe('pauseRecording', () => {
		it('should pause the current recording session', async () => {
			useRecordingStore.setState({
				activeSession: {
					id: 1,
					name: 'Test Recording',
					description: null,
					status: 'recording',
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: null,
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 0,
				},
			});

			mockApi.pauseRecording.mockResolvedValue({
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'paused',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: null,
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 0,
			});

			await useRecordingStore.getState().pauseRecording();

			expect(mockApi.pauseRecording).toHaveBeenCalledWith(1);
			expect(useRecordingStore.getState().activeSession?.status).toBe('paused');
		});
	});

	describe('resumeRecording', () => {
		it('should resume a paused recording session', async () => {
			useRecordingStore.setState({
				activeSession: {
					id: 1,
					name: 'Test Recording',
					description: null,
					status: 'paused',
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: null,
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 2,
				},
			});

			mockApi.resumeRecording.mockResolvedValue({
				id: 1,
				name: 'Test Recording',
				description: null,
				status: 'recording',
				started_at: '2025-01-01T00:00:00Z',
				stopped_at: null,
				generated_test_id: null,
				created_at: '2025-01-01T00:00:00Z',
				event_count: 2,
			});

			await useRecordingStore.getState().resumeRecording();

			expect(mockApi.resumeRecording).toHaveBeenCalledWith(1);
			expect(useRecordingStore.getState().activeSession?.status).toBe('recording');
		});
	});

	describe('addEvent', () => {
		it('should add an event when recording is active', async () => {
			useRecordingStore.setState({
				activeSession: {
					id: 1,
					name: 'Test Recording',
					description: null,
					status: 'recording',
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: null,
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 0,
				},
				events: [],
			});

			const mockEvent = {
				id: 1,
				recording_session_id: 1,
				event_type: 'model_call',
				sequence_number: 1,
				timestamp: '2025-01-01T00:00:00Z',
				data: { query: 'Hello' },
			};

			mockApi.addRecordingEvent.mockResolvedValue(mockEvent);

			await useRecordingStore.getState().addEvent('model_call', { query: 'Hello' });

			expect(mockApi.addRecordingEvent).toHaveBeenCalledWith(1, 'model_call', { query: 'Hello' });
			expect(useRecordingStore.getState().events).toHaveLength(1);
			expect(useRecordingStore.getState().events[0]).toEqual(mockEvent);
		});

		it('should not add event when recording is not active', async () => {
			useRecordingStore.setState({
				activeSession: {
					id: 1,
					name: 'Test Recording',
					description: null,
					status: 'stopped',
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: '2025-01-01T00:01:00Z',
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 0,
				},
			});

			await useRecordingStore.getState().addEvent('model_call', { query: 'Hello' });

			expect(mockApi.addRecordingEvent).not.toHaveBeenCalled();
		});
	});

	describe('analyzeRecording', () => {
		it('should analyze the recording and store results', async () => {
			useRecordingStore.setState({
				activeSession: {
					id: 1,
					name: 'Test Recording',
					description: null,
					status: 'stopped',
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: '2025-01-01T00:01:00Z',
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 2,
				},
			});

			const mockResult = {
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

			mockApi.analyzeRecording.mockResolvedValue(mockResult);

			await useRecordingStore.getState().analyzeRecording();

			expect(mockApi.analyzeRecording).toHaveBeenCalledWith(1);
			expect(useRecordingStore.getState().detectionResult).toEqual(mockResult);
		});
	});

	describe('loadSessions', () => {
		it('should load list of recording sessions', async () => {
			const mockSessions = [
				{
					id: 1,
					name: 'Recording 1',
					description: null,
					status: 'stopped' as const,
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: '2025-01-01T00:01:00Z',
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 5,
				},
				{
					id: 2,
					name: 'Recording 2',
					description: null,
					status: 'stopped' as const,
					started_at: '2025-01-02T00:00:00Z',
					stopped_at: '2025-01-02T00:01:00Z',
					generated_test_id: null,
					created_at: '2025-01-02T00:00:00Z',
					event_count: 3,
				},
			];

			mockApi.listRecordings.mockResolvedValue({
				sessions: mockSessions,
				total: 2,
			});

			await useRecordingStore.getState().loadSessions();

			expect(mockApi.listRecordings).toHaveBeenCalledWith(50, 0);
			expect(useRecordingStore.getState().sessions).toEqual(mockSessions);
			expect(useRecordingStore.getState().totalSessions).toBe(2);
		});
	});

	describe('deleteSession', () => {
		it('should delete a session and update state', async () => {
			useRecordingStore.setState({
				sessions: [
					{
						id: 1,
						name: 'Recording 1',
						description: null,
						status: 'stopped',
						started_at: '2025-01-01T00:00:00Z',
						stopped_at: '2025-01-01T00:01:00Z',
						generated_test_id: null,
						created_at: '2025-01-01T00:00:00Z',
						event_count: 5,
					},
					{
						id: 2,
						name: 'Recording 2',
						description: null,
						status: 'stopped',
						started_at: '2025-01-02T00:00:00Z',
						stopped_at: '2025-01-02T00:01:00Z',
						generated_test_id: null,
						created_at: '2025-01-02T00:00:00Z',
						event_count: 3,
					},
				],
				totalSessions: 2,
			});

			mockApi.deleteRecording.mockResolvedValue({ message: 'Deleted' });

			await useRecordingStore.getState().deleteSession(1);

			expect(mockApi.deleteRecording).toHaveBeenCalledWith(1);
			expect(useRecordingStore.getState().sessions).toHaveLength(1);
			expect(useRecordingStore.getState().sessions[0].id).toBe(2);
			expect(useRecordingStore.getState().totalSessions).toBe(1);
		});
	});

	describe('reset', () => {
		it('should reset store to initial state', () => {
			useRecordingStore.setState({
				activeSession: {
					id: 1,
					name: 'Test',
					description: null,
					status: 'recording',
					started_at: '2025-01-01T00:00:00Z',
					stopped_at: null,
					generated_test_id: null,
					created_at: '2025-01-01T00:00:00Z',
					event_count: 5,
				},
				events: [{ id: 1, recording_session_id: 1, event_type: 'test', sequence_number: 1, timestamp: null, data: null }],
				error: 'Some error',
			});

			useRecordingStore.getState().reset();

			const state = useRecordingStore.getState();
			expect(state.activeSession).toBeNull();
			expect(state.events).toEqual([]);
			expect(state.detectionResult).toBeNull();
			expect(state.isLoading).toBe(false);
			expect(state.error).toBeNull();
		});
	});
});
