import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import ToolNode from './ToolNode';
import { useCanvasStore } from '../../stores/canvasStore';

// Mock the useHandleConnection hook
vi.mock('../../hooks/useHandleConnection', () => ({
	useHandleConnection: vi.fn(() => false)
}));

describe('ToolNode', () => {
	const defaultProps: NodeProps = {
		id: 'tool-1',
		data: { label: 'Tool', toolName: 'web_search', toolDescription: 'Search the web' },
		type: 'tool',
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
					id: 'tool-1',
					type: 'tool',
					data: { label: 'Tool', toolName: 'web_search', toolDescription: 'Search the web' },
					position: { x: 100, y: 100 }
				}
			],
			edges: [],
			lastCanvasClickPosition: { x: 0, y: 0 }
		});
	});

	describe('Rendering', () => {
		it('should render tool node', () => {
			render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(screen.getByText('Tool')).toBeInTheDocument();
		});

		it('should render with default tool name', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			expect(input).toHaveValue('web_search');
		});

		it('should render with default tool description', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			expect(textarea).toHaveValue('Search the web');
		});

		it('should render with placeholder text for tool name', () => {
			const propsWithoutName = {
				...defaultProps,
				data: { label: 'Tool' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithoutName} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name');
			expect(input).toHaveAttribute('placeholder', 'e.g. web_search');
		});

		it('should render with placeholder text for tool description', () => {
			const propsWithoutDescription = {
				...defaultProps,
				data: { label: 'Tool', toolName: 'web_search' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithoutDescription} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description');
			expect(textarea).toHaveAttribute('placeholder', 'Tool description...');
		});

		it('should render delete button', () => {
			const { container} = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toBeInTheDocument();
		});

		it('should render Wrench icon', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const icon = container.querySelector('.node-icon');
			expect(icon).toBeInTheDocument();
		});

		it('should render both target and source handles', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// Should have 2 handles (target at top, source at bottom)
			const handles = container.querySelectorAll('[data-handlepos]');
			expect(handles.length).toBe(2);
		});
	});

	describe('User Interactions', () => {
		it('should update tool name on input change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			fireEvent.change(input, { target: { value: 'calculator' } });

			expect(input.value).toBe('calculator');
		});

		it('should call updateNode when tool name changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			fireEvent.change(input, { target: { value: 'file_reader' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('tool-1', { toolName: 'file_reader' });
		});

		it('should update tool description on textarea change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			fireEvent.change(textarea, { target: { value: 'New description' } });

			expect(textarea.value).toBe('New description');
		});

		it('should call updateNode when tool description changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			fireEvent.change(textarea, { target: { value: 'Updated description' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('tool-1', { toolDescription: 'Updated description' });
		});

		it('should call removeNode when delete button is clicked', () => {
			const removeNodeSpy = vi.spyOn(useCanvasStore.getState(), 'removeNode');

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;
			fireEvent.click(deleteButton);

			expect(removeNodeSpy).toHaveBeenCalledWith('tool-1');
		});

		it('should stop propagation on delete button click', () => {
			const stopPropagationSpy = vi.fn();

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;

			const event = new MouseEvent('click', { bubbles: true });
			event.stopPropagation = stopPropagationSpy;

			deleteButton.dispatchEvent(event);

			expect(stopPropagationSpy).toHaveBeenCalled();
		});

		it('should allow multi-line description input', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			const multiLineText = 'Line 1\nLine 2\nLine 3';

			fireEvent.change(textarea, { target: { value: multiLineText } });

			expect(textarea.value).toBe(multiLineText);
		});
	});

	describe('State Management', () => {
		it('should initialize with tool name from data prop', () => {
			const customName = 'custom_tool';
			const propsWithCustomName = {
				...defaultProps,
				data: { label: 'Tool', toolName: customName, toolDescription: '' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithCustomName} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			expect(input.value).toBe(customName);
		});

		it('should use default tool name when data.toolName is not provided', () => {
			const propsWithoutName = {
				...defaultProps,
				data: { label: 'Tool' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithoutName} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			expect(input.value).toBe('web_search');
		});

		it('should initialize with tool description from data prop', () => {
			const customDescription = 'Custom tool description';
			const propsWithCustomDescription = {
				...defaultProps,
				data: { label: 'Tool', toolName: 'web_search', toolDescription: customDescription }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithCustomDescription} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			expect(textarea.value).toBe(customDescription);
		});

		it('should use empty description when data.toolDescription is not provided', () => {
			const propsWithoutDescription = {
				...defaultProps,
				data: { label: 'Tool', toolName: 'web_search' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithoutDescription} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			expect(textarea.value).toBe('');
		});

		it('should maintain local state for tool name', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;

			// Change tool name
			fireEvent.change(input, { target: { value: 'new_tool' } });
			expect(input.value).toBe('new_tool');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(input.value).toBe('new_tool');
		});

		it('should maintain local state for tool description', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;

			// Change description
			fireEvent.change(textarea, { target: { value: 'Updated description' } });
			expect(textarea.value).toBe('Updated description');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(textarea.value).toBe('Updated description');
		});
	});

	describe('Styling and CSS Classes', () => {
		it('should apply sentinel-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.sentinel-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply tool-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.tool-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply nodrag and nopan classes to tool name input', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name');
			expect(input).toHaveClass('nodrag');
			expect(input).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to description textarea', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description');
			expect(textarea).toHaveClass('nodrag');
			expect(textarea).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveClass('nodrag');
			expect(deleteButton).toHaveClass('nopan');
		});

		it('should have resizable textarea', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description');
			expect(textarea).toHaveClass('resize-y');
		});
	});

	describe('Accessibility', () => {
		it('should have title attribute on delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveAttribute('title', 'Delete node');
		});

		it('should have label for tool name input', () => {
			render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const label = screen.getByText('Tool Name');
			expect(label).toHaveAttribute('for', 'tool-name');
		});

		it('should have label for description textarea', () => {
			render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const label = screen.getByText('Description');
			expect(label).toHaveAttribute('for', 'tool-description');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty tool name', () => {
			const propsWithEmptyName = {
				...defaultProps,
				data: { label: 'Tool', toolName: '', toolDescription: '' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithEmptyName} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			// Empty string is falsy, so component uses default tool name
			expect(input.value).toBe('web_search');
		});

		it('should handle very long tool name', () => {
			const longName = 'very_long_tool_name_'.repeat(10);
			const propsWithLongName = {
				...defaultProps,
				data: { label: 'Tool', toolName: longName, toolDescription: '' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithLongName} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			expect(input.value).toBe(longName);
		});

		it('should handle very long description', () => {
			const longDescription = 'A'.repeat(10000);
			const propsWithLongDescription = {
				...defaultProps,
				data: { label: 'Tool', toolName: 'web_search', toolDescription: longDescription }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithLongDescription} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			expect(textarea.value).toBe(longDescription);
		});

		it('should handle special characters in tool name', () => {
			const specialName = 'tool-name_with.special@chars#123';
			const propsWithSpecialName = {
				...defaultProps,
				data: { label: 'Tool', toolName: specialName, toolDescription: '' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithSpecialName} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;
			expect(input.value).toBe(specialName);
		});

		it('should handle special characters in description', () => {
			const specialDescription = 'Test <script>alert("xss")</script> & "quotes" \'apostrophes\'';
			const propsWithSpecialDescription = {
				...defaultProps,
				data: { label: 'Tool', toolName: 'web_search', toolDescription: specialDescription }
			};

			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...propsWithSpecialDescription} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('#tool-description') as HTMLTextAreaElement;
			expect(textarea.value).toBe(specialDescription);
		});

		it('should handle common tool name patterns', () => {
			const { container } = render(
				<ReactFlowProvider>
					<ToolNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#tool-name') as HTMLInputElement;

			const commonTools = [
				'web_search',
				'file_reader',
				'calculator',
				'code_interpreter',
				'database_query',
				'api_call'
			];

			commonTools.forEach(tool => {
				fireEvent.change(input, { target: { value: tool } });
				expect(input.value).toBe(tool);
			});
		});
	});
});
