import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import SystemNode from './SystemNode';
import { useCanvasStore } from '../../stores/canvasStore';

// Mock the useHandleConnection hook
vi.mock('../../hooks/useHandleConnection', () => ({
	useHandleConnection: vi.fn(() => false)
}));

describe('SystemNode', () => {
	const defaultProps: NodeProps = {
		id: 'system-1',
		data: { label: 'System', systemPrompt: 'You are a helpful AI assistant.' },
		type: 'system',
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
					id: 'system-1',
					type: 'system',
					data: { label: 'System', systemPrompt: 'You are a helpful AI assistant.' },
					position: { x: 100, y: 100 }
				}
			],
			edges: [],
			lastCanvasClickPosition: { x: 0, y: 0 }
		});
	});

	describe('Rendering', () => {
		it('should render system node', () => {
			render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(screen.getByText('System')).toBeInTheDocument();
		});

		it('should render with default system prompt', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveValue('You are a helpful AI assistant.');
		});

		it('should render with placeholder text', () => {
			const propsWithoutPrompt = {
				...defaultProps,
				data: { label: 'System' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithoutPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveAttribute('placeholder', 'Enter system prompt...');
		});

		it('should render delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toBeInTheDocument();
		});

		it('should render Settings icon', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const icon = container.querySelector('.node-icon');
			expect(icon).toBeInTheDocument();
		});

		it('should render source handle only', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// Should have only 1 handle (source at bottom)
			const handles = container.querySelectorAll('[data-handlepos]');
			expect(handles.length).toBe(1);
		});
	});

	describe('User Interactions', () => {
		it('should update system prompt on textarea change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea).toBeTruthy();

			fireEvent.change(textarea, { target: { value: 'New system prompt' } });

			expect(textarea.value).toBe('New system prompt');
		});

		it('should call updateNode when system prompt changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			fireEvent.change(textarea, { target: { value: 'Updated prompt' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('system-1', { systemPrompt: 'Updated prompt' });
		});

		it('should call removeNode when delete button is clicked', () => {
			const removeNodeSpy = vi.spyOn(useCanvasStore.getState(), 'removeNode');

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;
			expect(deleteButton).toBeTruthy();

			fireEvent.click(deleteButton);

			expect(removeNodeSpy).toHaveBeenCalledWith('system-1');
		});

		it('should stop propagation on delete button click', () => {
			const stopPropagationSpy = vi.fn();

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;

			const event = new MouseEvent('click', { bubbles: true });
			event.stopPropagation = stopPropagationSpy;

			deleteButton.dispatchEvent(event);

			expect(stopPropagationSpy).toHaveBeenCalled();
		});

		it('should allow multi-line input', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			const multiLineText = 'Line 1\nLine 2\nLine 3';

			fireEvent.change(textarea, { target: { value: multiLineText } });

			expect(textarea.value).toBe(multiLineText);
		});

		it('should allow empty system prompt', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			fireEvent.change(textarea, { target: { value: '' } });

			expect(textarea.value).toBe('');
		});
	});

	describe('State Management', () => {
		it('should initialize with system prompt from data prop', () => {
			const customPrompt = 'Custom system prompt';
			const propsWithCustomPrompt = {
				...defaultProps,
				data: { label: 'System', systemPrompt: customPrompt }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithCustomPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(customPrompt);
		});

		it('should use default system prompt when data.systemPrompt is not provided', () => {
			const propsWithoutPrompt = {
				...defaultProps,
				data: { label: 'System' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithoutPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe('You are a helpful AI assistant.');
		});

		it('should maintain local state for system prompt', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

			// Change prompt
			fireEvent.change(textarea, { target: { value: 'First update' } });
			expect(textarea.value).toBe('First update');

			// Change again
			fireEvent.change(textarea, { target: { value: 'Second update' } });
			expect(textarea.value).toBe('Second update');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// State is maintained
			expect(textarea.value).toBe('Second update');
		});

		it('should handle prompt updates from external source', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

			// Simulate external update
			fireEvent.change(textarea, { target: { value: 'Externally updated prompt' } });

			expect(textarea.value).toBe('Externally updated prompt');
		});
	});

	describe('Styling and CSS Classes', () => {
		it('should apply sentinel-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.sentinel-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply system-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.system-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply nodrag and nopan classes to textarea', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveClass('nodrag');
			expect(textarea).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveClass('nodrag');
			expect(deleteButton).toHaveClass('nopan');
		});

		it('should have resizable textarea', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveClass('resize-y');
		});

		it('should have minimum height for textarea', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveClass('min-h-16');
		});
	});

	describe('Accessibility', () => {
		it('should have title attribute on delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveAttribute('title', 'Delete node');
		});

		it('should have placeholder text for empty textarea', () => {
			const propsWithoutPrompt = {
				...defaultProps,
				data: { label: 'System' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithoutPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea');
			expect(textarea).toHaveAttribute('placeholder', 'Enter system prompt...');
		});
	});

	describe('Edge Cases', () => {
		it('should use default prompt when prompt is empty string', () => {
			const propsWithEmptyPrompt = {
				...defaultProps,
				data: { label: 'System', systemPrompt: '' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithEmptyPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			// Empty string is falsy, so component uses default prompt
			expect(textarea.value).toBe('You are a helpful AI assistant.');
		});

		it('should handle very long system prompt', () => {
			const longPrompt = 'A'.repeat(10000);
			const propsWithLongPrompt = {
				...defaultProps,
				data: { label: 'System', systemPrompt: longPrompt }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithLongPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(longPrompt);
		});

		it('should handle special characters in system prompt', () => {
			const specialPrompt = 'Test <script>alert("xss")</script> & "quotes" \'apostrophes\'';
			const propsWithSpecialPrompt = {
				...defaultProps,
				data: { label: 'System', systemPrompt: specialPrompt }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithSpecialPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(specialPrompt);
		});

		it('should handle common system prompt patterns', () => {
			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

			const commonPrompts = [
				'You are a helpful AI assistant.',
				'You are an expert programmer.',
				'You are a helpful assistant that provides concise answers.',
				'You are a creative writer.',
				'You are a technical support agent.'
			];

			commonPrompts.forEach(prompt => {
				fireEvent.change(textarea, { target: { value: prompt } });
				expect(textarea.value).toBe(prompt);
			});
		});

		it('should handle system prompts with formatting instructions', () => {
			const formattedPrompt = `You are a helpful AI assistant.

Follow these guidelines:
1. Be concise
2. Be accurate
3. Be helpful`;

			const propsWithFormattedPrompt = {
				...defaultProps,
				data: { label: 'System', systemPrompt: formattedPrompt }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithFormattedPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(formattedPrompt);
		});

		it('should handle system prompts with JSON instructions', () => {
			const jsonPrompt = `You are a helpful AI assistant. Always respond in JSON format:
{
  "response": "Your answer here",
  "confidence": 0.95
}`;

			const propsWithJsonPrompt = {
				...defaultProps,
				data: { label: 'System', systemPrompt: jsonPrompt }
			};

			const { container } = render(
				<ReactFlowProvider>
					<SystemNode {...propsWithJsonPrompt} />
				</ReactFlowProvider>
			);

			const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
			expect(textarea.value).toBe(jsonPrompt);
		});
	});
});
