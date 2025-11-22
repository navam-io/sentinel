import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import AssertionNode from './AssertionNode';
import { useCanvasStore } from '../../stores/canvasStore';

// Mock the useHandleConnection hook
vi.mock('../../hooks/useHandleConnection', () => ({
	useHandleConnection: vi.fn(() => false)
}));

describe('AssertionNode', () => {
	const defaultProps: NodeProps = {
		id: 'assertion-1',
		data: { label: 'Assertion', assertionType: 'must_contain', assertionValue: 'Paris' },
		type: 'assertion',
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
					id: 'assertion-1',
					type: 'assertion',
					data: { label: 'Assertion', assertionType: 'must_contain', assertionValue: 'Paris' },
					position: { x: 100, y: 100 }
				}
			],
			edges: [],
			lastCanvasClickPosition: { x: 0, y: 0 }
		});
	});

	describe('Rendering', () => {
		it('should render assertion node', () => {
			render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(screen.getByText('Assertion')).toBeInTheDocument();
		});

		it('should render with default assertion type', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;
			expect(select).toHaveValue('must_contain');
		});

		it('should render with default assertion value', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			expect(input).toHaveValue('Paris');
		});

		it('should render with placeholder text', () => {
			const propsWithoutValue = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: 'must_contain' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithoutValue} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value');
			expect(input).toHaveAttribute('placeholder', 'Expected value...');
		});

		it('should render delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toBeInTheDocument();
		});

		it('should render CheckCircle2 icon', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const icon = container.querySelector('.node-icon');
			expect(icon).toBeInTheDocument();
		});

		it('should render target handle only', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			// Should have only 1 handle (target at top)
			const handles = container.querySelectorAll('[data-handlepos]');
			expect(handles.length).toBe(1);
		});

		it('should render all 5 assertion type options', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;
			const options = select.querySelectorAll('option');

			expect(options.length).toBe(5);
			expect(options[0]).toHaveTextContent('Must Contain');
			expect(options[1]).toHaveTextContent('Must Not Contain');
			expect(options[2]).toHaveTextContent('Regex Match');
			expect(options[3]).toHaveTextContent('Output Type');
			expect(options[4]).toHaveTextContent('Max Latency');
		});
	});

	describe('User Interactions', () => {
		it('should update assertion type on selection change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;
			fireEvent.change(select, { target: { value: 'regex_match' } });

			expect(select.value).toBe('regex_match');
		});

		it('should call updateNode when assertion type changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;
			fireEvent.change(select, { target: { value: 'must_not_contain' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('assertion-1', { assertionType: 'must_not_contain' });
		});

		it('should update assertion value on input change', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			fireEvent.change(input, { target: { value: 'London' } });

			expect(input.value).toBe('London');
		});

		it('should call updateNode when assertion value changes', () => {
			const updateNodeSpy = vi.spyOn(useCanvasStore.getState(), 'updateNode');

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			fireEvent.change(input, { target: { value: 'New value' } });

			expect(updateNodeSpy).toHaveBeenCalledWith('assertion-1', { assertionValue: 'New value' });
		});

		it('should call removeNode when delete button is clicked', () => {
			const removeNodeSpy = vi.spyOn(useCanvasStore.getState(), 'removeNode');

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;
			fireEvent.click(deleteButton);

			expect(removeNodeSpy).toHaveBeenCalledWith('assertion-1');
		});

		it('should stop propagation on delete button click', () => {
			const stopPropagationSpy = vi.fn();

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn') as HTMLElement;

			const event = new MouseEvent('click', { bubbles: true });
			event.stopPropagation = stopPropagationSpy;

			deleteButton.dispatchEvent(event);

			expect(stopPropagationSpy).toHaveBeenCalled();
		});

		it('should allow empty assertion value input', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			fireEvent.change(input, { target: { value: '' } });

			expect(input.value).toBe('');
		});
	});

	describe('State Management', () => {
		it('should initialize with assertion type from data prop', () => {
			const customType = 'output_type';
			const propsWithCustomType = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: customType, assertionValue: 'json' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithCustomType} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;
			expect(select.value).toBe(customType);
		});

		it('should use default assertion type when not provided', () => {
			const propsWithoutType = {
				...defaultProps,
				data: { label: 'Assertion' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithoutType} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;
			expect(select.value).toBe('must_contain');
		});

		it('should initialize with assertion value from data prop', () => {
			const customValue = 'test value';
			const propsWithCustomValue = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: 'must_contain', assertionValue: customValue }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithCustomValue} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			expect(input.value).toBe(customValue);
		});

		it('should use default assertion value when not provided', () => {
			const propsWithoutValue = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: 'must_contain' }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithoutValue} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			expect(input.value).toBe('Paris');
		});

		it('should maintain local state for assertion type', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;

			// Change type
			fireEvent.change(select, { target: { value: 'max_latency_ms' } });
			expect(select.value).toBe('max_latency_ms');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(select.value).toBe('max_latency_ms');
		});

		it('should maintain local state for assertion value', () => {
			const { container, rerender } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;

			// Change value
			fireEvent.change(input, { target: { value: 'Updated value' } });
			expect(input.value).toBe('Updated value');

			// Rerender with same props - should maintain state
			rerender(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			expect(input.value).toBe('Updated value');
		});
	});

	describe('Styling and CSS Classes', () => {
		it('should apply sentinel-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.sentinel-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply assertion-node class', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const node = container.querySelector('.assertion-node');
			expect(node).toBeInTheDocument();
		});

		it('should apply nodrag and nopan classes to select', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type');
			expect(select).toHaveClass('nodrag');
			expect(select).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to input', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value');
			expect(input).toHaveClass('nodrag');
			expect(input).toHaveClass('nopan');
		});

		it('should apply nodrag and nopan classes to delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveClass('nodrag');
			expect(deleteButton).toHaveClass('nopan');
		});
	});

	describe('Accessibility', () => {
		it('should have title attribute on delete button', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const deleteButton = container.querySelector('.node-delete-btn');
			expect(deleteButton).toHaveAttribute('title', 'Delete node');
		});

		it('should have label for assertion type select', () => {
			render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const label = screen.getByText('Type');
			expect(label).toHaveAttribute('for', 'assertion-type');
		});

		it('should have label for assertion value input', () => {
			render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const label = screen.getByText('Value');
			expect(label).toHaveAttribute('for', 'assertion-value');
		});
	});

	describe('Edge Cases', () => {
		it('should handle all assertion types', () => {
			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...defaultProps} />
				</ReactFlowProvider>
			);

			const select = container.querySelector('#assertion-type') as HTMLSelectElement;

			const assertionTypes = [
				'must_contain',
				'must_not_contain',
				'regex_match',
				'output_type',
				'max_latency_ms'
			];

			assertionTypes.forEach(type => {
				fireEvent.change(select, { target: { value: type } });
				expect(select.value).toBe(type);
			});
		});

		it('should handle very long assertion value', () => {
			const longValue = 'A'.repeat(1000);
			const propsWithLongValue = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: 'must_contain', assertionValue: longValue }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithLongValue} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			expect(input.value).toBe(longValue);
		});

		it('should handle special characters in assertion value', () => {
			const specialValue = 'Test <script>alert("xss")</script> & "quotes" \'apostrophes\'';
			const propsWithSpecialValue = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: 'must_contain', assertionValue: specialValue }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithSpecialValue} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			expect(input.value).toBe(specialValue);
		});

		it('should handle regex patterns as assertion value', () => {
			const regexPattern = '^[A-Z][a-z]+$';
			const propsWithRegex = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: 'regex_match', assertionValue: regexPattern }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithRegex} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			expect(input.value).toBe(regexPattern);
		});

		it('should handle numeric values as assertion value', () => {
			const numericValue = '1000';
			const propsWithNumeric = {
				...defaultProps,
				data: { label: 'Assertion', assertionType: 'max_latency_ms', assertionValue: numericValue }
			};

			const { container } = render(
				<ReactFlowProvider>
					<AssertionNode {...propsWithNumeric} />
				</ReactFlowProvider>
			);

			const input = container.querySelector('#assertion-value') as HTMLInputElement;
			expect(input.value).toBe(numericValue);
		});
	});
});
