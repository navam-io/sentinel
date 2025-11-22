import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import InputNode from './InputNode';
import { useCanvasStore } from '../../stores/canvasStore';

// Mock the useHandleConnection hook
vi.mock('../../hooks/useHandleConnection', () => ({
	useHandleConnection: vi.fn(() => false)
}));

describe('InputNode', () => {
	const defaultProps: NodeProps = {
		id: 'input-1',
		data: { label: 'Input', query: 'What is the capital of France?' },
		type: 'input',
		selected: false,
		isConnectable: true,
		xPos: 100,
		yPos: 100,
		dragging: false,
		zIndex: 0,
		positionAbsoluteX: 100,
		positionAbsoluteY: 100
	};

	beforeEach(() => {
		// Reset store to initial state
		useCanvasStore.setState({
			nodes: [
				{
					id: 'input-1',
					type: 'input',
					data: { label: 'Input', query: 'What is the capital of France?' },
					position: { x: 100, y: 100 }
				}
			],
			edges: [],
			lastCanvasClickPosition: { x: 0, y: 0 }
		});
	});

	describe('Rendering', () => {
		it('should render input node', () => {
			render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(screen.getByText('Input')).toBeInTheDocument();
		});

		it('should render with default query text', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveValue('What is the capital of France?');
		});

		it('should render with placeholder text', () => {
			const propsWithoutQuery = {
				...defaultProps,
				data: { label: 'Input' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...propsWithoutQuery} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveAttribute('placeholder', 'Enter your prompt...');
		});

		it('should render delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toBeInTheDocument();
		});

		it('should render message square icon', () => {
			render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// MessageSquare icon is rendered
			const icon = document.querySelector('.node-icon');
			expect(icon).toBeInTheDocument();
		});

		it('should render handle for connections', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// React Flow Handle is rendered (source handle at bottom)
			const handles = container.querySelectorAll('[data-handlepos]');
			expect(handles.length).toBeGreaterThan(0);
		});
	});

	describe('User Interactions', () => {
		it('should update query on textarea change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea).toBeTruthy();

			fireEvent.change(textarea, { target: { value: 'New query text' } });

			expect(textarea.value).toBe('New query text');
		});

		it('should call updateNode when query changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			fireEvent.change(textarea, { target: { value: 'Updated query' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('input-1', { query: 'Updated query' });
		});

		it('should call removeNode when delete button is clicked', () => {
			const removeNodeSpy = vi.spyOn(useCanvasStore.getState(), 'removeNode');

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;
			expect(deleteButton).toBeTruthy();

			fireEvent.click(deleteButton);

			expect(removeNodeSpy).toHaveBeenCalledWith('input-1');
		});

		it('should stop propagation on delete button click', () => {
			const stopPropagationSpy = vi.fn();

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;

			const event = new MouseEvent('click', { bubbles: true });
			event.stopPropagation = stopPropagationSpy;

			deleteButton.dispatchEvent(event);

			// The component calls stopPropagation
			expect(stopPropagationSpy).toHaveBeenCalled();
		});

		it('should allow multi-line input', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			const multiLineText = 'Line 1\nLine 2\nLine 3';

			fireEvent.change(textarea, { target: { value: multiLineText } });

			expect(textarea.value).toBe(multiLineText);
		});
	});

	describe('State Management', () => {
		it('should initialize with query from data prop', () => {
			const customQuery = 'Custom initial query';
			const propsWithCustomQuery = {
				...defaultProps,
				data: { label: 'Input', query: customQuery }
			};

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...propsWithCustomQuery} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(customQuery);
		});

		it('should use default query when data.query is not provided', () => {
			const propsWithoutQuery = {
				...defaultProps,
				data: { label: 'Input' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...propsWithoutQuery} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe('What is the capital of France?');
		});

		it('should maintain local state for query', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

			// Change query
			fireEvent.change(textarea, { target: { value: 'First update' } });
			expect(textarea.value).toBe('First update');

			// Change again
			fireEvent.change(textarea, { target: { value: 'Second update' } });
			expect(textarea.value).toBe('Second update');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// State is maintained
			expect(textarea.value).toBe('Second update');
		});
	});

	describe('Styling and CSS Classes', () => {
		it('should apply sentinel-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.sentinel-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply input-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.input-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply nodrag and nopan classes to textarea', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveClass('nodrag');
			expect(textarea).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveClass('nodrag');
			expect(deleteButton).toHaveClass('nopan');
		});

		it('should have resizable textarea', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveClass('resize-y');
		});
	});

	describe('Accessibility', () => {
		it('should have title attribute on delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveAttribute('title', 'Delete node');
		});

		it('should have placeholder text for empty textarea', () => {
			const propsWithoutQuery = {
				...defaultProps,
				data: { label: 'Input' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...propsWithoutQuery} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveAttribute('placeholder', 'Enter your prompt...');
		});
	});

	describe('Edge Cases', () => {
		it('should use default query when query is empty string', () => {
			const propsWithEmptyQuery = {
				...defaultProps,
				data: { label: 'Input', query: '' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...propsWithEmptyQuery} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			// Empty string is falsy, so component uses default query
			expect(textarea.value).toBe('What is the capital of France?');
		});

		it('should handle very long query text', () => {
			const longQuery = 'A'.repeat(10000);
			const propsWithLongQuery = {
				...defaultProps,
				data: { label: 'Input', query: longQuery }
			};

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...propsWithLongQuery} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(longQuery);
		});

		it('should handle special characters in query', () => {
			const specialQuery = 'Test <script>alert("xss")</script> & "quotes" \'apostrophes\'';
			const propsWithSpecialQuery = {
				...defaultProps,
				data: { label: 'Input', query: specialQuery }
			};

			const { container } = render(
				<ReactFlowProvider>
					<InputNode {...propsWithSpecialQuery} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(specialQuery);
		});
	});
});
