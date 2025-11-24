import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestToolbar from './TestToolbar';
import { useCanvasStore } from '../../stores/canvasStore';
import { useTestStore } from '../../stores/testStore';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
	createTest: vi.fn(),
	updateTest: vi.fn(),
}));

// Mock stores
vi.mock('../../stores/canvasStore', () => ({
	useCanvasStore: vi.fn(),
}));

vi.mock('../../stores/testStore', () => ({
	useTestStore: vi.fn(),
}));

// Mock DSL generator
vi.mock('../../lib/dsl/generator', () => ({
	generateYAML: vi.fn(() => 'name: Test\nmodel: gpt-5.1'),
	parseYAMLToNodes: vi.fn(() => ({
		nodes: [{ id: '1', type: 'model', data: { model: 'gpt-5.1' }, position: { x: 0, y: 0 } }],
		edges: [],
	})),
}));

describe('TestToolbar', () => {
	const mockClearCanvas = vi.fn();
	const mockUpdateMetadata = vi.fn();
	const mockMarkClean = vi.fn();
	const mockNewTest = vi.fn();
	const mockClearCurrentTest = vi.fn();

	const defaultCanvasStore = {
		nodes: [{ id: '1', type: 'model', data: {}, position: { x: 0, y: 0 } }],
		edges: [],
		clearCanvas: mockClearCanvas,
	};

	const defaultTestStore = {
		currentTest: null,
		updateMetadata: mockUpdateMetadata,
		markClean: mockMarkClean,
		newTest: mockNewTest,
		clearCurrentTest: mockClearCurrentTest,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useCanvasStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultCanvasStore);
		(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(defaultTestStore);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Rendering', () => {
		it('renders the toolbar with New, Save, and Save As buttons', () => {
			render(<TestToolbar />);

			expect(screen.getByTestId('toolbar-new')).toBeInTheDocument();
			expect(screen.getByTestId('toolbar-save')).toBeInTheDocument();
			expect(screen.getByTestId('toolbar-save-as')).toBeInTheDocument();
		});

		it('displays "New" button text', () => {
			render(<TestToolbar />);
			expect(screen.getByText('New')).toBeInTheDocument();
		});

		it('displays "Save" button text', () => {
			render(<TestToolbar />);
			expect(screen.getByText('Save')).toBeInTheDocument();
		});

		it('displays "Save As" button text', () => {
			render(<TestToolbar />);
			expect(screen.getByText('Save As')).toBeInTheDocument();
		});
	});

	describe('Status Indicator', () => {
		it('shows nothing when no test is loaded', () => {
			render(<TestToolbar />);
			expect(screen.queryByText('● Unsaved')).not.toBeInTheDocument();
			expect(screen.queryByText(/✓ Saved/)).not.toBeInTheDocument();
		});

		it('shows "Unsaved" indicator when test is dirty', () => {
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

			render(<TestToolbar />);
			expect(screen.getByText('● Unsaved')).toBeInTheDocument();
		});

		it('shows "Saved" indicator with timestamp when test is saved', () => {
			const lastSaved = new Date();
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Test',
					description: '',
					isDirty: false,
					isTemplate: false,
					lastSaved,
					category: null,
					filename: null,
				},
			});

			render(<TestToolbar />);
			expect(screen.getByText(/✓ Saved/)).toBeInTheDocument();
		});

		it('shows "Template" indicator for templates', () => {
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: null,
					name: 'Template Test',
					description: '',
					isDirty: false,
					isTemplate: true,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			render(<TestToolbar />);
			expect(screen.getByText('Template')).toBeInTheDocument();
		});
	});

	describe('New Button', () => {
		it('clears canvas and creates new test when clicked', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-new'));

			expect(mockClearCanvas).toHaveBeenCalled();
			expect(mockClearCurrentTest).toHaveBeenCalled();
			expect(mockNewTest).toHaveBeenCalledWith('Untitled Test', '');
		});

		it('shows confirmation when there are unsaved changes', async () => {
			const user = userEvent.setup();
			const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

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

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-new'));

			expect(confirmSpy).toHaveBeenCalledWith(
				'You have unsaved changes. Are you sure you want to create a new test?'
			);
			expect(mockClearCanvas).not.toHaveBeenCalled();

			confirmSpy.mockRestore();
		});

		it('proceeds with new test when confirmation is accepted', async () => {
			const user = userEvent.setup();
			const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

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

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-new'));

			expect(mockClearCanvas).toHaveBeenCalled();
			confirmSpy.mockRestore();
		});
	});

	describe('Save Button', () => {
		it('is disabled when test has no changes', () => {
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

			render(<TestToolbar />);
			expect(screen.getByTestId('toolbar-save')).toBeDisabled();
		});

		it('is enabled when test has unsaved changes', () => {
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

			render(<TestToolbar />);
			expect(screen.getByTestId('toolbar-save')).not.toBeDisabled();
		});

		it('opens save dialog for new tests', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-save'));

			expect(screen.getByText('Save Test')).toBeInTheDocument();
			expect(screen.getByPlaceholderText('e.g., Multi-city Test')).toBeInTheDocument();
		});

		it('saves directly for existing tests with changes', async () => {
			const user = userEvent.setup();
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Existing Test',
					description: 'A test',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: 'qa',
					filename: null,
				},
			});

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			await waitFor(() => {
				expect(api.updateTest).toHaveBeenCalledWith(1, expect.objectContaining({
					name: 'Existing Test',
				}));
			});
		});

		it('shows alert when canvas is empty', async () => {
			const user = userEvent.setup();
			const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

			(useCanvasStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultCanvasStore,
				nodes: [],
			});

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			expect(alertSpy).toHaveBeenCalledWith('Please add nodes to the canvas before saving');
			alertSpy.mockRestore();
		});
	});

	describe('Save As Button', () => {
		it('is disabled when canvas is empty', () => {
			(useCanvasStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultCanvasStore,
				nodes: [],
			});

			render(<TestToolbar />);
			expect(screen.getByTestId('toolbar-save-as')).toBeDisabled();
		});

		it('opens save dialog with (copy) suffix', async () => {
			const user = userEvent.setup();
			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Existing Test',
					description: '',
					isDirty: false,
					isTemplate: false,
					lastSaved: new Date(),
					category: null,
					filename: null,
				},
			});

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save-as'));

			expect(screen.getByText('Save Test As')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Existing Test (copy)')).toBeInTheDocument();
		});

		it('creates new test when saving as', async () => {
			const user = userEvent.setup();
			(api.createTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Existing Test',
					description: '',
					isDirty: false,
					isTemplate: false,
					lastSaved: new Date(),
					category: null,
					filename: null,
				},
			});

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save-as'));

			// Fill in the name and save
			const input = screen.getByDisplayValue('Existing Test (copy)');
			await user.clear(input);
			await user.type(input, 'New Test Name');

			// Click the Save As button inside the dialog footer (not the toolbar button)
			// The dialog footer buttons are inside a div with border-t class
			const dialogFooter = document.querySelector('.border-t.border-sentinel-border.flex.justify-end');
			const saveAsButton = dialogFooter?.querySelector('button:not(:first-child)');
			expect(saveAsButton).toBeDefined();
			expect(saveAsButton?.textContent).toBe('Save As');
			await user.click(saveAsButton!);

			await waitFor(() => {
				expect(api.createTest).toHaveBeenCalledWith(expect.objectContaining({
					name: 'New Test Name',
				}));
			});
		});
	});

	describe('Save Dialog', () => {
		it('shows name, description, and category fields', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-save'));

			expect(screen.getByPlaceholderText('e.g., Multi-city Test')).toBeInTheDocument();
			expect(screen.getByPlaceholderText('Describe what this test does...')).toBeInTheDocument();
			expect(screen.getByText('Category')).toBeInTheDocument();
		});

		it('closes dialog on Cancel button click', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-save'));
			expect(screen.getByText('Save Test')).toBeInTheDocument();

			await user.click(screen.getByRole('button', { name: 'Cancel' }));
			expect(screen.queryByText('Save Test')).not.toBeInTheDocument();
		});

		it('closes dialog on Escape key', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-save'));
			expect(screen.getByText('Save Test')).toBeInTheDocument();

			await user.keyboard('{Escape}');
			expect(screen.queryByText('Save Test')).not.toBeInTheDocument();
		});

		it('saves on Enter key when name is filled', async () => {
			const user = userEvent.setup();
			(api.createTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			const input = screen.getByPlaceholderText('e.g., Multi-city Test');
			await user.clear(input);
			await user.type(input, 'My New Test{Enter}');

			await waitFor(() => {
				expect(api.createTest).toHaveBeenCalled();
			});
		});

		it('shows error when name is empty and save is attempted', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-save'));

			const input = screen.getByPlaceholderText('e.g., Multi-city Test');
			await user.clear(input);

			// Save button in dialog should be disabled
			const dialogButtons = screen.getAllByRole('button');
			const dialogSaveButton = dialogButtons.find(btn => btn.textContent === 'Save' && btn !== screen.getByTestId('toolbar-save'));
			expect(dialogSaveButton).toBeDefined();
			expect(dialogSaveButton).toBeDisabled();
		});

		it('opens category dropdown when clicked', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-save'));

			// Click the category dropdown
			await user.click(screen.getByRole('button', { name: /Uncategorized/i }));

			// Should see category options
			expect(screen.getByText('Q&A')).toBeInTheDocument();
			expect(screen.getByText('Code Generation')).toBeInTheDocument();
		});

		it('selects category when clicked', async () => {
			const user = userEvent.setup();
			render(<TestToolbar />);

			await user.click(screen.getByTestId('toolbar-save'));
			await user.click(screen.getByRole('button', { name: /Uncategorized/i }));
			await user.click(screen.getByText('Q&A'));

			// Dropdown button should now show Q&A
			expect(screen.getByRole('button', { name: /Q&A/i })).toBeInTheDocument();
		});
	});

	describe('Keyboard Shortcuts', () => {
		it('responds to Ctrl+N for new test', async () => {
			render(<TestToolbar />);

			fireEvent.keyDown(window, { key: 'n', ctrlKey: true });

			expect(mockClearCanvas).toHaveBeenCalled();
		});

		it('responds to Ctrl+S for save', async () => {
			render(<TestToolbar />);

			fireEvent.keyDown(window, { key: 's', ctrlKey: true });

			// Should open save dialog since no existing test
			await waitFor(() => {
				expect(screen.getByText('Save Test')).toBeInTheDocument();
			});
		});

		it('responds to Ctrl+Shift+S for save as', async () => {
			render(<TestToolbar />);

			fireEvent.keyDown(window, { key: 's', ctrlKey: true, shiftKey: true });

			await waitFor(() => {
				expect(screen.getByText('Save Test As')).toBeInTheDocument();
			});
		});

		it('responds to Meta+N for new test (Mac)', async () => {
			render(<TestToolbar />);

			fireEvent.keyDown(window, { key: 'n', metaKey: true });

			expect(mockClearCanvas).toHaveBeenCalled();
		});

		it('responds to Meta+S for save (Mac)', async () => {
			render(<TestToolbar />);

			fireEvent.keyDown(window, { key: 's', metaKey: true });

			await waitFor(() => {
				expect(screen.getByText('Save Test')).toBeInTheDocument();
			});
		});

		it('responds to Meta+Shift+S for save as (Mac)', async () => {
			render(<TestToolbar />);

			fireEvent.keyDown(window, { key: 's', metaKey: true, shiftKey: true });

			await waitFor(() => {
				expect(screen.getByText('Save Test As')).toBeInTheDocument();
			});
		});
	});

	describe('Save API Integration', () => {
		it('calls createTest API for new tests', async () => {
			const user = userEvent.setup();
			(api.createTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 123 });

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			const input = screen.getByPlaceholderText('e.g., Multi-city Test');
			await user.clear(input);
			await user.type(input, 'My Test');

			// Click the Save button in the dialog footer
			const dialogFooter = document.querySelector('.border-t.border-sentinel-border.flex.justify-end');
			const dialogSaveButton = dialogFooter?.querySelector('button:not(:first-child)');
			expect(dialogSaveButton).toBeDefined();
			await user.click(dialogSaveButton!);

			await waitFor(() => {
				expect(api.createTest).toHaveBeenCalledWith(
					expect.objectContaining({
						name: 'My Test',
					})
				);
			});
		});

		it('calls updateTest API for existing tests', async () => {
			const user = userEvent.setup();
			(api.updateTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

			(useTestStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
				...defaultTestStore,
				currentTest: {
					id: 1,
					name: 'Existing Test',
					description: '',
					isDirty: true,
					isTemplate: false,
					lastSaved: null,
					category: null,
					filename: null,
				},
			});

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			await waitFor(() => {
				expect(api.updateTest).toHaveBeenCalledWith(1, expect.any(Object));
			});
		});

		it('calls markClean after successful save', async () => {
			const user = userEvent.setup();
			(api.createTest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 456 });

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			const input = screen.getByPlaceholderText('e.g., Multi-city Test');
			await user.type(input, 'My Test');

			// Click the Save button in the dialog (not the toolbar button)
			const dialogButtons = screen.getAllByRole('button');
			const dialogSaveButton = dialogButtons.find(btn => btn.textContent === 'Save' && btn !== screen.getByTestId('toolbar-save'));
			expect(dialogSaveButton).toBeDefined();
			await user.click(dialogSaveButton!);

			await waitFor(() => {
				expect(mockMarkClean).toHaveBeenCalledWith(
					expect.objectContaining({
						id: 456,
					})
				);
			});
		});

		it('shows error message on API failure', async () => {
			const user = userEvent.setup();
			(api.createTest as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			const input = screen.getByPlaceholderText('e.g., Multi-city Test');
			await user.type(input, 'My Test');

			// Click the Save button in the dialog (not the toolbar button)
			const dialogButtons = screen.getAllByRole('button');
			const dialogSaveButton = dialogButtons.find(btn => btn.textContent === 'Save' && btn !== screen.getByTestId('toolbar-save'));
			expect(dialogSaveButton).toBeDefined();
			await user.click(dialogSaveButton!);

			await waitFor(() => {
				expect(screen.getByText(/Failed to save test: Network error/i)).toBeInTheDocument();
			});
		});

		it('shows "Saving..." text while saving', async () => {
			const user = userEvent.setup();
			let resolvePromise: (value: { id: number }) => void;
			const savePromise = new Promise<{ id: number }>((resolve) => {
				resolvePromise = resolve;
			});
			(api.createTest as ReturnType<typeof vi.fn>).mockReturnValue(savePromise);

			render(<TestToolbar />);
			await user.click(screen.getByTestId('toolbar-save'));

			const input = screen.getByPlaceholderText('e.g., Multi-city Test');
			await user.type(input, 'My Test');

			// Click the Save button in the dialog footer
			const dialogFooter = document.querySelector('.border-t.border-sentinel-border.flex.justify-end');
			const dialogSaveButton = dialogFooter?.querySelector('button:not(:first-child)');
			expect(dialogSaveButton).toBeDefined();
			await user.click(dialogSaveButton!);

			// Should show Saving... - there may be multiple but we just need one
			const savingElements = screen.getAllByText('Saving...');
			expect(savingElements.length).toBeGreaterThan(0);

			// Resolve the promise
			resolvePromise!({ id: 1 });

			await waitFor(() => {
				expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
			});
		});
	});

	describe('Button Styling', () => {
		it('highlights Save button when test is dirty', () => {
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

			render(<TestToolbar />);
			const saveButton = screen.getByTestId('toolbar-save');

			// Should have primary background color class
			expect(saveButton).toHaveClass('bg-sentinel-primary');
		});

		it('shows normal styling for Save button when test is clean', () => {
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

			render(<TestToolbar />);
			const saveButton = screen.getByTestId('toolbar-save');

			// Should have normal background color class
			expect(saveButton).toHaveClass('bg-sentinel-bg');
		});
	});
});
