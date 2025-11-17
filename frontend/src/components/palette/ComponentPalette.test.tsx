import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentPalette from './ComponentPalette';
import { useCanvasStore } from '../../stores/canvasStore';

// Mock the store
vi.mock('../../stores/canvasStore', () => ({
	useCanvasStore: vi.fn()
}));

describe('ComponentPalette', () => {
	const mockAddNode = vi.fn();
	const mockSetLastClickPosition = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useCanvasStore as any).mockReturnValue({
			addNode: mockAddNode,
			lastCanvasClickPosition: { x: 100, y: 100 },
			setLastClickPosition: mockSetLastClickPosition
		});
	});

	describe('Drag and Drop Prevention', () => {
		it('should not have draggable attribute on component buttons', () => {
			render(<ComponentPalette />);

			const promptButton = screen.getByText('Prompt').closest('button');
			expect(promptButton).not.toHaveAttribute('draggable');
		});

		it('should not have cursor-move class on component buttons', () => {
			render(<ComponentPalette />);

			const promptButton = screen.getByText('Prompt').closest('button');
			expect(promptButton).toHaveClass('cursor-pointer');
			expect(promptButton).not.toHaveClass('cursor-move');
		});

		it('should display "Click to add to canvas" instead of "Drag & drop to canvas"', () => {
			render(<ComponentPalette />);

			expect(screen.getByText('Click to add to canvas')).toBeInTheDocument();
			expect(screen.queryByText('Drag & drop to canvas')).not.toBeInTheDocument();
		});

		it('should not have onDragStart handler on component buttons', () => {
			render(<ComponentPalette />);

			const promptButton = screen.getByText('Prompt').closest('button');

			// Verify button does not have draggable attribute
			expect(promptButton).not.toHaveAttribute('draggable');

			// Verify button has cursor-pointer instead of cursor-move
			expect(promptButton).toHaveClass('cursor-pointer');
		});
	});

	describe('Click to Add Functionality', () => {
		it('should call addNode when a component button is clicked', () => {
			render(<ComponentPalette />);

			const promptButton = screen.getByText('Prompt').closest('button');
			fireEvent.click(promptButton!);

			expect(mockAddNode).toHaveBeenCalledTimes(1);
			expect(mockAddNode).toHaveBeenCalledWith(
				expect.objectContaining({
					id: expect.stringMatching(/^input-\d+$/),
					type: 'input',
					data: expect.objectContaining({
						label: 'Prompt',
						query: 'Enter your query here'
					}),
					position: { x: 100, y: 100 }
				})
			);
		});

		it('should increment position after adding a node', () => {
			render(<ComponentPalette />);

			const promptButton = screen.getByText('Prompt').closest('button');
			fireEvent.click(promptButton!);

			expect(mockSetLastClickPosition).toHaveBeenCalledWith({ x: 100, y: 300 });
		});

		it('should add different node types correctly', () => {
			render(<ComponentPalette />);

			// Test Model node
			const modelButton = screen.getByText('Model').closest('button');
			fireEvent.click(modelButton!);

			expect(mockAddNode).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'model',
					data: expect.objectContaining({
						label: 'Model',
						model: 'gpt-4.1-2025-04-14',
						provider: 'openai'
					})
				})
			);

			// Test Assertion node
			const assertionButton = screen.getByText('Assertion').closest('button');
			fireEvent.click(assertionButton!);

			expect(mockAddNode).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'assertion',
					data: expect.objectContaining({
						label: 'Assertion',
						assertionType: 'must_contain'
					})
				})
			);

			// Test Tool node
			const toolButton = screen.getByText('Tool').closest('button');
			fireEvent.click(toolButton!);

			expect(mockAddNode).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'tool',
					data: expect.objectContaining({
						label: 'Tool',
						toolName: 'tool_name'
					})
				})
			);

			// Test System node
			const systemButton = screen.getByText('System').closest('button');
			fireEvent.click(systemButton!);

			expect(mockAddNode).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'system',
					data: expect.objectContaining({
						label: 'System',
						description: 'System configuration'
					})
				})
			);
		});

		it('should generate unique IDs for each node', async () => {
			render(<ComponentPalette />);

			const promptButton = screen.getByText('Prompt').closest('button');

			// Click multiple times with small delays to ensure unique timestamps
			fireEvent.click(promptButton!);
			await new Promise(resolve => setTimeout(resolve, 5));
			fireEvent.click(promptButton!);
			await new Promise(resolve => setTimeout(resolve, 5));
			fireEvent.click(promptButton!);

			expect(mockAddNode).toHaveBeenCalledTimes(3);

			const ids = mockAddNode.mock.calls.map((call: any) => call[0].id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(3); // All IDs should be unique
		});
	});

	describe('UI Rendering', () => {
		it('should render all component categories', () => {
			render(<ComponentPalette />);

			expect(screen.getByText('Inputs')).toBeInTheDocument();
			expect(screen.getByText('Models')).toBeInTheDocument();
			expect(screen.getByText('Tools')).toBeInTheDocument();
			expect(screen.getByText('Assertions')).toBeInTheDocument();
		});

		it('should render all node types', () => {
			render(<ComponentPalette />);

			expect(screen.getByText('Prompt')).toBeInTheDocument();
			expect(screen.getByText('System')).toBeInTheDocument();
			expect(screen.getByText('Model')).toBeInTheDocument();
			expect(screen.getByText('Tool')).toBeInTheDocument();
			expect(screen.getByText('Assertion')).toBeInTheDocument();
		});

		it('should render component descriptions', () => {
			render(<ComponentPalette />);

			expect(screen.getByText('User input prompt')).toBeInTheDocument();
			expect(screen.getByText('System prompt')).toBeInTheDocument();
			expect(screen.getByText('AI model configuration')).toBeInTheDocument();
			expect(screen.getByText('Agent tool')).toBeInTheDocument();
			expect(screen.getByText('Test assertion')).toBeInTheDocument();
		});

		it('should render app branding', () => {
			render(<ComponentPalette />);

			expect(screen.getByText('Sentinel')).toBeInTheDocument();
			expect(screen.getByText('AI Agent Testing Platform')).toBeInTheDocument();
		});
	});
});
