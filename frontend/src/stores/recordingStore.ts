import { create } from 'zustand';
import type {
	RecordingSession,
	RecordingEvent,
	SmartDetectionResult,
	RecordingStatus,
} from '../types/test-spec';
import * as api from '../services/api';

/**
 * Recording Store
 *
 * Manages the state for the Record & Replay feature.
 * Tracks active recording sessions, captured events,
 * and smart detection results.
 */

interface RecordingStore {
	// Current session state
	activeSession: RecordingSession | null;
	events: RecordingEvent[];
	detectionResult: SmartDetectionResult | null;

	// UI state
	isLoading: boolean;
	error: string | null;

	// Session list state
	sessions: RecordingSession[];
	totalSessions: number;

	// Actions - Session Control
	startRecording: (name: string, description?: string) => Promise<void>;
	stopRecording: () => Promise<void>;
	pauseRecording: () => Promise<void>;
	resumeRecording: () => Promise<void>;

	// Actions - Event Management
	addEvent: (eventType: string, data: Record<string, unknown>) => Promise<void>;
	refreshEvents: () => Promise<void>;

	// Actions - Analysis
	analyzeRecording: () => Promise<void>;
	clearAnalysis: () => void;

	// Actions - Session Management
	loadActiveSession: () => Promise<void>;
	loadSessions: (limit?: number, offset?: number) => Promise<void>;
	deleteSession: (sessionId: number) => Promise<void>;

	// Actions - Utility
	clearError: () => void;
	reset: () => void;
}

export const useRecordingStore = create<RecordingStore>()((set, get) => ({
	// Initial state
	activeSession: null,
	events: [],
	detectionResult: null,
	isLoading: false,
	error: null,
	sessions: [],
	totalSessions: 0,

	// Start a new recording session
	startRecording: async (name: string, description?: string) => {
		set({ isLoading: true, error: null });

		try {
			const session = await api.startRecording(name, description);
			set({
				activeSession: session,
				events: [],
				detectionResult: null,
				isLoading: false,
			});
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to start recording',
				isLoading: false,
			});
		}
	},

	// Stop the current recording session
	stopRecording: async () => {
		const { activeSession } = get();
		if (!activeSession) return;

		set({ isLoading: true, error: null });

		try {
			const session = await api.stopRecording(activeSession.id);
			set({
				activeSession: session,
				isLoading: false,
			});
			// Refresh session list
			await get().loadSessions();
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to stop recording',
				isLoading: false,
			});
		}
	},

	// Pause the current recording session
	pauseRecording: async () => {
		const { activeSession } = get();
		if (!activeSession) return;

		set({ isLoading: true, error: null });

		try {
			const session = await api.pauseRecording(activeSession.id);
			set({
				activeSession: session,
				isLoading: false,
			});
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to pause recording',
				isLoading: false,
			});
		}
	},

	// Resume a paused recording session
	resumeRecording: async () => {
		const { activeSession } = get();
		if (!activeSession) return;

		set({ isLoading: true, error: null });

		try {
			const session = await api.resumeRecording(activeSession.id);
			set({
				activeSession: session,
				isLoading: false,
			});
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to resume recording',
				isLoading: false,
			});
		}
	},

	// Add an event to the current recording
	addEvent: async (eventType: string, data: Record<string, unknown>) => {
		const { activeSession } = get();
		if (!activeSession || activeSession.status !== 'recording') return;

		try {
			const event = await api.addRecordingEvent(activeSession.id, eventType, data);
			set((state) => ({
				events: [...state.events, event],
				activeSession: state.activeSession
					? { ...state.activeSession, event_count: state.events.length + 1 }
					: null,
			}));
		} catch (err) {
			// Don't set error for event failures - just log
			console.error('Failed to add recording event:', err);
		}
	},

	// Refresh events for the current session
	refreshEvents: async () => {
		const { activeSession } = get();
		if (!activeSession) return;

		try {
			const events = await api.getRecordingEvents(activeSession.id);
			set({ events });
		} catch (err) {
			console.error('Failed to refresh events:', err);
		}
	},

	// Analyze the current recording for smart detection
	analyzeRecording: async () => {
		const { activeSession } = get();
		if (!activeSession) return;

		set({ isLoading: true, error: null });

		try {
			const result = await api.analyzeRecording(activeSession.id);
			set({
				detectionResult: result,
				isLoading: false,
			});
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to analyze recording',
				isLoading: false,
			});
		}
	},

	// Clear analysis results
	clearAnalysis: () => {
		set({ detectionResult: null });
	},

	// Load the currently active session (if any)
	loadActiveSession: async () => {
		set({ isLoading: true, error: null });

		try {
			const session = await api.getActiveRecording();
			if (session) {
				const events = await api.getRecordingEvents(session.id);
				set({
					activeSession: session,
					events,
					isLoading: false,
				});
			} else {
				set({
					activeSession: null,
					events: [],
					isLoading: false,
				});
			}
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to load active session',
				isLoading: false,
			});
		}
	},

	// Load list of recording sessions
	loadSessions: async (limit = 50, offset = 0) => {
		set({ isLoading: true, error: null });

		try {
			const response = await api.listRecordings(limit, offset);
			set({
				sessions: response.sessions,
				totalSessions: response.total,
				isLoading: false,
			});
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to load sessions',
				isLoading: false,
			});
		}
	},

	// Delete a recording session
	deleteSession: async (sessionId: number) => {
		set({ isLoading: true, error: null });

		try {
			await api.deleteRecording(sessionId);

			// Update state
			set((state) => ({
				sessions: state.sessions.filter((s) => s.id !== sessionId),
				totalSessions: state.totalSessions - 1,
				// Clear active session if it was deleted
				activeSession:
					state.activeSession?.id === sessionId ? null : state.activeSession,
				events: state.activeSession?.id === sessionId ? [] : state.events,
				isLoading: false,
			}));
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : 'Failed to delete session',
				isLoading: false,
			});
		}
	},

	// Clear any error
	clearError: () => {
		set({ error: null });
	},

	// Reset the store to initial state
	reset: () => {
		set({
			activeSession: null,
			events: [],
			detectionResult: null,
			isLoading: false,
			error: null,
			sessions: [],
			totalSessions: 0,
		});
	},
}));

// Selector for checking if recording is active
export const useIsRecording = () =>
	useRecordingStore((state) => state.activeSession?.status === 'recording');

// Selector for getting recording status
export const useRecordingStatus = (): RecordingStatus | null =>
	useRecordingStore((state) => state.activeSession?.status ?? null);
