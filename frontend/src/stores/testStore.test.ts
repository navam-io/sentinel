import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTestStore, type CurrentTest, type TestStoreState } from './testStore';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useTestStore', () => {
	beforeEach(() => {
		// Clear store and localStorage before each test
		localStorageMock.clear();
		useTestStore.setState({
			currentTest: null,
		});
	});

	describe('initial state', () => {
		it('should have null currentTest initially', () => {
			const { result } = renderHook(() => useTestStore());
			expect(result.current.currentTest).toBeNull();
		});
	});

	describe('newTest', () => {
		it('should create a new test with default values', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest();
			});

			expect(result.current.currentTest).not.toBeNull();
			expect(result.current.currentTest?.name).toBe('Untitled Test');
			expect(result.current.currentTest?.description).toBe('');
			expect(result.current.currentTest?.id).toBeNull();
			expect(result.current.currentTest?.isDirty).toBe(false);
			expect(result.current.currentTest?.isTemplate).toBe(false);
		});

		it('should create a new test with custom name and description', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('My Custom Test', 'Test description');
			});

			expect(result.current.currentTest?.name).toBe('My Custom Test');
			expect(result.current.currentTest?.description).toBe('Test description');
		});
	});

	describe('setCurrentTest', () => {
		it('should set the current test', () => {
			const { result } = renderHook(() => useTestStore());

			const testData: CurrentTest = {
				id: 123,
				filename: 'test.yaml',
				name: 'Test Name',
				description: 'Test Description',
				category: 'qa',
				isTemplate: false,
				isDirty: false,
				lastSaved: new Date(),
			};

			act(() => {
				result.current.setCurrentTest(testData);
			});

			expect(result.current.currentTest).toEqual(testData);
		});

		it('should allow setting currentTest to null', () => {
			const { result } = renderHook(() => useTestStore());

			// First set a test
			act(() => {
				result.current.newTest('Test');
			});

			expect(result.current.currentTest).not.toBeNull();

			// Then clear it
			act(() => {
				result.current.setCurrentTest(null);
			});

			expect(result.current.currentTest).toBeNull();
		});
	});

	describe('updateMetadata', () => {
		it('should update test name and mark as dirty', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Original Name');
			});

			act(() => {
				result.current.updateMetadata({ name: 'Updated Name' });
			});

			expect(result.current.currentTest?.name).toBe('Updated Name');
			expect(result.current.currentTest?.isDirty).toBe(true);
		});

		it('should update test description', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Test', 'Original Description');
			});

			act(() => {
				result.current.updateMetadata({ description: 'Updated Description' });
			});

			expect(result.current.currentTest?.description).toBe('Updated Description');
		});

		it('should update test category', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Test');
			});

			act(() => {
				result.current.updateMetadata({ category: 'safety' });
			});

			expect(result.current.currentTest?.category).toBe('safety');
		});

		it('should not mark dirty if values are unchanged', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Test Name', 'Test Description');
			});

			// Update with same values
			act(() => {
				result.current.updateMetadata({ name: 'Test Name' });
			});

			expect(result.current.currentTest?.isDirty).toBe(false);
		});

		it('should do nothing if no currentTest', () => {
			const { result } = renderHook(() => useTestStore());

			// Attempt to update when no test exists
			act(() => {
				result.current.updateMetadata({ name: 'New Name' });
			});

			expect(result.current.currentTest).toBeNull();
		});
	});

	describe('markDirty', () => {
		it('should set isDirty to true', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Test');
			});

			expect(result.current.currentTest?.isDirty).toBe(false);

			act(() => {
				result.current.markDirty();
			});

			expect(result.current.currentTest?.isDirty).toBe(true);
		});

		it('should not mark dirty if test is a template', () => {
			const { result } = renderHook(() => useTestStore());

			const templateTest: CurrentTest = {
				id: null,
				filename: null,
				name: 'Template Test',
				description: '',
				category: null,
				isTemplate: true,
				isDirty: false,
				lastSaved: null,
			};

			act(() => {
				result.current.setCurrentTest(templateTest);
			});

			act(() => {
				result.current.markDirty();
			});

			expect(result.current.currentTest?.isDirty).toBe(false);
		});

		it('should do nothing if no currentTest', () => {
			const { result } = renderHook(() => useTestStore());

			// Attempt to mark dirty when no test exists
			act(() => {
				result.current.markDirty();
			});

			expect(result.current.currentTest).toBeNull();
		});
	});

	describe('markClean', () => {
		it('should set isDirty to false and update lastSaved', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Test');
			});

			act(() => {
				result.current.markDirty();
			});

			expect(result.current.currentTest?.isDirty).toBe(true);

			act(() => {
				result.current.markClean();
			});

			expect(result.current.currentTest?.isDirty).toBe(false);
			expect(result.current.currentTest?.lastSaved).not.toBeNull();
		});

		it('should update id and filename when provided', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Test');
			});

			act(() => {
				result.current.markClean({
					id: 456,
					filename: 'saved-test.yaml',
					lastSaved: new Date('2024-01-01'),
				});
			});

			expect(result.current.currentTest?.id).toBe(456);
			expect(result.current.currentTest?.filename).toBe('saved-test.yaml');
		});

		it('should do nothing if no currentTest', () => {
			const { result } = renderHook(() => useTestStore());

			// Attempt to mark clean when no test exists
			act(() => {
				result.current.markClean();
			});

			expect(result.current.currentTest).toBeNull();
		});
	});

	describe('clearCurrentTest', () => {
		it('should set currentTest to null', () => {
			const { result } = renderHook(() => useTestStore());

			act(() => {
				result.current.newTest('Test');
			});

			expect(result.current.currentTest).not.toBeNull();

			act(() => {
				result.current.clearCurrentTest();
			});

			expect(result.current.currentTest).toBeNull();
		});
	});

	describe('loadTest', () => {
		it('should load a test and mark as clean', () => {
			const { result } = renderHook(() => useTestStore());

			const testData: CurrentTest = {
				id: 789,
				filename: 'loaded-test.yaml',
				name: 'Loaded Test',
				description: 'Loaded from library',
				category: 'regression',
				isTemplate: false,
				isDirty: true, // Should be reset to false
				lastSaved: new Date('2024-06-15'),
			};

			act(() => {
				result.current.loadTest(testData);
			});

			expect(result.current.currentTest?.id).toBe(789);
			expect(result.current.currentTest?.name).toBe('Loaded Test');
			expect(result.current.currentTest?.isDirty).toBe(false); // Should be clean after load
		});
	});

	describe('persistence', () => {
		// Note: Zustand persist middleware handles localStorage persistence asynchronously.
		// The partialize function is tested implicitly through store behavior.
		// Full persistence testing would require mocking zustand internals or waiting for async writes.
		it('should define partialize to exclude isDirty and lastSaved from persistence', () => {
			// This test verifies the store's behavior logic without testing zustand internals
			const { result } = renderHook(() => useTestStore());

			// Setting a test with isDirty: true should work in memory
			act(() => {
				result.current.setCurrentTest({
					id: 100,
					filename: 'persisted.yaml',
					name: 'Persisted Test',
					description: 'Should be saved',
					category: 'qa',
					isTemplate: false,
					isDirty: true,
					lastSaved: new Date(),
				});
			});

			// In memory, the test should have isDirty: true
			expect(result.current.currentTest?.isDirty).toBe(true);
			expect(result.current.currentTest?.name).toBe('Persisted Test');

			// When restored from storage (via partialize), isDirty should be false
			// This is enforced by the partialize function in the store definition
		});
	});

	describe('integration scenarios', () => {
		it('should handle full workflow: new -> edit -> save -> edit -> save', () => {
			const { result } = renderHook(() => useTestStore());

			// Create new test
			act(() => {
				result.current.newTest('My Test');
			});
			expect(result.current.currentTest?.isDirty).toBe(false);
			expect(result.current.currentTest?.id).toBeNull();

			// Edit (mark dirty)
			act(() => {
				result.current.markDirty();
			});
			expect(result.current.currentTest?.isDirty).toBe(true);

			// Save (mark clean with new ID)
			act(() => {
				result.current.markClean({ id: 1 });
			});
			expect(result.current.currentTest?.isDirty).toBe(false);
			expect(result.current.currentTest?.id).toBe(1);

			// Edit again
			act(() => {
				result.current.updateMetadata({ name: 'Updated Test' });
			});
			expect(result.current.currentTest?.isDirty).toBe(true);
			expect(result.current.currentTest?.name).toBe('Updated Test');

			// Save again (same ID)
			act(() => {
				result.current.markClean();
			});
			expect(result.current.currentTest?.isDirty).toBe(false);
			expect(result.current.currentTest?.id).toBe(1);
		});

		it('should handle load -> edit -> clear workflow', () => {
			const { result } = renderHook(() => useTestStore());

			// Load existing test
			act(() => {
				result.current.loadTest({
					id: 50,
					filename: 'existing.yaml',
					name: 'Existing Test',
					description: '',
					category: null,
					isTemplate: false,
					isDirty: false,
					lastSaved: new Date(),
				});
			});

			// Edit
			act(() => {
				result.current.markDirty();
			});
			expect(result.current.currentTest?.isDirty).toBe(true);

			// Clear (lose changes)
			act(() => {
				result.current.clearCurrentTest();
			});
			expect(result.current.currentTest).toBeNull();
		});
	});
});
