import { useEffect, useRef, useCallback } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { useTestStore } from '../stores/testStore';
import { generateYAML, parseYAMLToNodes } from '../lib/dsl/generator';
import { createTest, updateTest } from '../services/api';
import type { TestSpec, CanvasState } from '../services/api';

export interface UseSessionPersistenceOptions {
	/**
	 * Auto-save debounce delay in milliseconds (default: 3000ms)
	 */
	autoSaveDelay?: number;

	/**
	 * Enable/disable auto-save (default: true)
	 */
	autoSaveEnabled?: boolean;

	/**
	 * Enable/disable unsaved changes warning (default: true)
	 */
	warnOnUnsavedChanges?: boolean;
}

export interface UseSessionPersistenceReturn {
	/** Whether auto-save is currently saving */
	isSaving: boolean;

	/** Manually trigger a save */
	saveNow: () => Promise<boolean>;

	/** Last auto-save error */
	autoSaveError: string | null;
}

/**
 * Hook for session persistence and auto-save functionality.
 *
 * Features:
 * - Auto-save with 3-second debounce (only for existing saved tests)
 * - Unsaved changes warning on page close/refresh
 * - Integration with unified testStore
 * - Graceful error handling
 *
 * Note: Session persistence of canvas state is handled by Zustand persist
 * middleware in canvasStore and testStore.
 *
 * @example
 * ```tsx
 * const { isSaving, saveNow, autoSaveError } = useSessionPersistence({
 *   autoSaveEnabled: true,
 *   warnOnUnsavedChanges: true,
 * });
 * ```
 */
export function useSessionPersistence(
	options: UseSessionPersistenceOptions = {}
): UseSessionPersistenceReturn {
	const {
		autoSaveDelay = 3000,
		autoSaveEnabled = true,
		warnOnUnsavedChanges = true,
	} = options;

	const { nodes, edges } = useCanvasStore();
	const { currentTest, markClean } = useTestStore();

	const isSavingRef = useRef(false);
	const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const autoSaveErrorRef = useRef<string | null>(null);

	/**
	 * Perform the actual save operation
	 */
	const performSave = useCallback(async (): Promise<boolean> => {
		// Skip if already saving
		if (isSavingRef.current) {
			return false;
		}

		// Skip if no test loaded or no nodes
		if (!currentTest || nodes.length === 0) {
			return false;
		}

		// Skip if test is a template (read-only)
		if (currentTest.isTemplate) {
			return false;
		}

		// Skip if no unsaved changes
		if (!currentTest.isDirty) {
			return true; // Already saved
		}

		try {
			isSavingRef.current = true;
			autoSaveErrorRef.current = null;

			// Generate YAML from canvas
			const yaml = generateYAML(nodes, edges);

			// Parse YAML to get TestSpec
			const { nodes: parsedNodes } = parseYAMLToNodes(yaml);
			if (parsedNodes.length === 0) {
				throw new Error('Failed to parse canvas to YAML');
			}

			// Create canvas state
			const canvasState: CanvasState = { nodes, edges };

			// Parse YAML to TestSpec
			const testSpec: TestSpec = JSON.parse(
				JSON.stringify(
					parsedNodes.reduce((acc: Record<string, unknown>, node) => {
						return { ...acc, ...(node.data as Record<string, unknown>) };
					}, {})
				)
			) as TestSpec;

			if (currentTest.id) {
				// Update existing test
				await updateTest(currentTest.id, {
					name: currentTest.name,
					description: currentTest.description || undefined,
					category: currentTest.category ?? undefined,
					spec: testSpec,
					spec_yaml: yaml,
					canvas_state: canvasState,
				});

				// Mark as clean
				markClean({ lastSaved: new Date() });
			} else {
				// For new tests, we don't auto-save (user should use Save dialog)
				// This prevents accidental creation of unnamed tests
				return false;
			}

			return true;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Auto-save failed';
			autoSaveErrorRef.current = errorMessage;
			console.error('Auto-save error:', err);
			return false;
		} finally {
			isSavingRef.current = false;
		}
	}, [nodes, edges, currentTest, markClean]);

	/**
	 * Manual save trigger
	 */
	const saveNow = useCallback(async (): Promise<boolean> => {
		// Clear any pending auto-save
		if (autoSaveTimeoutRef.current) {
			clearTimeout(autoSaveTimeoutRef.current);
			autoSaveTimeoutRef.current = null;
		}

		return performSave();
	}, [performSave]);

	/**
	 * Auto-save effect - triggers after changes with debounce
	 */
	useEffect(() => {
		if (!autoSaveEnabled) {
			return;
		}

		// Only auto-save for existing tests (those with an ID)
		if (!currentTest?.id || !currentTest.isDirty) {
			return;
		}

		// Clear existing timeout
		if (autoSaveTimeoutRef.current) {
			clearTimeout(autoSaveTimeoutRef.current);
		}

		// Schedule auto-save
		autoSaveTimeoutRef.current = setTimeout(() => {
			performSave();
		}, autoSaveDelay);

		// Cleanup
		return () => {
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}
		};
	}, [autoSaveEnabled, autoSaveDelay, currentTest?.id, currentTest?.isDirty, performSave]);

	/**
	 * Unsaved changes warning effect
	 */
	useEffect(() => {
		if (!warnOnUnsavedChanges) {
			return;
		}

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			// Only warn if there are unsaved changes
			if (currentTest?.isDirty && nodes.length > 0) {
				// Standard way to show browser's native dialog
				e.preventDefault();
				// For older browsers
				e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
				return e.returnValue;
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [warnOnUnsavedChanges, currentTest?.isDirty, nodes.length]);

	return {
		isSaving: isSavingRef.current,
		saveNow,
		autoSaveError: autoSaveErrorRef.current,
	};
}
