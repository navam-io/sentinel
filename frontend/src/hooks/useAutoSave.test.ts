import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from './useAutoSave';
import * as api from '../services/api';
import * as generator from '../lib/dsl/generator';
import { useCanvasStore } from '../stores/canvasStore';

// Mock modules
vi.mock('../services/api');
vi.mock('../lib/dsl/generator');
vi.mock('../stores/canvasStore');

describe('useAutoSave', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		// Mock canvas store
		(useCanvasStore as any).mockReturnValue({
			nodes: [
				{
					id: '1',
					type: 'input',
					data: { query: 'Test' },
					position: { x: 0, y: 0 },
				},
			],
			edges: [],
		});

		// Mock generator functions
		(generator.generateYAML as any).mockReturnValue('name: Test\nmodel: gpt-5.1');
		(generator.convertYAMLToTestSpec as any).mockReturnValue({
			name: 'Test',
			model: 'gpt-5.1',
			inputs: { query: 'Test' },
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should initialize with default values', () => {
		const { result } = renderHook(() => useAutoSave());

		expect(result.current.isSaving).toBe(false);
		expect(result.current.lastSaved).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.testId).toBeNull();
	});

	it('should not auto-save when disabled', async () => {
		renderHook(() =>
			useAutoSave({
				enabled: false,
			})
		);

		// Wait for debounce delay
		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(api.createTest).not.toHaveBeenCalled();
	});

	it('should create a new test on first save', async () => {
		const mockTestDefinition = {
			id: 1,
			name: 'My Test',
			spec: {},
			version: 1,
		};

		(api.createTest as any).mockResolvedValue(mockTestDefinition);

		const { result } = renderHook(() =>
			useAutoSave({
				testName: 'My Test',
				description: 'Test description',
				enabled: true,
				delay: 1000,
			})
		);

		// Trigger auto-save by advancing timers and waiting for async operations
		await act(async () => {
			vi.advanceTimersByTime(1000);
			await vi.runAllTimersAsync();
		});

		expect(api.createTest).toHaveBeenCalledWith({
			name: 'My Test',
			spec: {
				name: 'Test',
				model: 'gpt-5.1',
				inputs: { query: 'Test' },
			},
			spec_yaml: 'name: Test\nmodel: gpt-5.1',
			canvas_state: {
				nodes: [
					{
						id: '1',
						type: 'input',
						data: { query: 'Test' },
						position: { x: 0, y: 0 },
					},
				],
				edges: [],
			},
			description: 'Test description',
		});

		expect(result.current.testId).toBe(1);
		expect(result.current.lastSaved).not.toBeNull();
		expect(result.current.isSaving).toBe(false);
	});

	it('should update existing test on subsequent saves', async () => {
		(api.createTest as any).mockResolvedValue({ id: 1, name: 'Test', version: 1 });
		(api.updateTest as any).mockResolvedValue({ id: 1, name: 'Test', version: 2 });

		const { result, rerender } = renderHook(() =>
			useAutoSave({
				testName: 'Test',
				enabled: true,
				delay: 1000,
			})
		);

		// First save - create
		await act(async () => {
			vi.advanceTimersByTime(1000);
			await vi.runAllTimersAsync();
		});

		expect(result.current.testId).toBe(1);

		// Simulate canvas change by forcing re-render
		(useCanvasStore as any).mockReturnValue({
			nodes: [
				{
					id: '1',
					type: 'input',
					data: { query: 'Updated' },
					position: { x: 0, y: 0 },
				},
			],
			edges: [],
		});

		rerender();

		// Second save - update
		await act(async () => {
			vi.advanceTimersByTime(1000);
			await vi.runAllTimersAsync();
		});

		expect(api.updateTest).toHaveBeenCalledWith(1, {
			spec: {
				name: 'Test',
				model: 'gpt-5.1',
				inputs: { query: 'Test' },
			},
			spec_yaml: 'name: Test\nmodel: gpt-5.1',
			canvas_state: {
				nodes: [
					{
						id: '1',
						type: 'input',
						data: { query: 'Updated' },
						position: { x: 0, y: 0 },
					},
				],
				edges: [],
			},
		});
	});

	it('should handle save errors', async () => {
		(api.createTest as any).mockRejectedValue(new Error('Save failed'));

		const { result } = renderHook(() =>
			useAutoSave({
				enabled: true,
				delay: 1000,
			})
		);

		await act(async () => {
			vi.advanceTimersByTime(1000);
			await vi.runAllTimersAsync();
		});

		expect(result.current.error).toBe('Save failed');
		expect(result.current.isSaving).toBe(false);
	});

	it('should allow manual save with saveNow', async () => {
		const mockTestDefinition = {
			id: 1,
			name: 'Test',
			spec: {},
			version: 1,
		};

		(api.createTest as any).mockResolvedValue(mockTestDefinition);

		const { result } = renderHook(() =>
			useAutoSave({
				enabled: false, // Disabled, so only manual saves work
			})
		);

		// Manual save
		await act(async () => {
			await result.current.saveNow();
		});

		expect(api.createTest).toHaveBeenCalled();
		expect(result.current.testId).toBe(1);
	});

	it('should not save when canvas is empty', async () => {
		(useCanvasStore as any).mockReturnValue({
			nodes: [],
			edges: [],
		});

		renderHook(() =>
			useAutoSave({
				enabled: true,
				delay: 1000,
			})
		);

		await act(async () => {
			vi.advanceTimersByTime(1000);
			await vi.runAllTimersAsync();
		});

		expect(api.createTest).not.toHaveBeenCalled();
	});

	it('should debounce saves correctly', async () => {
		(api.createTest as any).mockResolvedValue({ id: 1, name: 'Test', version: 1 });

		const { rerender } = renderHook(() =>
			useAutoSave({
				enabled: true,
				delay: 2000,
			})
		);

		// Trigger multiple changes within debounce window
		act(() => {
			vi.advanceTimersByTime(500);
		});
		rerender();

		act(() => {
			vi.advanceTimersByTime(500);
		});
		rerender();

		act(() => {
			vi.advanceTimersByTime(500);
		});
		rerender();

		// Still within debounce window - should not have saved
		expect(api.createTest).not.toHaveBeenCalled();

		// Now exceed debounce delay
		await act(async () => {
			vi.advanceTimersByTime(1000);
			await vi.runAllTimersAsync();
		});

		// Should have saved only once
		expect(api.createTest).toHaveBeenCalledTimes(1);
	});

	it('should allow setting testId externally', () => {
		const { result } = renderHook(() => useAutoSave());

		expect(result.current.testId).toBeNull();

		act(() => {
			result.current.setTestId(42);
		});

		expect(result.current.testId).toBe(42);
	});

	it('should prevent concurrent saves', async () => {
		(api.createTest as any).mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(() => resolve({ id: 1, name: 'Test', version: 1 }), 1000);
				})
		);

		renderHook(() =>
			useAutoSave({
				enabled: true,
				delay: 500,
			})
		);

		// First save triggers
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Before first save completes, try to trigger another
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Advance to complete the first save
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		// Should have only called createTest once despite multiple triggers
		expect(api.createTest).toHaveBeenCalledTimes(1);
	});
});
