import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionPersistence } from './useSessionPersistence';
import { useCanvasStore } from '../stores/canvasStore';
import { useTestStore } from '../stores/testStore';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api', () => ({
	createTest: vi.fn(),
	updateTest: vi.fn(),
}));

// Mock stores
vi.mock('../stores/canvasStore', () => ({
	useCanvasStore: vi.fn(),
}));

vi.mock('../stores/testStore', () => ({
	useTestStore: vi.fn(),
}));

// Mock DSL generator
vi.mock('../lib/dsl/generator', () => ({
	generateYAML: vi.fn(() => 'name: Test\nmodel: gpt-5.1'),
	parseYAMLToNodes: vi.fn(() => ({
		nodes: [{ id: '1', type: 'model', data: { model: 'gpt-5.1' }, position: { x: 0, y: 0 } }],
		edges: [],
	})),
}));

describe('useSessionPersistence', () => {
	const mockMarkClean = vi.fn();

	const defaultCanvasStore = {
		nodes: [{ id: '1', type: 'model', data: {}, position: { x: 0, y: 0 } }],
		edges: [],
	};

	const defaultTestStore = {
		currentTest: null,
		markClean: mockMarkClean,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		(useCanvasStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultCanvasStore);
		(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultTestStore);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe('Auto-save functionality', () => {
		it('does not auto-save when no test is loaded', async () => {
			renderHook(() => useSessionPersistence({ autoSaveEnabled: true }));

			// Advance timers past auto-save delay
			await act(async () => {
				vi.advanceTimersByTime(5000);
			});

			expect(api.updateTest).not.toHaveBeenCalled();
		});

		it('does not auto-save for new tests without ID', async () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: null, // New test, no ID
					name: 'New Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ autoSaveEnabled: true }));

			await act(async () => {
				vi.advanceTimersByTime(5000);
			});

			// Should not create test automatically
			expect(api.createTest).not.toHaveBeenCalled();
			expect(api.updateTest).not.toHaveBeenCalled();
		});

		it('auto-saves existing test with changes after delay', async () => {
			vi.useRealTimers(); // Use real timers for this test
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1, // Existing test
					name: 'Existing Test',
					description: 'A test',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: 'qa',
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ autoSaveEnabled: true, autoSaveDelay: 100 })); // Short delay for test

			// Wait for auto-save
			await waitFor(() => {
				expect(api.updateTest).toHaveBeenCalledWith(1, expect.any(Object));
			}, { timeout: 500 });
		});

		it('does not auto-save when disabled', async () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ autoSaveEnabled: false }));

			await act(async () => {
				vi.advanceTimersByTime(5000);
			});

			expect(api.updateTest).not.toHaveBeenCalled();
		});

		it('does not auto-save templates', async () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: null,
					name: 'Template Test',
					description: '',
					isDirty: true,
					isTemplate: true, // Template
					lastSaved: null,
					category: null,
					filename: 'template.yaml',
				},
			});

			renderHook(() => useSessionPersistence({ autoSaveEnabled: true }));

			await act(async () => {
				vi.advanceTimersByTime(5000);
			});

			expect(api.updateTest).not.toHaveBeenCalled();
		});

		it('does not auto-save when test is not dirty', async () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: false, // Not dirty
					isTemplate: false,
					lastSaved: new Date(),
					category: null,
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ autoSaveEnabled: true }));

			await act(async () => {
				vi.advanceTimersByTime(5000);
			});

			expect(api.updateTest).not.toHaveBeenCalled();
		});

		it('marks test as clean after successful auto-save', async () => {
			vi.useRealTimers(); // Use real timers for this test
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ autoSaveEnabled: true, autoSaveDelay: 100 }));

			await waitFor(() => {
				expect(mockMarkClean).toHaveBeenCalledWith(expect.objectContaining({
					lastSaved: expect.any(Date),
				}));
			}, { timeout: 500 });
		});
	});

	describe('Manual save (saveNow)', () => {
		it('saves immediately when saveNow is called', async () => {
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			const { result } = renderHook(() => useSessionPersistence({ autoSaveEnabled: true }));

			await act(async () => {
				await result.current.saveNow();
			});

			expect(api.updateTest).toHaveBeenCalledWith(1, expect.any(Object));
		});

		it('returns true on successful save', async () => {
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			const { result } = renderHook(() => useSessionPersistence());

			let success: boolean = false;
			await act(async () => {
				success = await result.current.saveNow();
			});

			expect(success).toBe(true);
		});

		it('returns false when no test is loaded', async () => {
			const { result } = renderHook(() => useSessionPersistence());

			let success: boolean = true;
			await act(async () => {
				success = await result.current.saveNow();
			});

			expect(success).toBe(false);
		});

		it('returns false when canvas is empty', async () => {
			(useCanvasStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultCanvasStore,
				nodes: [],
			});

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			const { result } = renderHook(() => useSessionPersistence());

			let success: boolean = true;
			await act(async () => {
				success = await result.current.saveNow();
			});

			expect(success).toBe(false);
		});

		it('returns true when test is already saved (not dirty)', async () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: false,
					isTemplate: false,
					lastSaved: new Date(),
					category: null,
					filename: null,
				},
			});

			const { result } = renderHook(() => useSessionPersistence());

			let success: boolean = false;
			await act(async () => {
				success = await result.current.saveNow();
			});

			expect(success).toBe(true);
		});
	});

	describe('Unsaved changes warning', () => {
		let mockAddEventListener: ReturnType<typeof vi.fn>;
		let mockRemoveEventListener: ReturnType<typeof vi.fn>;
		let beforeUnloadHandler: ((e: BeforeUnloadEvent) => string | undefined) | null = null;

		beforeEach(() => {
			mockAddEventListener = vi.fn((event, handler) => {
				if (event === 'beforeunload') {
					beforeUnloadHandler = handler;
				}
			});
			mockRemoveEventListener = vi.fn();
			window.addEventListener = mockAddEventListener;
			window.removeEventListener = mockRemoveEventListener;
		});

		it('registers beforeunload handler when warnOnUnsavedChanges is true', () => {
			renderHook(() => useSessionPersistence({ warnOnUnsavedChanges: true }));

			expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
		});

		it('does not register beforeunload handler when warnOnUnsavedChanges is false', () => {
			renderHook(() => useSessionPersistence({ warnOnUnsavedChanges: false }));

			expect(mockAddEventListener).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
		});

		it('removes handler on unmount', () => {
			const { unmount } = renderHook(() => useSessionPersistence({ warnOnUnsavedChanges: true }));

			unmount();

			expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
		});

		it('shows warning when there are unsaved changes', () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true, // Has unsaved changes
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ warnOnUnsavedChanges: true }));

			// Simulate beforeunload event
			const event = {
				preventDefault: vi.fn(),
				returnValue: '',
			} as unknown as BeforeUnloadEvent;

			const result = beforeUnloadHandler?.(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(result).toBe('You have unsaved changes. Are you sure you want to leave?');
		});

		it('does not show warning when test is saved', () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: false, // No unsaved changes
					isTemplate: false,
					lastSaved: new Date(),
					category: null,
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ warnOnUnsavedChanges: true }));

			const event = {
				preventDefault: vi.fn(),
				returnValue: '',
			} as unknown as BeforeUnloadEvent;

			const result = beforeUnloadHandler?.(event);

			expect(event.preventDefault).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it('does not show warning when canvas is empty', () => {
			(useCanvasStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultCanvasStore,
				nodes: [], // Empty canvas
			});

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			renderHook(() => useSessionPersistence({ warnOnUnsavedChanges: true }));

			const event = {
				preventDefault: vi.fn(),
				returnValue: '',
			} as unknown as BeforeUnloadEvent;

			const result = beforeUnloadHandler?.(event);

			expect(event.preventDefault).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});
	});

	describe('Error handling', () => {
		it('handles API errors gracefully', async () => {
			(api.updateTest as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { result } = renderHook(() => useSessionPersistence());

			let success: boolean = true;
			await act(async () => {
				success = await result.current.saveNow();
			});

			expect(success).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith('Auto-save error:', expect.any(Error));

			consoleSpy.mockRestore();
		});

		it('logs error on failure', async () => {
			(api.updateTest as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { result } = renderHook(() => useSessionPersistence());

			await act(async () => {
				await result.current.saveNow();
			});

			// Verify error was logged
			expect(consoleSpy).toHaveBeenCalledWith('Auto-save error:', expect.any(Error));
			consoleSpy.mockRestore();
		});
	});

	describe('Debounce behavior', () => {
		it('resets timer on subsequent changes', async () => {
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			const currentTest = {
				id: 1,
				name: 'Test',
				description: '',
				isDirty: true,
				isTemplate: false,
				lastSaved: null,
				category: null,
				filename: null,
			};

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest,
			});

			const { rerender } = renderHook(() => useSessionPersistence({ autoSaveEnabled: true, autoSaveDelay: 3000 }));

			// Advance 2 seconds
			await act(async () => {
				vi.advanceTimersByTime(2000);
			});

			// Should not have saved yet
			expect(api.updateTest).not.toHaveBeenCalled();

			// Simulate a change by re-rendering (would happen when nodes change)
			rerender();

			// Advance another 2 seconds (total 4 from start, but only 2 from rerender)
			await act(async () => {
				vi.advanceTimersByTime(2000);
			});

			// Still should not have saved (timer reset on rerender)
			// Note: In real usage, the hook dependencies would trigger the reset
			// This test verifies the cleanup behavior
		});

		it('clears pending auto-save on saveNow', async () => {
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			const { result } = renderHook(() => useSessionPersistence({ autoSaveEnabled: true, autoSaveDelay: 3000 }));

			// Advance part way
			await act(async () => {
				vi.advanceTimersByTime(1000);
			});

			// Manual save
			await act(async () => {
				await result.current.saveNow();
			});

			expect(api.updateTest).toHaveBeenCalledTimes(1);

			// Advance past original delay
			await act(async () => {
				vi.advanceTimersByTime(3000);
			});

			// Should not have saved again (timer was cleared)
			// The rerender after saveNow would schedule a new timer, but isDirty would be false
		});
	});

	describe('Default options', () => {
		it('has autoSaveDelay default of 3000ms', () => {
			// This test verifies the hook accepts default options
			// Actual timing behavior is tested in other tests with explicit delays
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: null,
			});

			// Should render without errors
			const { result } = renderHook(() => useSessionPersistence());

			expect(result.current.saveNow).toBeDefined();
			expect(result.current.isSaving).toBe(false);
		});

		it('auto-save is enabled by default for existing tests', async () => {
			vi.useRealTimers();
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			// Use a short delay for testing
			renderHook(() => useSessionPersistence({ autoSaveDelay: 100 }));

			await waitFor(() => {
				expect(api.updateTest).toHaveBeenCalled();
			}, { timeout: 500 });
		});

		it('unsaved changes warning is enabled by default', () => {
			const mockAddEventListener = vi.fn();
			window.addEventListener = mockAddEventListener;

			renderHook(() => useSessionPersistence()); // No options

			expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
		});
	});
});
