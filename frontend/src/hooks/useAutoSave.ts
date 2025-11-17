import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { createTest, updateTest } from '../services/api';
import { generateYAML, convertYAMLToTestSpec } from '../lib/dsl/generator';

export interface UseAutoSaveOptions {
	/**
	 * Debounce delay in milliseconds (default: 2000ms)
	 */
	delay?: number;

	/**
	 * Enable/disable auto-save (default: true)
	 */
	enabled?: boolean;

	/**
	 * Name for the test (required for first save)
	 */
	testName?: string;

	/**
	 * Optional description
	 */
	description?: string;
}

export interface UseAutoSaveReturn {
	/** Whether auto-save is currently saving */
	isSaving: boolean;

	/** Last save timestamp */
	lastSaved: Date | null;

	/** Last error during save */
	error: string | null;

	/** Current test ID (if saved) */
	testId: number | null;

	/** Manually trigger a save */
	saveNow: () => Promise<void>;

	/** Set the test ID (for loading existing tests) */
	setTestId: (id: number | null) => void;
}

/**
 * Hook for auto-saving canvas state to the backend.
 *
 * Features:
 * - Debounced auto-save (default 2 seconds after last change)
 * - Automatic create on first save, updates thereafter
 * - Tracks save status and errors
 * - Manual save trigger
 *
 * @example
 * ```tsx
 * const { isSaving, lastSaved, saveNow } = useAutoSave({
 *   testName: 'My Test',
 *   enabled: true,
 * });
 * ```
 */
export function useAutoSave(options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
	const { delay = 2000, enabled = true, testName = 'Untitled Test', description } = options;

	const { nodes, edges } = useCanvasStore();

	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [testId, setTestId] = useState<number | null>(null);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const saveInProgressRef = useRef(false);

	const performSave = async () => {
		// Prevent concurrent saves
		if (saveInProgressRef.current) {
			return;
		}

		// Skip if no nodes (empty canvas)
		if (nodes.length === 0) {
			return;
		}

		try {
			saveInProgressRef.current = true;
			setIsSaving(true);
			setError(null);

			// Generate YAML and TestSpec from current canvas
			const yaml = generateYAML(nodes, edges);
			const spec = convertYAMLToTestSpec(yaml);

			// Canvas state (nodes + edges)
			const canvasState = {
				nodes,
				edges,
			};

			// Create or update test
			if (testId === null) {
				// First save - create new test
				const result = await createTest({
					name: testName,
					spec,
					spec_yaml: yaml,
					canvas_state: canvasState,
					description,
				});

				setTestId(result.id);
			} else {
				// Subsequent saves - update existing test
				await updateTest(testId, {
					spec,
					spec_yaml: yaml,
					canvas_state: canvasState,
				});
			}

			setLastSaved(new Date());
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to save test';
			setError(errorMessage);
			console.error('Auto-save error:', err);
		} finally {
			setIsSaving(false);
			saveInProgressRef.current = false;
		}
	};

	const saveNow = async () => {
		// Clear any pending debounced save
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		await performSave();
	};

	// Auto-save effect (debounced)
	useEffect(() => {
		if (!enabled) {
			return;
		}

		// Clear existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Schedule new save
		timeoutRef.current = setTimeout(() => {
			performSave();
		}, delay);

		// Cleanup on unmount
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [nodes, edges, enabled, delay, testId, testName, description]);

	return {
		isSaving,
		lastSaved,
		error,
		testId,
		saveNow,
		setTestId,
	};
}
