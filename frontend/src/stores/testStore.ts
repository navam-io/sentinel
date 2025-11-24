import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestCategory } from '../types/test-spec';

/**
 * Unified Test Store
 *
 * Single source of truth for test state management.
 * Replaces fragmented state across YamlPreview, TestManager, and canvasStore.
 *
 * Key responsibilities:
 * - Track current test identity (id, filename, name, description, category)
 * - Track dirty state (unsaved changes)
 * - Track template vs user test distinction
 * - Provide unified save/saveAs/load actions
 */

export interface CurrentTest {
	/** Database ID (null if never saved) */
	id: number | null;
	/** YAML filename (e.g., "multi-city-test.yaml", null if never saved) */
	filename: string | null;
	/** Test name */
	name: string;
	/** Test description */
	description: string;
	/** Test category */
	category: TestCategory | null;
	/** Whether this is a read-only template */
	isTemplate: boolean;
	/** Whether there are unsaved changes */
	isDirty: boolean;
	/** Last save timestamp */
	lastSaved: Date | null;
}

export interface TestStoreState {
	/** Current test being edited (null if no test loaded) */
	currentTest: CurrentTest | null;

	// Actions
	/** Set the current test (e.g., when loading from library) */
	setCurrentTest: (test: CurrentTest | null) => void;
	/** Update metadata fields (name, description, category) */
	updateMetadata: (updates: Partial<Pick<CurrentTest, 'name' | 'description' | 'category'>>) => void;
	/** Mark the current test as having unsaved changes */
	markDirty: () => void;
	/** Mark the current test as saved */
	markClean: (updates?: { id?: number; filename?: string; lastSaved?: Date }) => void;
	/** Clear the current test (reset to empty state) */
	clearCurrentTest: () => void;
	/** Create a new unsaved test */
	newTest: (name?: string, description?: string) => void;
	/** Load a test from the library (sets as current) */
	loadTest: (test: CurrentTest) => void;
}

const DEFAULT_TEST: CurrentTest = {
	id: null,
	filename: null,
	name: 'Untitled Test',
	description: '',
	category: null,
	isTemplate: false,
	isDirty: false,
	lastSaved: null,
};

export const useTestStore = create<TestStoreState>()(
	persist(
		(set, get) => ({
			currentTest: null,

			setCurrentTest: (test) => {
				set({ currentTest: test });
			},

			updateMetadata: (updates) => {
				const { currentTest } = get();
				if (!currentTest) return;

				// Only mark dirty if values actually changed
				const hasChanges =
					(updates.name !== undefined && updates.name !== currentTest.name) ||
					(updates.description !== undefined && updates.description !== currentTest.description) ||
					(updates.category !== undefined && updates.category !== currentTest.category);

				set({
					currentTest: {
						...currentTest,
						...updates,
						isDirty: hasChanges ? true : currentTest.isDirty,
					},
				});
			},

			markDirty: () => {
				const { currentTest } = get();
				if (!currentTest || currentTest.isTemplate) return;

				if (!currentTest.isDirty) {
					set({
						currentTest: {
							...currentTest,
							isDirty: true,
						},
					});
				}
			},

			markClean: (updates) => {
				const { currentTest } = get();
				if (!currentTest) return;

				set({
					currentTest: {
						...currentTest,
						id: updates?.id ?? currentTest.id,
						filename: updates?.filename ?? currentTest.filename,
						isDirty: false,
						lastSaved: updates?.lastSaved ?? new Date(),
					},
				});
			},

			clearCurrentTest: () => {
				set({ currentTest: null });
			},

			newTest: (name = 'Untitled Test', description = '') => {
				set({
					currentTest: {
						...DEFAULT_TEST,
						name,
						description,
						isDirty: false,
					},
				});
			},

			loadTest: (test) => {
				set({
					currentTest: {
						...test,
						isDirty: false, // Loading a test starts clean
					},
				});
			},
		}),
		{
			name: 'sentinel-test-storage',
			partialize: (state) => ({
				// Only persist the current test info
				currentTest: state.currentTest
					? {
							id: state.currentTest.id,
							filename: state.currentTest.filename,
							name: state.currentTest.name,
							description: state.currentTest.description,
							category: state.currentTest.category,
							isTemplate: state.currentTest.isTemplate,
							// Don't persist isDirty or lastSaved across sessions
							isDirty: false,
							lastSaved: null,
						}
					: null,
			}),
		}
	)
);
